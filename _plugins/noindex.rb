Jekyll::Hooks.register :pages, :post_render do |page|
  next unless page.data["noindex"]
  next unless page.output_ext == ".html"

  directive = '<meta name="robots" content="noindex, nofollow, noarchive">'
  page.output = page.output.sub("</head>", "#{directive}</head>")
end
