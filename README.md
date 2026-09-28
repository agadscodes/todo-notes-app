# Northstar

Northstar is a browser-based productivity workspace for managing todos, capturing notes, and recording voice memos. It uses a compact, dark-and-gold dashboard, with an optional light theme.

## Features

- **Dashboard:** Review task, completion, note, and voice memo counts.
- **Todos:** Add and edit tasks, set low/medium/high priority, filter by status, mark complete, and remove tasks.
- **Notes:** Create and edit notes with titles, content, and comma-separated tags; pin and delete notes; attach an in-progress voice memo to a note.
- **Voice memos:** Record from the browser microphone, name and save recordings to the Voice Memos library, play and seek with the custom player, and remove recordings.
- **Settings:** Switch between English and Spanish and toggle light mode. Settings and workspace data persist between visits.
- **Viewport layout:** The workspace is sized to the browser viewport. Longer lists scroll within their content areas rather than expanding the page.

## Tech Stack

- React 19 with TypeScript
- Vite 8 for development and production builds
- Tailwind CSS v4 with the official Vite plugin for utility styling
- Custom CSS for the dashboard theme, responsive layout, and detailed visual treatments
- Browser `localStorage` for todos, notes, settings, and saved voice memo metadata
- IndexedDB for audio `Blob` data
- `MediaRecorder` and `getUserMedia` for microphone capture
- Oxlint for linting

There is no server-side API or backend configured. Audio recordings remain in the current browser's IndexedDB and are not uploaded to a server.

## Application Structure

- `src/App.tsx` owns workspace state, persistence, and event handlers.
- `src/app/copy.ts` contains English and Spanish interface strings; `src/app/filters.ts` defines shared todo filters.
- `src/components/layout/` contains sidebar settings/navigation and the page header.
- `src/components/dashboard/` contains the dashboard, todo list, and recording controls.
- `src/components/notes/` contains the note editor and note list.
- `src/components/audio/` contains the custom audio player and saved voice memo library.
- `src/hooks/useLocalStorage.ts` provides defensive local storage persistence.
- `src/services/idbStorage.ts` stores and retrieves audio blobs in IndexedDB.
- `src/types/index.ts` defines the todo, note, and voice memo data contracts.

## Requirements

- Node.js and npm
- A modern browser with IndexedDB support
- Microphone access for recording voice memos. Browsers generally require microphone access to be granted and the app to run on `localhost` or a secure HTTPS origin.

## Getting Started

Install dependencies and start the development server:

```sh
npm install
npm run dev
```

Vite prints the local URL when the server starts.

## Available Commands

| Command           | Description                                                             |
| ----------------- | ----------------------------------------------------------------------- |
| `npm run dev`     | Start the Vite development server.                                      |
| `npm run build`   | Run TypeScript project checks and create a production build in `dist/`. |
| `npm run preview` | Serve the production build locally. Run `npm run build` first.          |
| `npm run lint`    | Run Oxlint.                                                             |

## Data and Privacy

Todos, notes, display preferences, and voice memo metadata are stored locally in `localStorage`. Audio files are stored as Blobs in IndexedDB rather than encoded into local storage. Clearing browser site data removes this locally stored workspace data and recordings.

The application includes starter todo and note examples for first launch. Data stays in the browser profile and is not synchronized between devices.
