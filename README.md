# ApplyFlow 📬

> A Gmail-inspired job application tracker that syncs with your inbox and automatically categorizes job-related emails.

---

## Features

-  **Google Sign-In** via Firebase Authentication
-  **Gmail Sync** — connects to your inbox and fetches emails
-  **Auto-Classification** — detects job-related emails and assigns statuses
-  **Dashboard Stats** — total applications, interviews, offers, rejections
-  **Manual Editing** — override status, add notes, star, archive, delete
-  **Custom Labels** — create and assign labels to applications
-  **Search & Filter** — search by keyword, filter by status or company
-  **Timeline Tracking** — status history for every application
-  **Sync History** — logs of every Gmail sync session

---

## Tech Stack

### Frontend
- React 18 + Vite
- Tailwind CSS
- React Router v6
- Axios
- Firebase Auth
- Lucide React

### Backend
- Node.js + Express
- MongoDB + Mongoose
- Google Gmail API (googleapis)
- Firebase Admin SDK

---

## Project Structure

```
applyflow/
├── client/          # React frontend
├── server/          # Node.js backend
└── README.md
```

---

## Setup Guide

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Firebase project
- Google Cloud project with Gmail API enabled

---

### 1. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable **Authentication** → **Google Sign-In**
4. Go to Project Settings → Service Accounts → Generate New Private Key
5. Download the JSON — you'll need `project_id`, `client_email`, and `private_key`
6. From Project Settings → General → Your Apps, register a Web App
7. Copy the Firebase config values for the frontend `.env`

---

### 2. Google Cloud / Gmail API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select a project
3. Enable **Gmail API** under APIs & Services
4. Go to **OAuth consent screen** — configure with scopes:
   - `https://www.googleapis.com/auth/gmail.readonly`
   - `https://www.googleapis.com/auth/gmail.modify`
   - `https://www.googleapis.com/auth/userinfo.email`
   - `https://www.googleapis.com/auth/userinfo.profile`
5. Go to **Credentials** → Create OAuth 2.0 Client ID (Web application)
6. Add authorized redirect URI: `http://localhost:5000/api/google/callback`
7. Copy **Client ID** and **Client Secret**

---

### 3. MongoDB Setup

- **Local**: Install MongoDB, start `mongod`, use `mongodb://localhost:27017/applyflow`
- **Atlas**: Create free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas), get connection string

---

### 4. Backend Setup

```bash
cd server
cp .env.example .env
# Fill in all values in .env
npm install
npm run dev
```

---

### 5. Frontend Setup

```bash
cd client
cp .env.example .env
# Fill in all Firebase values and backend URL
npm install
npm run dev
```

---

## Running the App

```bash
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Frontend
cd client && npm run dev
```

Frontend: http://localhost:5173  
Backend: http://localhost:5000

---

## Deployment

### Backend (Railway / Render)
1. Push to GitHub
2. Connect to Railway/Render
3. Set all environment variables
4. Deploy

### Frontend (Vercel / Netlify)
1. Push to GitHub
2. Connect to Vercel
3. Set `VITE_BACKEND_URL` to your deployed backend URL
4. Deploy

---

## API Overview

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/firebase-login` | Login with Firebase token |
| GET | `/api/google/connect` | Start Gmail OAuth |
| GET | `/api/google/callback` | OAuth callback |
| POST | `/api/gmail/sync` | Sync Gmail inbox |
| GET | `/api/emails` | Get all synced emails |
| GET | `/api/emails/:id` | Get single email |
| PATCH | `/api/emails/:id/star` | Toggle star |
| PATCH | `/api/emails/:id/archive` | Toggle archive |
| PATCH | `/api/emails/:id/delete` | Soft delete |
| GET | `/api/applications` | Get applications |
| GET | `/api/applications/:id` | Get single application |
| PATCH | `/api/applications/:id/status` | Update status |
| POST | `/api/applications/:id/notes` | Add note |
| GET | `/api/labels` | Get labels |
| POST | `/api/labels` | Create label |
| DELETE | `/api/labels/:id` | Delete label |
| GET | `/api/dashboard/stats` | Get stats |
| GET | `/api/sync/logs` | Get sync history |

---

## License

MIT
