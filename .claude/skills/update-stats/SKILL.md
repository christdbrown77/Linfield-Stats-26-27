---
name: update-stats
description: Use when the user says they've updated the Linfield 2012 Girls stats spreadsheet (new match result(s)) and wants the website synced. Reads the Excel workbook, cross-checks the numbers against each other, updates every dependent table in index.html (desktop table + mobile card markup), verifies visually, and reports a summary — all without committing/pushing until the user explicitly confirms.
---

# Update stats from the spreadsheet

Trigger: the user says something like "I updated the spreadsheet with today's result(s) — update the tables."

## 1. Read the source

Workbook: `C:\Users\chris\OneDrive\04. Linfield\Stats\Stats - 26-27.xlsx` (not in this repo).

Read-only with `openpyxl.load_workbook(path, data_only=True)` — never write to this file from this skill, and never use plain `openpyxl` to save it (it strips cached formula values workbook-wide; see `CLAUDE.md`/memory if a write is ever genuinely needed).

If it fails with `PermissionError`, the file is open in Excel on the user's machine — ask them to close it and retry.

Relevant sheets and ranges:

| Sheet | Range | Contents |
|---|---|---|
| `Matches` | `A1:H1` header, rows 2+ | `#`, Opposition, Type, Result, Scored, Conceded, Scorers, Assists — one row per match |
| `Matches` | `K2:K18` | player names (goals-by-game block) |
| `Matches` | `L1:AT1` | game numbers 1–35 (column headers) |
| `Matches` | `L2:AT18` | per-player, per-game goals matrix |
| `Matches` | `AU2:AU18` | each player's season goal total |
| `Season Summary` | `A2:B15` | label/value pairs, in the exact order the site's Season Summary table displays them: Total Matches, Wins, Draws, Losses, Goals Scored, Goals Conceded, Goal Difference, Clean Sheets, Goals per Game, Conceded per Game, Win Rate, Unbeaten Rate, Points Per Game, Form (Last 5) |
| `Goals` | `A2:B…` | Player, Goals — already sorted descending, zero-goal players excluded |
| `last 5 games` | `A3:B…` | Player, Goals — rolling last-5-match window, already sorted descending |

These sheets' formulas already compute everything (including Form Last 5 and the last-5-games rolling window) — read their values directly rather than recomputing from raw match data. Don't touch `Assists`, `Contributions`, or `Stats` — nothing on the site surfaces them.

## 2. Cross-check before touching any HTML

All of these must hold. If any fails, stop and investigate rather than updating the site with inconsistent numbers (a prior recurring bug was a stale Excel dynamic-array spill range silently truncating rows — e.g. `last 5 games` quietly dropping the last 1-2 scorers — so a short list is a red flag, not just a short list):

- `Season Summary` Total Matches == number of data rows in `Matches`.
- Wins + Draws + Losses == Total Matches.
- Sum of `Matches` Scored column == `Season Summary` Goals Scored == `Goals` column sum == goals-by-game grand total (`AU` column sum, equivalently the sum of every per-game column total).
- Sum of `Matches` Conceded column == `Season Summary` Goals Conceded.
- Each goals-by-game column's sum (one game) == that match's Scored value in `Matches`.
- `last 5 games` total == sum of Scored over the most recent 5 matches in `Matches`.

## 3. Update index.html

Only touch sections whose underlying data actually changed (typically Matches, Season Summary, Goalscorers, Goals by Game, Last 5 Games — new match(es) touch all five). Leave Squad, NI Youth Cup Run-in, Last Season, and Player of the Month alone unless the user specifically says those changed.

For each new match, in `.matches-table`:
- Add a `<tr>` before the `<tfoot>` with `#`, Opposition, `class="type-friendly"/"type-cup"/"type-league"` + Type text, `class="win"/"loss"` + Result text (draws get no class, per existing rows), Scored, Conceded.
- Update the `matches-total-row` Scored/Conceded totals.
- Add the matching `<article class="match-card-item win/loss/draw">` to `.matches-card-list` (see existing entries for the exact inner structure: `.match-card-top` with number/type pill/result pill, an `<h2>` for the opposition, `.match-score` with GF/GA columns). Table and card list must stay in sync — every match needs both.

In `.summary-table`: overwrite all 14 `<td>` values in order from `Season Summary!B2:B15`.

In `.goalscorer-table`: rebuild the `<tbody>` rows from the `Goals` sheet (already sorted/filtered), update the `goalscorer-total-row` total, and update the `<h2 id="goalscorer-title">` text (`Goalscorers - N games`) to match the new Total Matches.

In `.goals-by-game-table`: if this sync adds new game number(s), add a `<th>` per new game to `<thead>`, add one `<td>` per new game to every player's `<tr>` (empty, or `<td class="scored">N</td>` for scorers that game), update each row's Total (last `<td>`), and update the `goals-by-game-total-row` (per-game totals + grand total).

In `.last5-table`: rebuild the `<tbody>` entirely from the `last 5 games` sheet (it's a rolling window, not additive) and update the `last5-total-row` total.

## 4. Verify

- Re-read the edited HTML (grep/regex the totals you just wrote) and confirm every number matches what you read from the spreadsheet in step 1 — don't just trust the edit succeeded.
- Start a local server (`python -m http.server 8731` from the repo root) and screenshot the Matches section (both the desktop table and, at a ≤850px viewport, the mobile card list) plus any other section you edited, using Playwright, to confirm nothing broke visually. Kill the server afterward.

## 5. Report and stop

Summarize what changed (match result(s), new totals) and explicitly note you have NOT committed or pushed. Only run `git add`/`git commit`/`git push` after the user confirms (e.g. "yes" / "push") — never on your own initiative, per this repo's established workflow.
