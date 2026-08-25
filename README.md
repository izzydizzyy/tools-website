# Internet Toolbox | tools-website

A simple collection of browser-based developer utilities made by `izzy.js`.
NEW: You can do it @ https://tools.izzyy.me

I'll be pushing new updates here & there, stay tuned!

## Live Updates

The site now has a **Live Updates** panel at the top that pulls straight from the
[GitHub REST API](https://docs.github.com/en/rest) for this repo — no backend required:

- Latest commit (message + link)
- Default branch
- Open issue count
- Star / fork count
- A rolling list of the 5 most recent pushes

It hits `https://api.github.com/repos/izzydizzyy/tools-website` and
`.../commits` directly from the browser and has a manual **Refresh** button.
Note that unauthenticated GitHub API requests are rate-limited (60/hour per IP),
so heavy refreshing may temporarily show "Unavailable."

## Included tools

**Developer**
- JSON Formatter / Validator
- Base64 Encode / Decode
- UUID Generator
- Password Generator
- URL Encoder / Decoder
- Hash Generator (SHA-1 / SHA-256 / SHA-384 / SHA-512)
- JWT Decoder
- Regex Tester

**Discord**
- Discord Timestamp Generator
- Discord Snowflake Decoder
- Embed JSON Builder

**Web & Text**
- HEX / RGB / HSL Color Converter
- Markdown Preview
- Text Case Converter (UPPER / lower / Title / Sentence / camelCase / snake_case / kebab-case)
- Word & Character Counter
- Lorem Ipsum Generator
- Slug Generator

## Run locally

No setup is required.

Open `index.html` in your browser, or run a small local server:

```powershell
py -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Deploy with GitHub Pages

1. Upload these files to a GitHub repository.
2. Open the repository settings.
3. Go to **Pages**.
4. Deploy from the `main` branch.
5. Add your custom domain, such as `tools.izzyy.me`.
6. Point your Cloudflare DNS record to GitHub Pages as needed.

Everything in the current version runs client-side, including the Live Updates panel
(it calls the public GitHub API directly from the browser — nothing is stored or proxied).
