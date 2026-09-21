# 🎓 TN Colleges — AI Chat Assistant

An elegant, production-ready AI chat interface for Tamil Nadu Engineering Admissions (TNEA) counseling, powered by the **TNEA AI Counselor RAG System**.

Students can ask natural-language questions about **418 engineering colleges**, **3,516 department offerings and seat intakes**, cutoff guidance, hostel facilities, fees, and Anna University academic performance.

---

## 🚀 Features

* **AI-Powered Counselor Chat:** Connects directly to the FastAPI RAG backend (`/query`) for grounded answers with verified college source cards.
* **Persistent Chat History:** User conversations are securely saved to Supabase with real-time restore on page reload or device switching.
* **Google Authentication:** Secure login & session management via Supabase Auth.
* **Chat Management:** Full sidebar control to create, rename, pin, search, and delete chat threads.
* **Source Citations:** Visual source badges showing College Name, District, and official TNEA Code.
* **Free-Tier Cold-Start Awareness:** Automatic background warmup ping (`GET /warmup`) on app mount with friendly countdown notices during backend wake-up.
* **Regenerate Responses:** One-click answer regeneration with query re-submission.
* **Responsive Ledger Design:** Minimalist, mobile-friendly interface styled with Tailwind CSS.

---

## 🛠️ Tech Stack

| Component | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | [React 18](https://react.dev/) | Component architecture & state management |
| **Build Tool** | [Vite 5](https://vitejs.dev/) | Fast development server & optimized production bundling |
| **Styling** | [Tailwind CSS 3](https://tailwindcss.com/) | Responsive design & custom ledger theme |
| **Backend & Auth** | [Supabase Client](https://supabase.com/) | Authentication & user chat persistence |
| **Icons** | [Lucide React](https://lucide.dev/) & [React Icons](https://react-icons.github.io/react-icons/) | Modern UI icons |
| **RAG Backend** | [FastAPI](https://fastapi.tiangolo.com/) + Gemini | AI counseling and retrieval engine |

---

## 📦 Project Structure

```text
chat-ui/
├── src/
│   ├── components/
│   │   ├── AccountSettings.jsx     # User profile and account preferences
│   │   ├── Header.jsx              # App header with connection & user controls
│   │   ├── InputBar.jsx            # Multi-line chat input with keyboard shortcuts
│   │   ├── LoadingIndicator.jsx    # Pulsing query status indicator
│   │   ├── Login.jsx               # Google authentication modal
│   │   ├── MessageArea.jsx         # Chat timeline and suggested questions
│   │   ├── MessageBubble.jsx       # User query & AI response bubble with formatted text
│   │   ├── ResponseActions.jsx     # Copy, regenerate, and feedback actions
│   │   ├── Sidebar.jsx             # Chat drawer with search, pin, rename, delete
│   │   ├── SourceReferences.jsx    # Grounded citation cards (TNEA code, district)
│   │   └── StatusMessage.jsx       # Friendly notice banners (cold starts, errors)
│   ├── services/
│   │   ├── chatService.js          # API client for FastAPI backend (/query, /warmup)
│   │   └── supabase.js             # Supabase client & auth configuration
│   ├── App.jsx                     # Root application container & auth lifecycle
│   ├── main.jsx                    # Vite React entry point
│   └── index.css                   # Global styles & Tailwind utilities
├── index.html                      # HTML entry document
├── package.json                    # Project dependencies & scripts
├── tailwind.config.js              # Theme color definitions & font setup
├── vite.config.js                  # Vite configuration
└── README.md                       # Project documentation
```

---

## ⚙️ Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/sudhakargovindasamy/tn-colleges-chat-ui.git
cd tn-colleges-chat-ui
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Supabase Configuration (Authentication & Chat Persistence)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Backend API Endpoint
# Production (Render):
VITE_API_URL=https://tnea-ai-eng.onrender.com

# For Local Backend Development:
# VITE_API_URL=http://localhost:8000
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🏗️ Production Build

To bundle the application for production deployment (Vercel, Netlify, Cloudflare Pages, etc.):

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

---

## 🔗 Backend RAG Integration

The frontend communicates with the **TNEA AI Counselor API** via `src/services/chatService.js`:

| Endpoint | Method | Frontend Feature | Description |
| :--- | :---: | :--- | :--- |
| **`/query`** | `POST` | AI Chat Assistant | Submits student questions with session tracking, returning grounded answers and verified sources. |
| **`/health`** | `GET` | Live Connection Badge | Displays real-time connection status (`● Online` / `⏳ Connecting...`) in the header. |
| **`/warmup`** | `GET` | Cold-Start Preload | Proactively wakes up free-tier backend instances on app mount to avoid query latency. |
| **`/search_colleges`** | `GET` | Directory Explorer Modal | Interactive catalog search filtering by district, branch/course, and autonomous status. |
| **`/clear_chat/{session_id}`** | `POST` | New Chat & Delete | Resets conversational history on the backend when starting a new session or deleting a thread. |
| **`/feedback/downvote`** | `POST` | Thumbs Down Action | Allows users to report inaccurate answers, automatically purging poisoned semantic cache entries. |

---

## 📄 License

MIT License. Designed for Tamil Nadu engineering aspirants.
