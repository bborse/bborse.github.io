# /assets

Source and download files that are *not* referenced by the rendered page markup.

Suggested contents:

| File | Purpose |
|------|---------|
| `press-kit.zip` | Logos, key art and screenshots for press/creators (linked from the footer) |
| `<game>-privacy.pdf` | Signed copy of the privacy policy, if a store listing needs one |
| `fonts/` | Self-hosted Poppins + Inter `.woff2` files, if you drop the Google Fonts CDN |
| `brand/` | Editable studio + game logo sources (`.svg`, `.ai`, `.fig`) |

Anything the browser loads on page render belongs in `/images` instead
(game art lives in `/images/games/<slug>/`).

## Self-hosting the fonts (optional, +5–8 Lighthouse points on slow networks)

1. Download the Poppins (500/600/700/800) and Inter (400/500/600/700) `woff2`
   files into `assets/fonts/`.
2. Add `@font-face` blocks at the top of `css/style.css` with `font-display: swap`.
3. Delete the Google Fonts `<link>` tags in every HTML file and add
   `<link rel="preload" as="font" type="font/woff2" crossorigin href="/assets/fonts/…">`
   for the two faces used above the fold.
