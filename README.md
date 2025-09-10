# Discuss Platform — Frontend (React + TypeScript + Vite)

This repository contains the frontend for a small decentralized discussion platform built with React + TypeScript + Vite. It demonstrates client-side IPFS pinning (Pinata), a lightweight Gemini/Vertex AI helper, and a simple backend for WebSocket relay and an AI proxy.

## What this system does

- Frontend UI (Vite + React + TypeScript) where users can create discussions, attach media, request AI assistance for tags/content, and view a live discussion feed.
- Client-side Pinata helpers for uploading files and JSON metadata to IPFS: see [`uploadFileToPinata`](frontend/src/services/pinata.js) and [`uploadMetadataToIPFS`](frontend/src/services/pinata.js).
- Lightweight LLM helpers that call a configurable LLM HTTP endpoint or the local backend proxy: see [`analyzeForTags`](frontend/src/services/gemini.js) and [`askAgent`](frontend/src/services/gemini.js).
- Local WebSocket relay backend at [backend/server.js](backend/server.js) that broadcasts incoming messages to connected clients (used for real-time new-discussion notifications).
- Context provider to manage discussions in-app: see [`DiscussionsProvider`](frontend/src/contexts/discussionsData.tsx) and the hook [`useDiscussions`](frontend/src/contexts/useDiscussions.ts).

Files of interest

- Frontend entry: [frontend/src/main.tsx](frontend/src/main.tsx)
- Pinata client helpers: [frontend/src/services/pinata.js](frontend/src/services/pinata.js)
- Gemini/AI helpers: [frontend/src/services/gemini.js](frontend/src/services/gemini.js)
- Discussions context: [frontend/src/contexts/discussionsData.tsx](frontend/src/contexts/discussionsData.tsx)
- Backend server: [backend/server.js](backend/server.js)
- Frontend package config: [frontend/package.json](frontend/package.json)
- Environment examples: [frontend/.env](frontend/.env) and [backend/.env](backend/.env)

## Quick start (development)

Prerequisites:

- Node.js (16+ recommended)
- npm (or yarn/pnpm)

1. Install dependencies

   - Frontend:
     ```sh
     cd frontend
     npm install
     ```
   - Backend:
     ```sh
     cd ../backend
     npm install
     ```

2. Configure environment variables

   - Frontend: update [frontend/.env](frontend/.env) with your Vite env values (Pinata keys, API URLs).
   - Backend: update [backend/.env](backend/.env) with PORT, PINATA keys (if used server-side), and Google/Vertex settings (GEMINI_MODEL, GOOGLE_PROJECT_ID, GOOGLE_REGION). Ensure service account credentials are available or set GOOGLE_APPLICATION_CREDENTIALS.

3. Start the backend (WebSocket + AI proxy)

   ```sh
   cd backend
   npm start
   ```

   This runs [backend/server.js](backend/server.js) which hosts the WebSocket server and an AI proxy endpoint at `/api/ai/respond`.

4. Start the frontend (Vite dev server)
   ```sh
   cd ../frontend
   npm run dev
   ```
   Open the app at the URL shown by Vite (usually http://localhost:5173). The frontend connects to the backend WebSocket by default at ws://localhost:3000.

## Build (production)

- Build the frontend:

  ```sh
  cd frontend
  npm run build
  ```

  (The script runs `tsc -b` then `vite build` per [frontend/package.json](frontend/package.json).)

- Backend has no production build step; deploy [backend/server.js](backend/server.js) to your Node host or container.

## How to use / features

- Create discussions with text, optional media, optional link, and AI-assisted tag suggestions. The create flow uploads media via [`uploadFileToPinata`](frontend/src/services/pinata.js) and uploads metadata via [`uploadMetadataToIPFS`](frontend/src/services/pinata.js).
- Tag suggestions and agent replies are fetched via the Gemini helper functions in [`frontend/src/services/gemini.js`](frontend/src/services/gemini.js). By default the frontend will call the backend proxy at `/api/ai/respond` when VITE_GEMINI_API_URL is not set.
- New discussions are broadcast to connected clients via the backend WebSocket server in [backend/server.js](backend/server.js) (message type `new-discussion`).

## Contributing

1. Fork the repository and create a feature branch:

   ```sh
   git checkout -b feat/your-feature
   ```

2. Follow these guidelines:

   - Keep TypeScript types accurate; prefer using existing types in [frontend/src/types.ts](frontend/src/types.ts).
   - Run lints and fix warnings:
     ```sh
     cd frontend
     npm run lint
     ```
   - Ensure new UI code is consistent with existing components (`CreateDiscussion`, `DiscussionFeed`, `Sidebar`) and the discussions context [`DiscussionsProvider`](frontend/src/contexts/discussionsData.tsx).

3. Make small, focused PRs with descriptive titles and link to related issues.

4. Review checklist for PRs:
   - Code builds and the dev server starts (`npm run dev`).
   - No TypeScript errors.
   - Behaviour is covered manually; add tests where appropriate.

## Security & secrets

- Pinata keys in the client are visible to users. For production, move secret operations to a server-side endpoint or use a low-privilege proxy.
- Backend uses Google service account credentials for Vertex AI. Never commit service-account.json into the repo; set `GOOGLE_APPLICATION_CREDENTIALS` on the server or use a secrets manager.

## Troubleshooting

- WebSocket not connecting: verify backend is running and the frontend WS URL matches ([frontend/.env](frontend/.env) VITE_WS_URL).
- AI proxy errors: ensure `GEMINI_MODEL`, `GOOGLE_PROJECT_ID`, and credentials are configured in [backend/.env](backend/.env).

## License

MIT License

Copyright (c) 2024

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
