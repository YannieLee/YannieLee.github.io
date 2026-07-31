---
layout: page
title: Archive
permalink: /norobots/archive/
sitemap: false
comments: false
---

<style>
  .archive-lock {
    max-width: 38rem;
    margin: 2rem auto;
  }

  .archive-form {
    display: flex;
    gap: 0.75rem;
  }

  .archive-form input {
    min-width: 0;
    flex: 1;
  }

  .archive-status {
    min-height: 1.5rem;
    margin-top: 0.75rem;
  }

  .archive-entry {
    margin: 2rem 0;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid var(--main-border-color);
  }

  .archive-entry time {
    color: var(--text-muted-color);
    font-size: 0.9rem;
  }

  .archive-entry-body {
    margin-top: 1rem;
    white-space: pre-wrap;
  }
</style>

<section class="archive-lock" aria-labelledby="archive-heading">
  <h1 id="archive-heading">Private Archive</h1>
  <p>Enter the shared passphrase to unlock this archive on your device.</p>
  <form class="archive-form" id="archive-form">
    <input
      class="form-control"
      id="archive-password"
      type="password"
      autocomplete="current-password"
      placeholder="Passphrase"
      required
    >
    <button class="btn btn-primary" type="submit">Unlock</button>
  </form>
  <p class="archive-status" id="archive-status" role="status" aria-live="polite"></p>
</section>

<section id="archive-entries" hidden></section>

<script>
  (() => {
    const AUTH_DATA = new TextEncoder().encode('private-archive-v1');
    const form = document.querySelector('#archive-form');
    const passwordInput = document.querySelector('#archive-password');
    const status = document.querySelector('#archive-status');
    const entriesContainer = document.querySelector('#archive-entries');

    const decodeBase64 = (value) => {
      const binary = atob(value);
      return Uint8Array.from(binary, (character) => character.charCodeAt(0));
    };

    const renderEntries = (entries) => {
      entriesContainer.replaceChildren();

      for (const entry of entries) {
        const article = document.createElement('article');
        article.className = 'archive-entry';

        const heading = document.createElement('h2');
        heading.textContent = entry.title;

        const time = document.createElement('time');
        time.dateTime = entry.createdAt;
        time.textContent = new Intl.DateTimeFormat(undefined, {
          dateStyle: 'long'
        }).format(new Date(entry.createdAt));

        const body = document.createElement('div');
        body.className = 'archive-entry-body';
        body.textContent = entry.body;

        article.append(heading, time, body);
        entriesContainer.append(article);
      }

      entriesContainer.hidden = false;
    };

    const unlock = async (password) => {
      const response = await fetch('/assets/data/archive.json', { cache: 'no-store' });
      if (!response.ok) throw new Error('archive-unavailable');
      const document = await response.json();

      if (document.empty) throw new Error('archive-empty');

      const material = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(password),
        'PBKDF2',
        false,
        ['deriveKey']
      );

      const key = await crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          hash: document.kdf.hash,
          salt: decodeBase64(document.kdf.salt),
          iterations: document.kdf.iterations
        },
        material,
        { name: 'AES-GCM', length: 256 },
        false,
        ['decrypt']
      );

      const plaintext = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: decodeBase64(document.cipher.iv),
          additionalData: AUTH_DATA,
          tagLength: document.cipher.tagLength
        },
        key,
        decodeBase64(document.ciphertext)
      );

      return JSON.parse(new TextDecoder().decode(plaintext));
    };

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      status.textContent = 'Unlocking…';

      try {
        const entries = await unlock(passwordInput.value);
        renderEntries(entries);
        form.hidden = true;
        status.textContent = '';
        passwordInput.value = '';
      } catch (error) {
        status.textContent = error.message === 'archive-empty'
          ? 'The archive has not been initialized yet.'
          : 'Unable to unlock the archive.';
      }
    });
  })();
</script>
