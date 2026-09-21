# Papyrbound

Papyrbound is a desktop reading library for EPUBs and illustrated books. It pairs a focused, tactile library experience with a lightweight desktop shell.

## Stack

- [Next.js](https://nextjs.org/) and React for the interface
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Tauri](https://tauri.app/) for the desktop application

## Requirements

- Node.js 20 or later
- Rust (the stable toolchain)
- The platform prerequisites required by [Tauri](https://v2.tauri.app/start/prerequisites/)

## Getting started

Install the JavaScript dependencies:

```bash
npm install
```

Run the interface in a browser:

```bash
npm run dev
```

Then visit [http://localhost:3000](http://localhost:3000).

Run Papyrbound as a desktop app:

```bash
npm run tauri dev
```

The Tauri command starts the Next.js development server when one is not already running. If port `3000` is occupied, either use the existing server or stop its process before starting Tauri again.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Next.js development server. |
| `npm run build` | Create a production Next.js build. |
| `npm run start` | Serve the production Next.js build. |
| `npm run tauri dev` | Run the desktop application in development. |
| `npm run tauri build` | Create a packaged desktop application. |

## Project structure

```text
app/        Next.js routes, components, and styles
src-tauri/  Tauri desktop application and Rust configuration
public/     Static assets
```

## Contributing

Keep changes focused, verify the relevant run or build command before opening a pull request, and avoid committing generated build output.
