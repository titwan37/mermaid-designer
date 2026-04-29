# 🧜‍♀️ Mermaid Designer

**Mermaid Designer** is a live, interactive editor for [Mermaid.js](https://mermaid.js.org/) built for the **AFA Studio Hub**. It provides a split-pane interface with a powerful code editor on one side and an interactive, zoomable, live-rendered diagram on the other.

It is designed to be deployed as a sub-path service (`/mermaid-designer`) and features a robust integration with modern web technologies to handle advanced Mermaid features like ZenUML, Wardley Maps, C4 models, and custom styling.

---

## ✨ Features

- **Live Preview Engine**: Instantly renders Mermaid diagrams as you type.
- **Advanced Editor**: Uses Monaco Editor (the engine behind VS Code) for syntax highlighting, line numbers, and a familiar coding experience.
- **Interactive Viewer**: Diagrams are rendered inside a `react-zoom-pan-pinch` wrapper, allowing you to fluidly zoom, pan, fit-to-view, and reset complex diagrams.
- **Professional Templates**: Includes a curated library of over 25+ templates (Flowcharts, Sequence, Gantt, Architecture, C4, Git Graphs, Ishikawa, Mindmaps, Packets, Quadrants, Sankeys, Timelines, User Journeys, Wardley Maps, and more).
- **Export Options**: Download your diagrams natively as `.mmd` source files, vector `.svg` files, or rasterized `.png` images using `html2canvas`.
- **Dynamic Theming**: Full support for Light and Dark modes. The application uses a custom, professional "Zinc" neutral color palette that seamlessly switches text colors, backgrounds, and Monaco Editor themes for optimal contrast and readability.
- **Robust Error Handling**: Real-time syntax validation with intelligent hints for lexical errors directly overlaid on the viewer.

---

## 🛠️ Technology Stack

- **Framework**: Next.js (App Router)
- **UI Library**: React 19
- **Styling**: Tailwind CSS (with custom CSS variables for dynamic theming)
- **Editor**: `@monaco-editor/react`
- **Diagramming Engine**: `mermaid` (v11.x) with `@mermaid-js/mermaid-zenuml`
- **Interaction**: `react-zoom-pan-pinch` for SVG manipulation
- **Icons**: `lucide-react`
- **Exporting**: `html2canvas`

---

## 🏗️ Project Architecture

```text
c:\Dev\mermaid-designer\
├── app/
│   ├── editor/
│   │   ├── components/
│   │   │   ├── ActionBar.tsx        # Action buttons (Load, Download, Copy)
│   │   │   └── TemplateSelect.tsx   # Dropdown to fetch templates via absolute paths
│   │   ├── utils/
│   │   │   └── errorBoundary.tsx    # Catches React rendering crashes
│   │   ├── EditorPage.tsx           # Main split-pane layout and resizer logic
│   │   └── MermaidViewer.tsx        # Handles Mermaid API, SVG injection, and zoom/pan
│   ├── globals.css                  # Custom Zinc theme variables and Tailwind directives
│   ├── layout.tsx                   # ThemeContext provider and async Mermaid init
│   └── page.tsx                     # Entry point
├── lib/
│   └── mermaid-config.ts            # Mermaid initialization and ZenUML registration
├── public/
│   └── templates/                   # Directory containing all .mmd template files
├── deploy.yml                       # Ansible playbook for IONOS server deployment
├── deploy.ps1                       # Local PowerShell wrapper for deployment
├── next.config.js                   # Next.js config (sets basePath: '/mermaid-designer')
└── tailwind.config.ts               # Theme definitions (primary, accent)
```

---

## 🚀 Deployment & Infrastructure

The Mermaid Designer is deployed as part of the broader **AFA Studio Hub** on an IONOS Linux server.

- **Port**: Runs internally on `3033`.
- **Process Management**: Managed via PM2 (`pm2 start npm --name "mermaid-designer" -- start`).
- **Routing**: 
  - Served via Nginx as a direct proxy under the `/mermaid-designer` sub-path.
  - Requires `basePath: '/mermaid-designer'` in `next.config.js` to ensure Next.js routing, static assets, and `_next` chunks do not conflict with the root domain.
  - Templates are fetched using absolute paths (e.g., `/mermaid-designer/templates/flowchart_advanced.mmd`) to prevent routing leaks into fallback handlers (like OpenClaw).
- **Automation**: Deployed automatically via the `deploy.yml` Ansible playbook which handles dependency installation, Next.js building, and PM2 restarts.

---

## 💻 Local Development

To run the project locally on your machine:

1. **Install Dependencies**:
   ```bash
   npm install --legacy-peer-deps
   ```
   *(Note: `--legacy-peer-deps` may be required due to React 19 compatibility with certain third-party libraries).*

2. **Start the Development Server**:
   ```bash
   npm run dev
   ```

3. **Open in Browser**:
   Navigate to `http://localhost:3000/mermaid-designer` (Note the sub-path is required even locally due to `basePath` configuration).

---

## 🎨 Theming & Styling Notes

The application uses a unified class-based dark mode (`.dark` on `html`/`body`). 
In `app/globals.css`, the `:root` and `.dark` selectors define RGB variables for foreground and background colors. These are utilized by the `body` gradient to create a clean, neutral Zinc-based aesthetic that avoids heavy color tints, ensuring high visibility for diagrams whether the user prefers light or dark mode. 

The `ActionBar.tsx` uses custom Tailwind rules (`text-slate-900 dark:text-white`) to guarantee button readability regardless of the primary theme color.
