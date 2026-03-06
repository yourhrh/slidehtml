# SlideHTML

[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-yourhrh-FFDD00?style=flat&logo=buy-me-a-coffee&logoColor=black)](https://buymeacoffee.com/yourhrh)

**The presentation tool for the AI age.**
Use Claude Code, Gemini CLI, or Cursor to build slides — SlideHTML turns any HTML file into a presentation, live.

---

## Why HTML?

Every other presentation format has the same problem: LLMs can't speak it natively.

| Tool | Format | LLM can generate? |
|------|--------|:-----------------:|
| PowerPoint / Keynote | Binary | ✗ |
| Gamma | Proprietary | ✗ |
| Marp | Markdown | △ (layout limits) |
| **SlideHTML** | **HTML** | **✓** |

HTML is what LLMs are best at. That means full creative control — CDN libraries, animations, 3D, charts, video embeds. No constraints. And since it's just files, it's Git-friendly by default.

---

## How it works

```
1. Open a folder in SlideHTML
         ↓
2. CLAUDE.md / GEMINI.md are auto-generated
         ↓
3. Run Claude Code or Gemini CLI in your terminal
   "Make slides/01.html. Investor pitch title slide."
         ↓
4. LLM writes the HTML file
         ↓
5. SlideHTML detects the change instantly — slide appears live
         ↓
6. Hit present. Done.
```

No copy-paste. No export step. Just talk to your AI and present.

---

## Install

Download the latest release for your platform:

**[→ Download from GitHub Releases](../../releases/latest)**

| Platform | File |
|----------|------|
| macOS (Apple Silicon / Intel) | `slidehtml-x.x.x.dmg` |
| Windows | `slidehtml-x.x.x-setup.exe` |
| Linux | `slidehtml-x.x.x.AppImage` |

---

## Features

- **Live reload** — Files change, slides update. No refresh needed.
- **Real Chromium rendering** — Every slide runs in an isolated webview. CDN libraries, fonts, animations all work.
- **Presentation mode** — Fullscreen. Arrow keys, Space to advance. ESC to exit.
- **Recent projects** — One click to reopen any previous project.
- **Terminal launcher** — Open your terminal at the project folder, right from the app.
- **Auto-generated AI instructions** — `CLAUDE.md` and `GEMINI.md` are created automatically, kept up to date as you add slides.

---

## Project structure

```
my-presentation/
├── .slidehtml/
│   └── config.json       ← { "width": 1280, "height": 720 }
├── slides/
│   ├── 01.html
│   ├── 02.html
│   └── 03.html
├── CLAUDE.md             ← Auto-generated instructions for Claude Code
└── GEMINI.md             ← Auto-generated instructions for Gemini CLI
```

Each slide is a standalone HTML file. The body is sized to your resolution — SlideHTML scales it to fit any screen.

---

## Development

```bash
npm install
npm run dev
```

```bash
# Build for your platform
npm run build:mac
npm run build:win
npm run build:linux
```

---

## Roadmap

- **v1** — Live HTML slides with Claude Code / Gemini CLI ← *you are here*
- **v2** — PDF export, presenter notes, slide timer
- **v3** — Presenter view (second monitor), laser pointer mode

---

## The meta part

This app was built with Claude Code.
The launch slides were presented with SlideHTML.

---

MIT License
