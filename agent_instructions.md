# AGENT INSTRUCTIONS: Todo, Notes & Voice Memo Application

## 1. Project Overview

This repository contains a full-featured productivity web application combining task management (Todos), rich text notes, and audio voice memos. The application is built with a sleek, high-contrast dark/gold aesthetic, robust TypeScript typing, and defensive storage patterns.

## 2. Tech Stack & Environment

- **Frontend Framework:** React 18+ with TypeScript (Vite bundler)
- **Styling:** Tailwind CSS
  - **Font:** Inter (`sans-serif`)
  - **Design System:**
    - Primary Base: `#000000` (Deep black background/surfaces)
    - Surface Secondary: `#121212` / `#1A1A1A` (Cards, panels, modals)
    - Accents & Highlights: Gold (`#D4AF37` / `#F59E0B` / `#EAB308`)
    - Text Primary: `#FFFFFF` (High contrast)
    - Text Muted: `#9CA3AF` (Subtle metadata)
- **Icons:** `lucide-react`
- **Audio Capture:** Native Web Audio API (`MediaRecorder`)
- **Persistence Layer:**
  - Client-side first: `localStorage` (for metadata/todos/notes) + `IndexedDB` (for audio Blobs).
- **Backend (Optional / Modular):** Python (FastAPI + Pydantic + Uvicorn) if API endpoints or persistent server storage are activated.

---

## 3. Data Contracts & Type Definitions

Create and maintain these in `src/types/index.ts`:

```typescript
export type Priority = "low" | "medium" | "high";

export interface Todo {
  id: string; // crypto.randomUUID()
  title: string;
  description?: string;
  isCompleted: boolean;
  priority: Priority;
  dueDate?: string | null;
  createdAt: number;
}

export interface VoiceNoteMeta {
  audioId: string; // ID reference in IndexedDB or file storage
  durationSeconds: number; // Recorded length
  mimeType: string; // e.g., 'audio/webm' or 'audio/mp4'
}

export interface Note {
  id: string; // crypto.randomUUID()
  title: string;
  content: string;
  tags: string[];
  pinned: boolean;
  voiceNote?: VoiceNoteMeta; // Optional voice attachment
  createdAt: number;
  updatedAt: number;
}
```

---

## 4. Repository Structure

```text
/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── common/           # Button, Input, Modal, Badge (styled with Black/Gold)
│   │   ├── layout/           # Sidebar, Navbar, Shell
│   │   ├── todos/            # TodoList, TodoItem, TodoForm, PriorityPill
│   │   └── notes/            # NoteGrid, NoteCard, NoteEditor
│   │   └── audio/            # VoiceRecorder, AudioPlayer, WaveformDisplay
│   ├── hooks/
│   │   ├── useLocalStorage.ts
│   │   ├── useAudioRecorder.ts
│   │   ├── useIndexedDB.ts   # For storing large audio Blob objects
│   │   └── useTodos.ts
│   ├── services/             # Storage adapters & optional Python API client
│   │   ├── api.ts            # Axios/Fetch to FastAPI backend (if enabled)
│   │   └── idbStorage.ts     # IndexedDB audio binary handler
│   ├── types/
│   │   └── index.ts
│   ├── index.css             # Tailwind setup + @font-face Inter
│   ├── App.tsx
│   └── main.tsx
├── backend/                  # Optional Python Backend
│   ├── main.py               # FastAPI entrypoint
│   ├── models.py             # Pydantic models matching TS types
│   ├── requirements.txt      # fastapi, uvicorn, python-multipart
│   └── uploads/              # Local storage for saved audio memos
├── agent.md
├── tailwind.config.js
├── tsconfig.json
├── package.json
└── README.md
```

---

## 5. Styling & Visual Language Rules

1. **Typography:** Ensure `font-sans` maps to `'Inter', sans-serif` in `tailwind.config.js`.
2. **Gold Palette Integration:**
   - Buttons (Primary): `bg-amber-500 hover:bg-amber-400 text-black font-semibold shadow-lg shadow-amber-500/10`
   - Borders & Accents: `border-amber-500/20 focus:border-amber-500`
   - Active Indicators: `text-amber-400`
3. **Containers & Contrast:**
   - Background: `bg-black text-white`
   - Card Backgrounds: `bg-neutral-900 border border-neutral-800 hover:border-amber-500/40`

---

## 6. Functional & Implementation Rules

### Audio & Voice Recording

- **Do not store audio Blobs in `localStorage`:** Local storage has a 5MB threshold and base64-encoded audio will exceed quota immediately.
- Use `IndexedDB` via `src/services/idbStorage.ts` to store raw `Blob` objects on the client, or stream them to the Python backend via `multipart/form-data`.
- Ensure clean microphone stream cleanups on recording stop, unmount, or permission revocation (`track.stop()`).
- Provide visual recording cues: a pulsing gold recording dot, timer, and cancel/save controls.

### State & Persistence

- Wrap all local storage actions in `try...catch` with automatic fallback to memory state if storage is restricted.
- Notes and Todos must support full CRUD: Create, Read, Update, Delete.
- Notes should support pinning (`pinned: true` stays at the top of the grid).
- Todos should support instant toggle and priority filtering.

### Optional Python Backend Protocol (FastAPI)

- If connecting the backend, the FastAPI server will expose:
  - `POST /api/audio/upload` -> Accepts audio multipart form-data, saves to disk/cloud, returns `{ "audioId": "uuid", "duration": 12 }`.
  - `GET /api/audio/{audio_id}` -> Streams stored audio file back with `Content-Type: audio/webm`.
  - `GET /api/todos`, `POST /api/todos`, `GET /api/notes`, `POST /api/notes`.

---

## 7. Development Commands

### Frontend

- Install: `npm install`
- Run dev server: `npm run dev`
- Typecheck & Build: `npm run build`

### Backend (If activated)

- Setup: `python -m venv venv && source venv/bin/activate` (or `venv\Scripts\activate` on Windows)
- Dependencies: `pip install fastapi uvicorn python-multipart`
- Run server: `uvicorn backend.main:app --reload --port 8000`
