# CLAUDE.md — CodeDiff · Project Blueprint

> Reference for Claude Code (and future AI sessions) when making changes to this app.
> Keep this file updated whenever the structure, scripts, or credentials change.

---

## 1. Overview

A free, 100% client-side text/code diff checker by Daryl John Tadeo. Built with React 19, Vite, and
Tailwind CSS 3.4, hosted on Netlify at https://codedifference.netlify.app/. No backend — diffing happens
entirely in the browser. The only network call in the app is the optional contact form (Web3Forms).

## 2. Project Structure

`src/components/DiffChecker.jsx` is a thin orchestrator holding only `showContact` state, calling
`useDiffChecker()`, and composing: `Header`, `Toolbar`, `LineDiffView` or `WordDiffView` (depending on
granularity), two `TextPanel`s (one component rendered twice for the original/changed sides, rather than
duplicating near-identical JSX), `HowItWorks`, `CollabCta`, `BuyMeACoffee`, `ContactModal`, `Footer`, plus
`ErrorBoundary` (top-level crash fallback, wired in `main.jsx`).

- `src/hooks/useDiffChecker.js` — **one combined hook** holding everything: both text values, the
  jsdiff-based `diffModel`/`hunks`/`wordsDiff`/`stats`, hunk navigation + minimap marker positions, copy
  state, file-open handling, and accept/revert-hunk merge logic. Kept as a single hook (like
  `KeyboardTesterPro`, unlike `PdfToBase64`'s split hooks) because granularity, the two text values, the
  derived diff model, and hunk navigation are all interdependent.
- `src/lib/` — framework-agnostic functions, one concern per file:
  - `diffModel.js` — `splitLines`, `buildDiffModel` (turns jsdiff's `diffLines()` output into
    context/hunk row blocks with `partIndices` for later merge/revert)
  - `fileReader.js` — `readTextFromFile` (plain text via `file.text()`, `.docx` via dynamic-imported
    `mammoth/mammoth.browser`) + the `FILE_ACCEPT` extension-list constant
  - `contact.js` — `submitContactForm`, reads the Web3Forms key from env
- `src/test/setup.js` — Vitest + Testing Library setup (jest-dom matchers, RTL `cleanup` after each test).
- Tests are colocated next to the file they cover (`diffModel.js` / `diffModel.test.js`, `ContactModal.jsx`
  / `ContactModal.test.jsx`), not in a separate `tests/` folder.
- No routes, no global state library — all state lives in `useDiffChecker`, except `showContact` which
  stays in the orchestrator (matches every sibling app's convention).
- `src/main.jsx` mounts `<DiffChecker />` (wrapped in `ErrorBoundary`) into `#root`. There is no
  `App.jsx` — it was a trivial one-line wrapper and was removed, same cleanup as every sibling repo.
- The actual diff algorithm (LCS-based line/word diffing) comes from the `diff` (jsdiff) package —
  `buildDiffModel` only builds a presentation model (context vs. hunk blocks, row padding) on top of its
  output; it is not a hand-rolled diff algorithm.
- `index.html` contains all SEO meta tags, Open Graph tags, JSON-LD structured data, and the GA4 snippet
  (hardcoded GA4 ID, not env-based — consistent with every sibling app; GA IDs aren't treated as secrets).

## 3. Build, Dev, and Quality Gates

```
npm install         # install dependencies
npm run dev          # start Vite dev server at http://localhost:5173
npm run build         # production build → dist/
npm run preview       # preview production build locally
npm run lint           # ESLint (flat config), zero warnings expected
npm run check-types     # tsc --noEmit (allowJs, checkJs off — opt-in per file/as files are converted)
npm run format          # Prettier --write over src/**/*.{js,jsx,css}
npm run format:check     # Prettier --check, used in CI
npm test                  # Vitest run (jsdom environment)
```

CI (`.github/workflows/ci.yml`) runs lint → check-types → format:check → test → build on every push/PR to `main`.

Netlify deploys automatically from GitHub on push to main. Build command: `npm run build`, publish dir: `dist`.
`netlify.toml` at the root handles SPA redirects. `dist/`, `.env`, and `.DS_Store` are gitignored (this
repo's `.gitignore` was already correct — `dist/` was never tracked, unlike a couple of the sibling repos).

**Node version note**: this environment runs Node 20.11.0. `eslint`/`@eslint/js` are pinned to `^9`
(their `10.x` majors require `util.styleText`, added in a newer Node) and `jsdom`/
`@testing-library/jest-dom` are pinned to versions whose `engines` range includes Node 20 (their newest
majors require Node 22+). If a fresh `npm install` pulls in a newer major of any of these and things
break, re-pin rather than trying to upgrade Node in this environment.

---

## 4. Credentials

The Web3Forms access key is **not** hardcoded in source — it's read from `VITE_WEB3FORMS_ACCESS_KEY` in
a local, gitignored `.env` (see `.env.example` for the variable name; get the actual value from the
Web3Forms dashboard or a teammate, not from git history). Before this refactor the key was a real,
committed secret in `ContactModal.jsx` — treat it as compromised if it's ever needed for reference.

| Service | Value |
|---|---|
| Web3Forms email | `daryltadss.workemail@gmail.com` |
| Google Analytics 4 ID | `G-RSL09XZXST` (hardcoded in `index.html`, this app's own ID) |
| Live URL | `https://codedifference.netlify.app/` |
| GitHub | `https://github.com/Tadxss/CodeDiff` |

## 5. Design System

Same shared sub-app slate palette, blue accent for primary UI (matches `PdfToBase64`), purple reserved
for the collab CTA / contact modal:

- Background: `bg-slate-900`, Cards: `bg-slate-800`, Header/Footer: `bg-slate-950`
- Primary accent: blue — `text-blue-400`, `bg-blue-600 hover:bg-blue-500`
- Diff colors: additions green (`bg-green-500/20 text-green-300`), removals red (`bg-red-500/20 text-red-300`)
- Text: white headings, `text-slate-300` body, `text-slate-400` muted
- Icons: Lucide React; diff panes use `font-mono`
- Page layout: `flex flex-col min-h-screen` root + `flex-1` on `<main>` to pin the footer

## 6. Core Diffing Logic (in `useDiffChecker` / `lib/diffModel.js`)

- **Line diff**: `diffLines(originalText, changedText)` from `diff`, then `buildDiffModel()` groups the
  flat part list into `context` blocks (unchanged lines, shown both sides) and `hunk` blocks (paired
  removed/added lines, padded to equal row count, each carrying the source `partIndices`).
- **Word diff**: `diffWords()` rendered directly as inline spans — no block-building on top.
- **Hunk navigation**: `currentHunk` + `goToHunk()` scroll the relevant DOM node into view; minimap
  markers are computed from each hunk's `getBoundingClientRect()` position relative to the scroll
  container, recomputed on window resize.
- **Merge (accept/revert)**: `acceptHunk`/`revertHunk` use a hunk's `partIndices` to rebuild
  `originalText`/`changedText` from the raw `diffLines()` output — accept replaces the original side's
  lines with the changed side's; revert does the opposite.
- **File input**: `readTextFromFile()` supports a wide range of plain-text/code extensions via
  `file.text()`, plus `.docx` via `mammoth`.

## 7. ContactModal

Title is **"Get in Touch"** — matches `PdfToBase64`'s convention (the minority pattern; the portfolio and
`FreeJsonFormatterBeautifier` use "Contact the Developer"). The CTA button that opens it also says "Get in
Touch". Form labels use inline Lucide icons, subject line `CodeDiff — Message from ${formData.name}`,
submission through `lib/contact.js` rather than an inline `fetch` in the component.
