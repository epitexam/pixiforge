# PixiForge

PixiForge is a cross‑platform desktop application that combines a pixel art editor with a live coding environment. It introduces **PixiScript**, a domain‑specific language designed exclusively for generating and manipulating pixel art. The project is built with Tauri, React, and TypeScript, providing a lightweight yet powerful tool for creative coding and procedural pixel art.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Development](#development)
- [Building for Production](#building-for-production)
- [Usage](#usage)
  - [Manual Pixel Editing](#manual-pixel-editing)
  - [PixiScript: Code‑Driven Pixel Art](#pixiscript-code-driven-pixel-art)
  - [Export Options](#export-options)
- [PixiScript Language Reference](#pixiscript-language-reference)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

## Overview

PixiForge is designed for artists, developers, and hobbyists who want to explore the intersection of code and visual art. The application provides a traditional pixel art editor (tiles, layers, palette) and an integrated code editor where you can write **PixiScript** – a safe, constrained language built specifically for pixel manipulation.

The core idea is simple: every time you modify the code, the output is automatically reflected on the canvas. You can mix manual drawing with generated content – for example, generate a base pattern with PixiScript and then refine it by hand using the pixel tools.

## Features

- **Dual‑mode editing** – Switch between manual pixel tools and code‑driven generation.
- **PixiScript live coding** – Built‑in code editor with syntax highlighting for a custom DSL. Changes are evaluated in a secure sandbox and instantly update the canvas.
- **Tile‑based canvas** – Work with tiles of configurable size (e.g., 8×8, 16×16). The canvas can be extended dynamically.
- **Layer support** – Multiple layers with opacity and blending modes.
- **Color palette** – Customizable color palette with common pixel art formats.
- **Export options** – Save your work as PNG images or spritesheets.
- **Cross‑platform** – Runs on Windows, macOS, and Linux thanks to Tauri.
- **Secure by design** – PixiScript has no access to the file system, network, or system APIs.

## Technology Stack

- **Frontend**: React 18 + TypeScript
  - UI components built with Tailwind CSS
  - Canvas manipulation via custom React hooks
  - State management with Zustand
- **Backend**: Rust (Tauri core)
  - Custom PixiScript interpreter/compiler
  - Image export using the `image` crate
- **Build Tool**: Vite
- **Code Editor**: Monaco Editor (customized for PixiScript syntax)

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- [Node.js](https://nodejs.org/) (version 18 or later)
- [Rust](https://www.rust-lang.org/) (version 1.70 or later)
- [Git](https://git-scm.com/)
- System dependencies for Tauri (see [Tauri prerequisites](https://tauri.app/v1/guides/getting-started/prerequisites))

## Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/pixiforge.git
   cd pixiforge
   ```

2. **Install frontend dependencies**

   ```bash
   npm install
   ```

3. **Install Tauri CLI** (if not already installed globally)

   ```bash
   cargo install tauri-cli
   ```

   Alternatively, you can use `npx tauri` commands via the local package.

4. **Run the development server**

   ```bash
   npm run tauri dev
   ```

   This command starts the Vite dev server and launches the Tauri window. The application will automatically reload when you make changes to the frontend or Rust code.

## Development

### Key Scripts

- `npm run dev` – Starts the Vite development server (frontend only).
- `npm run tauri dev` – Starts the full Tauri development environment.
- `npm run build` – Builds the frontend for production.
- `npm run tauri build` – Builds the entire application into platform‑specific bundles.

### Folder Structure

See the [Project Structure](#project-structure) section below for an overview of the repository layout.

## Building for Production

To create a production release for your current platform, run:

```bash
npm run tauri build
```

The installers and executables will be placed in `src-tauri/target/release/`.

For cross‑platform builds, refer to the [Tauri GitHub Actions](https://tauri.app/v1/guides/building/ci) documentation.

## Usage

### Manual Pixel Editing

- Use the toolbar to select tools: pencil, eraser, fill bucket, color picker.
- Choose colors from the palette.
- Draw directly on the canvas. Zoom and pan are supported via mouse wheel and drag.
- Layers can be added, removed, reordered, and toggled.

### PixiScript: Code‑Driven Pixel Art

PixiScript is a purpose-built language for pixel art generation. It provides a clean, intuitive syntax while ensuring safety and predictability.

#### Getting Started

1. Open the code panel (toggle with the "Code" button).
2. Write PixiScript code using the provided objects and functions.
3. Click "Run" (or enable "Live Run") to execute the code. The canvas updates instantly.

#### PixiScript Examples

**Example 1: Generate a checkerboard pattern**

```
pattern checkerboard(size: 16, color1: "#FF0000", color2: "#0000FF") {
  for y in 0..canvas.height {
    for x in 0..canvas.width {
      if (x / tileSize + y / tileSize) % 2 == 0 {
        canvas.setPixel(x, y, color1);
      } else {
        canvas.setPixel(x, y, color2);
      }
    }
  }
}
```

**Example 2: Create a gradient**

```
function gradient() {
  for y in 0..canvas.height {
    for x in 0..canvas.width {
      let intensity = (x + y) / (canvas.width + canvas.height);
      canvas.setPixel(x, y, Color.grayscale(intensity));
    }
  }
}

gradient();
```

**Example 3: Work with tiles**

```
tile playerHead(8, 8) {
  for y in 0..8 {
    for x in 0..8 {
      if x == 0 || x == 7 || y == 0 || y == 7 {
        setPixel(x, y, "#000000");
      } else {
        setPixel(x, y, "#FFAA00");
      }
    }
  }
}

// Place the tile multiple times
for i in 0..5 {
  canvas.placeTile(playerHead, i * 10, 0);
}
```

### Export Options

- **PNG** – Export the entire canvas as a single PNG image.
- **Spritesheet** – Export tiles as a spritesheet with configurable layout (rows, columns, padding).
- **PixiScript** – Save your PixiScript code separately for later reuse.

## PixiScript Language Reference

### Core Concepts

PixiScript is not JavaScript – it's a purpose-built language with the following characteristics:

- **Statically typed** (but type inference makes it feel dynamic)
- **No access to system APIs** (no file I/O, no network)
- **Deterministic execution** (no infinite loops – loops have upper bounds)
- **Built-in pixel art primitives**

### Built-in Objects

#### `canvas`

The main drawing surface.

| Property/Method | Description | Example |
|-----------------|-------------|---------|
| `width` | Width of the canvas in pixels | `canvas.width` |
| `height` | Height of the canvas in pixels | `canvas.height` |
| `setPixel(x, y, color)` | Set a single pixel | `canvas.setPixel(5, 10, "#FF0000")` |
| `getPixel(x, y)` | Get color at position | `let c = canvas.getPixel(5, 10)` |
| `clear(color?)` | Clear canvas (optional fill color) | `canvas.clear("#FFFFFF")` |
| `fillRect(x, y, w, h, color)` | Fill a rectangle | `canvas.fillRect(0, 0, 16, 16, "#00FF00")` |
| `drawLine(x1, y1, x2, y2, color)` | Draw a line | `canvas.drawLine(0, 0, 15, 15, "#000000")` |
| `placeTile(tile, x, y)` | Place a predefined tile at given coordinates | `canvas.placeTile(myTile, 32, 32)` |

#### `Color`

Utility object for color manipulation.

| Method | Description | Example |
|--------|-------------|---------|
| `rgb(r, g, b)` | Create color from RGB values (0-255) | `Color.rgb(255, 0, 0)` |
| `rgba(r, g, b, a)` | Create color with alpha | `Color.rgba(255, 0, 0, 128)` |
| `grayscale(intensity)` | Create grayscale color | `Color.grayscale(0.5)` |
| `fromHex(hex)` | Parse hex color | `Color.fromHex("#FF00FF")` |
| `mix(c1, c2, t)` | Blend two colors | `Color.mix(red, blue, 0.5)` |

#### `tile` keyword

Define reusable tile patterns.

```
tile tileName(width, height) {
  // pixel manipulation using setPixel()
  // can access x, y, width, height
}
```

Inside a tile definition, `setPixel()` refers to the tile's local coordinate system.

#### `pattern` keyword

Define parameterized generators.

```
pattern patternName(param1, param2) {
  // code that uses parameters
}
```

### Control Structures

- `if` / `else` – Conditional execution
- `for` – Loops with numeric ranges (e.g., `for i in 0..10`)
- `while` – Condition-based loops (with safety bounds)
- `function` / `return` – Define reusable functions

### Safety Features

- Maximum loop iterations: 1,000,000
- Maximum recursion depth: 50
- Execution timeout: 100ms
- No `eval`, no dynamic code generation
- No access to global objects beyond the PixiScript API

## Project Structure

```
pixiforge/
├── src-tauri/                    # Rust backend
│   ├── src/
│   │   ├── main.rs               # Entry point, Tauri commands
│   │   ├── pixiscript/           # PixiScript interpreter
│   │   │   ├── lexer.rs
│   │   │   ├── parser.rs
│   │   │   ├── ast.rs
│   │   │   ├── compiler.rs
│   │   │   └── vm.rs              # Virtual machine for execution
│   │   ├── export.rs              # Image export functions
│   │   └── lib.rs                  # Shared utilities
│   ├── Cargo.toml
│   └── tauri.conf.json
├── src/                           # React frontend
│   ├── components/
│   │   ├── Canvas/
│   │   ├── Toolbar/
│   │   ├── Palette/
│   │   ├── CodeEditor/            # Monaco with PixiScript support
│   │   └── ...
│   ├── hooks/
│   │   ├── useCanvas.ts
│   │   └── useTools.ts
│   ├── lib/
│   │   ├── canvasUtils.ts
│   │   └── colorUtils.ts
│   ├── stores/
│   │   ├── canvasStore.ts
│   │   └── toolStore.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Contributing

Contributions are welcome! Areas where help is especially appreciated:

- **PixiScript language design** – New features, syntax improvements
- **Interpreter optimizations** – Make code execution faster
- **Examples library** – Create and share PixiScript patterns
- **UI/UX improvements** – Make the editor more intuitive

Please read our [Code of Conduct](CODE_OF_CONDUCT.md) and submit issues or pull requests on GitHub.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

**PixiForge** – A safe, expressive language for pixel art generation. Where code meets creativity.
