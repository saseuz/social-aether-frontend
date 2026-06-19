# 🌌 Aether Social Network

A premium, glassmorphic, space-themed micro-transmission client designed for the next-generation decentralized network. Aether enables node pilots to synchronize telemetry, align connection frequencies, and broadcast ideas across the cosmos.

---

## 🚀 Key Features

### 📡 1. The Drafting Console
* **Add Media**: Attach planetary visual signals or cosmic telemetry images using pre-seeded imagery or custom external image coordinates (URLs) with live preview capability.
* **Align Signal**: Broadcast transmissions to targeted sectors (`Main Relay`, `Dev Colony`, `Design Array`, `AI Nexus`, `Quantum Core`) with glowing indicator tags.
* **Synthesize Ideas (AI-Powered)**: Generate new thoughts instantly when empty, or parse and translate entered logic into sci-fi space jargon automatically (e.g. converting "developing a react website" into "developing a React core relay matrix visual signal grid").

### 🧭 2. Navigation Hub
* **Aether Feed**: Real-time rendering of all localized posts including bookmark toggles, alignment tags, and expandable replies/comments.
* **Explore**: Coordinate search, trending coordinates ("Active Node Coordinates"), and suggested connections.
* **Bookmarks**: Save transmissions to the quadrant's local storage with custom space empty states when empty.
* **Notifications**: Track likes, comments, follow invitations, and system messages instantly.

---

## 🛠️ Technology Stack

* **UI Engine**: React 19 (Functional Hooks & Context Providers)
* **Build System**: Vite + TypeScript 5
* **Styling**: Tailwind CSS + Custom Vanilla CSS variables for neon glassmorphic panels
* **Icons**: Lucide React
* **Router**: React Router v6 (SPA Navigation)

---

## 🏁 Getting Started

### 1. Installation
Clone the repository, go into the project folder, and download node packages:
```bash
npm install
```

### 2. Run Local Development Server
Start the Vite local development instance:
```bash
npm run dev
```
Navigate to [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Build & Compile for Production
```bash
npm run build
```

---

## 📐 Architecture & Mock API Client

To support local-first operation and offline testing, Aether utilizes a central `apiClient.ts` that automatically mocks API endpoints on `localStorage` when no remote server environment variables are set.

* **Context State Management**: Shared state variables (auth session, posts feed, notifications list) are managed globally via React Context Providers (`AuthContext.tsx`, `PostContext.tsx`, `NotificationContext.tsx`).
* **Component Reuse**: Visual transmissions are rendered using a single highly polished, decoupled [PostCard.tsx](src/components/PostCard.tsx) component that handles comments, replies, and bookmark updates.
