# ReactrOS (Web Desktop)

A web-based desktop environment inspired by classic operating systems. Built with React and TypeScript, this project provides a customizable desktop experience in your browser.

---

## 🚀 Features (Planned)

- **Icon Grid & Layout**  
  - Drag-and‑drop icons with grid snapping  
  - Adjustable padding, row/column gaps, and icon sizing  
- **Window Management**  
  - Move, resize, minimize, and maximize windows  
- **Taskbar**  
  - Launch and switch between apps  
- **Themes & Custom Layouts**
- **Local-Only Storage**  
  - All settings and data persist in your browser  
- **Built‑in Editor**  
  - “Save” and edit custom desktop configurations

---

## Status

> **Experimental & WIP**  
> Features and UI are under active development. Some components may not yet be fully functional.


## 🧰 Tech Stack

- **Framework:** React + TypeScript  
- **Bundler:** Vite

## 🎬 Quick Start

1. Clone the repo  
   ```bash
   git clone https://github.com/Tyler-Csurilla/ReactrOS.git
   cd ReactrOS

2. Install dependencies: `pnpm install`
3. Start the dev server: `pnpm dev`

---

Feel free to explore or contribute!

---


# 🔍 Features:


### [ Debug Tool UI ]

![til](https://github.com/Tyler-Csurilla/ReactrOS/blob/main/repo_assets/debug_demo.gif?raw=true)
### Debug Panels & Visualizers (WIP)

- **Icon Grid Visualizer**  
  Instantly inspect every desktop icon’s layout in real time:  
  - See exact X/Y coordinates for icon placement  
  - Monitor live layout parameters: padding, row gap, column gap, icon size  

- **Context Data Inspector**  
  Browse client‑side session data at a glance:  
  - View current theme and background‑manager settings  
  - List all desktop icons and their metadata  
  - Drill into any other in‑memory state for faster debugging  

> These tools update dynamically as you tweak your configuration, providing immediate feedback on how layout and data changes affect the desktop.
