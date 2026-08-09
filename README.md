# CodeDiff

A free, 100% client-side text and code diff checker — paste two versions of text or code and see
line-level or word-level differences instantly, with hunk navigation, copy, and one-click merge/accept/
revert.

## ✨ Features
- ⚡ Instant line-level or word-level diffing as you type
- 🧭 Step through changes with the hunk navigator and clickable minimap
- 🔀 Merge a change — accept or revert it with one click
- 📋 Copy the full original/changed text, or just a removed/added block
- 📂 Open a file directly (plain text, code, or `.docx`)
- 🔒 100% private — nothing leaves your browser

## 🛠️ Tech Stack
| Category       | Technologies                 |
|----------------|------------------------------|
| Frontend       | React 19, JavaScript (ES6+)  |
| Diffing        | `diff` (jsdiff)              |
| Build Tool     | Vite                         |
| Styling        | Tailwind CSS                 |
| Icons          | Lucide React                 |
| Testing        | Vitest, React Testing Library |
| Deployment     | Netlify                      |

## 🚀 Quick Start
### Prerequisites
- Node.js ≥20
- npm

### Installation
```bash
git clone https://github.com/Tadxss/CodeDiff.git
cd CodeDiff
npm install
cp .env.example .env   # fill in VITE_WEB3FORMS_ACCESS_KEY
npm run dev
```

### Scripts
```bash
npm run dev            # start the dev server
npm run build           # production build → dist/
npm run preview          # preview the production build locally
npm run lint               # ESLint
npm run check-types         # TypeScript check (tsc --noEmit)
npm run format                # Prettier --write
npm run format:check           # Prettier --check
npm test                        # run the Vitest suite
```

See `CLAUDE.md` for the full project structure and conventions.
