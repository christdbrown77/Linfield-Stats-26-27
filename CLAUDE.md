# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A static stats website for "Linfield 2012 Girls" (youth football team), 2026-27 season. Three files, no build step, no dependencies:

- `index.html` — the entire page
- `css/styles.css` — all styling
- `assets/Linfield_F.C..png` — club crest (used as both the header logo and the favicon)

Deployed via GitHub Pages directly from this repo. There is no package.json, no build/lint/test tooling — changes are made directly to the HTML/CSS and verified visually in a browser.

## Workflow

- **Cache-busting**: `index.html` links the stylesheet as `css/styles.css?v=N`. Bump `N` by 1 any time `css/styles.css` is edited, or returning visitors' browsers will keep serving a stale cached copy.
- **Visual verification before declaring done**: since there's no test suite, changes (especially CSS/layout) must be checked in an actual browser at desktop, tablet, and mobile widths before being considered complete. A quick local server works: `python -m http.server 8731`, then screenshot/view `http://localhost:8731/index.html` — kill the server afterward.
- **Git**: only commit and push when explicitly asked to. Otherwise, apply and describe changes, then wait for confirmation.
- **Data source**: the stats on the site are transcribed from an external Excel workbook (`Stats - 26-27.xlsx`, not in this repo) that the user maintains separately. "Update the tables" requests mean: read the current numbers from that workbook, cross-check them against each other (e.g. goals-by-game column sums should equal the season goal total), then update every dependent table on the site to match.

## Architecture

Everything lives in one `index.html`, structured as a sequence of independent `<section>` blocks, each following the same shape:

```html
<section class="X-section" aria-labelledby="X-title">
  <div class="section-heading">
    <h2 id="X-title">Title</h2>
    <a href="#top" class="back-to-top">&uarr; Top</a>
  </div>
  <div class="X-table-wrap">
    <table class="X-table">...</table>
  </div>
</section>
```

Current sections, in page order: birthday banner, Jump-to contents nav, Squad, Matches, NI Youth Cup Run-in, Season Summary, Goalscorers, Goals by Game, Scorers – Last 5 Games, Last Season, Player of the Month.

Each section is self-contained — its own `X-section`/`X-table-wrap`/`X-table` CSS block, independent of the others. When adding a new section, copy this pattern (including the matching CSS block in `css/styles.css`) rather than trying to generalize/share markup across sections.

### Responsive strategy

Two breakpoints, each with a distinct purpose:

- `@media (max-width: 560px)` — general mobile adjustments: header sizing, contents-nav layout, table cell padding. Most tables just scroll horizontally inside their `*-table-wrap` below this width.
- `@media (max-width: 850px)` — specific to the two widest tables (**Matches** and **NI Youth Cup Run-in**), which swap from a `<table>` to a `.X-card-list` of `<article>` cards. These need the wider breakpoint because their tables clip a column before the general 560px mobile breakpoint kicks in. Each of these sections ships both a `<table>` (hidden via CSS below 850px) and a parallel `<div class="X-card-list">` (hidden via CSS above 850px) — if you edit the data in one, update the other to match.

### Styling conventions

- Color/spacing tokens are defined once as CSS custom properties on `:root` in `css/styles.css` (`--ink`, `--muted`, `--paper`, `--panel`, `--green`, `--green-dark`, `--lime`, `--orange`, `--line`, `--win`, `--loss`, `--draw`, `--shadow`). Reuse these rather than hardcoding colors.
- Result colors (win/loss/draw, via `--win`/`--loss`/`--draw`) are reserved for the Result column. Match-type colors (Friendly/Cup/League) deliberately use a separate palette (purple `#6d28d9`, teal `#0f766e`, slate `#475569`) to avoid collision with result colors — keep these palettes distinct if adding new categorical colors.
- Anchor links (`#top`, jump-nav links, `back-to-top`) rely on `scroll-margin-top` on headings plus `position: sticky` on the header/rule so scrolled-to content isn't hidden under the sticky header — any new anchor target needs the same `scroll-margin-top` treatment.
