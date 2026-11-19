# Neon Shores — GTA 6 Style Cover Maker

[![gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/c/gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/reyxnal/makefun-gta6-cover-art-01-v3/rank.svg)](https://make.fun/c/gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/reyxnal/makefun-gta6-cover-art-01-v3/reward.svg)](https://make.fun/c/gta6-cover-art-01)

**Neon Shores** turns any photo and caption into GTA 6-style cover art — the
multi-panel poster look with chrome lettering and a Vice City neon grade —
entirely offline in the browser. Export a share-ready PNG in seconds.

## What it does

- **Any photo** — upload your own, or load the three procedural sample scenes
  (Sunset Boulevard, Neon Pier, Palm Avenue) painted in code. Fill all panels
  with one photo or give each panel its own.
- **Crop & position each panel** — click a panel, drag it on the canvas, scroll
  to zoom, or use the zoom / pan sliders.
- **Multi-panel covers** — three layouts: Nights (hero + two + strip), Triptych
  (three tall panels), Duo (two panels + banner).
- **Four neon grades** — Neon Nights, Sunset Vice, Palm Noir, Pastel Dawn, plus
  glow and film-grain finish.
- **Fast & easy** — photo to PNG in three steps, in 1080×1080, 1080×1350 or
  1920×1080, exported as a PNG download.
- **100% offline** — no network requests, no uploads. No Rockstar artwork,
  logos or fonts are used; all lettering is drawn from system fonts and every
  sample scene is generated in code.

## Screenshots

The four screenshots in `screenshots/` are taken from this app in headless
Chromium: the landscape cover first, then the editor with a photo loaded, then
the square and portrait covers the app exported.

## Try it

Serve `app/` with any static file server and open `index.html`, for example:

```sh
python3 -m http.server 8080 --directory app
```

Then open http://localhost:8080, load a photo, write a caption, and hit
**Export PNG**.

## Layout

- `app/index.html` — editor page
- `app/style.css` — neon night theme
- `app/src/main.js` — editor wiring and screenshot mode
- `app/src/render.js` — the multi-panel cover renderer
- `app/src/grades.js` — the four neon grade presets
- `app/src/samples.js` — procedural sample scenes drawn in code
- `main.ts` — the make.fun entry program (copies the app and writes the dossier)

Built for the [gta6-cover-art-01 competition](https://make.fun/c/gta6-cover-art-01) on make.fun.
