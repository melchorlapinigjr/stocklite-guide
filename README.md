# StockLite user guide

A responsive, static help center for StockLite. This public repository contains documentation and screenshots only.

## Update the content

The editable source is `content/user-guide.md`. Each level-two heading becomes a chapter. Screenshots live in `assets/images/`; image references in the source use `../assets/images/`, which works on GitHub and on the generated chapter pages.

```sh
npm ci
npm run build
npm run check
npm run preview
```

Open http://127.0.0.1:4173. Node.js 20+ is required for building; Python 3 is used only for the local preview. The published website has no runtime dependencies, accounts, analytics, or external font requests. Search runs in the visitor's browser.

Commit the regenerated `index.html`, `guide/` pages, and `assets/search-index.json` along with source changes. GitHub Pages serves the checked-in files directly from `main` at `/ (root)`. The `.nojekyll` file prevents Jekyll processing.

## Styling and behavior

- `scripts/build.mjs`: page layout, chapter metadata, and Markdown rendering.
- `assets/style.css`: responsive layout, typography, screenshot framing, and print styles.
- `assets/app.js`: search, mobile navigation, image enlargement, and chapter print action.
- `scripts/check.mjs`: checks local links, anchors, headings, and search entries.

Markdown is trusted editorial input. Review contributions before building and publishing.

## Screenshots

The 13 images are real Android app captures, cropped and resized without changing controls or values. Most were captured on 23 October 2026. Inventory search and stock actions use earlier demo captures with controls checked against the current app. Both light and dark themes are shown. Quantities, dates, and monetary amounts are illustrative.

Replace screenshots and their alt text/captions together whenever the interface changes. The overview's example product is an illustration, not an app screenshot.

## Publication

GitHub repository: https://github.com/melchorlapinigjr/stocklite-guide

Expected Pages address after enabling Pages: https://melchorlapinigjr.github.io/stocklite-guide/

In repository Settings → Pages, choose Deploy from a branch, then `main` and `/ (root)`, and save.
