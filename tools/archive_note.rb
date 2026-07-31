#!/usr/bin/env ruby

require "base64"
require "io/console"
require "json"
require "openssl"
require "pathname"
require "securerandom"
require "time"

ITERATIONS = 310_000
AUTH_DATA = "private-archive-v1"
ROOT = Pathname.new(__dir__).parent
ARCHIVE_PATH = ROOT.join("assets", "data", "archive.json")

def read_secret(prompt)
  print prompt
  value = STDIN.noecho(&:gets)&.chomp
  puts
  value
end

def derive_key(password, salt, iterations)
  OpenSSL::PKCS5.pbkdf2_hmac(password, salt, iterations, 32, "sha256")
end

def decrypt_archive(document, password)
  salt = Base64.strict_decode64(document.fetch("kdf").fetch("salt"))
  iterations = document.fetch("kdf").fetch("iterations")
  iv = Base64.strict_decode64(document.fetch("cipher").fetch("iv"))
  sealed = Base64.strict_decode64(document.fetch("ciphertext"))
  ciphertext = sealed[0...-16]
  tag = sealed[-16..]

  cipher = OpenSSL::Cipher.new("aes-256-gcm")
  cipher.decrypt
  cipher.key = derive_key(password, salt, iterations)
  cipher.iv = iv
  cipher.auth_tag = tag
  cipher.auth_data = AUTH_DATA
  plaintext = cipher.update(ciphertext) + cipher.final
  JSON.parse(plaintext)
end

def encrypt_archive(entries, password)
  salt = SecureRandom.random_bytes(16)
  iv = SecureRandom.random_bytes(12)
  cipher = OpenSSL::Cipher.new("aes-256-gcm")
  cipher.encrypt
  cipher.key = derive_key(password, salt, ITERATIONS)
  cipher.iv = iv
  cipher.auth_data = AUTH_DATA
  ciphertext = cipher.update(JSON.generate(entries)) + cipher.final
  sealed = ciphertext + cipher.auth_tag

  {
    "version" => 1,
    "kdf" => {
      "name" => "PBKDF2",
      "hash" => "SHA-256",
      "iterations" => ITERATIONS,
      "salt" => Base64.strict_encode64(salt)
    },
    "cipher" => {
      "name" => "AES-GCM",
      "iv" => Base64.strict_encode64(iv),
      "tagLength" => 128
    },
    "ciphertext" => Base64.strict_encode64(sealed)
  }
end

if $PROGRAM_NAME == __FILE__
  document = JSON.parse(ARCHIVE_PATH.read)
  password = read_secret("Archive passphrase: ")
  abort "Passphrase cannot be empty." if password.nil? || password.empty?

  if document["empty"]
    confirmation = read_secret("Confirm passphrase: ")
    abort "Passphrases do not match." unless password == confirmation
    entries = []
  else
    begin
      entries = decrypt_archive(document, password)
    rescue OpenSSL::Cipher::CipherError, JSON::ParserError, KeyError, ArgumentError
      abort "Unable to unlock archive. Check the passphrase."
    end
  end

  print "Title: "
  title = STDIN.gets&.chomp.to_s.strip
  abort "Title cannot be empty." if title.empty?

  puts "Write the note below. Finish with a line containing only .done"
  lines = []
  while (line = STDIN.gets)
    break if line.chomp == ".done"
    lines << line
  end
  body = lines.join.strip
  abort "Note cannot be empty." if body.empty?

  entries.unshift(
    {
      "id" => SecureRandom.uuid,
      "createdAt" => Time.now.iso8601,
      "title" => title,
      "body" => body
    }
  )

  encrypted = encrypt_archive(entries, password)
  ARCHIVE_PATH.write(JSON.pretty_generate(encrypted) + "\n")
  puts "Encrypted archive updated: #{ARCHIVE_PATH}"
  puts "Entries: #{entries.length}"
end
