# AI Mystery Room 🕵️‍♂️🔍

An immersive, full-stack, AI-powered detective web application where players investigate and solve dynamically generated mysteries powered by Google Gemini.

Submission Link: [https://bit.ly/ai-mystery-room-sub-form](https://bit.ly/ai-mystery-room-sub-form)

---

## 🌟 Architecture & Core Features

- **Dynamic Mystery Generation**: Generates intricate, intellectually rigorous mysteries across 3 difficulty tiers (Easy: 3 suspects/5 clues, Medium: 4 suspects/7 clues, Hard: 5 suspects/9 clues) and 5 distinct atmospheric genres (Noir, Victorian Manor, Sci-Fi Station, Cozy Village, Cyberpunk).
- **Dual-Pass Solvability Engine**: Gemini executes a second forensic verification pass to ensure clues logically converge on exactly one culprit without internal contradictions.
- **Strict Zero-Leak Security Architecture**: Culprits, motives, solutions, and red herrings are guarded backend-side (`select: false` + explicit DTO sanitization) until an accusation is finalized. Automated unit tests prove zero leakage on active gameplay routes.
- **Interactive Suspect Interrogations**: Engage in live cross-examination chats with suspects, each constrained by private psychological profiles and alibis.
- **Visual Evidence Corkboard**: Draggable cards with connecting red strings and sticky notes, persisted directly to MongoDB.
- **Contradiction Detection**: Flag discrepancies between suspect testimonies and discovered physical clues for bonus points.
- **Forensic Scoring Engine**: Authoritative backend scoring based on accusation accuracy, motive/method deductions, clues uncovered, hints used, and interrogation costs.
- **Shareable Case Files & Global Leaderboard**: View case breakdown reviews, badges, and compete on the global sleuth board.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, React Router v6, Axios, Lucide Icons, Canvas/SVG, Web Audio API (`client/`).
- **Backend**: Node.js, Express, MongoDB (Mongoose), `@google/genai` (Google Gen AI SDK), Zod, Helmet, Express-Rate-Limit, CORS (`server/`).

---

## 📋 Production Environment Variables

### Backend (`server/.env`)
| Variable | Description | Example Production Value |
|---|---|---|
| `PORT` | Backend server port | `5000` |
| `MONGODB_URI` | MongoDB Atlas Connection String | `mongodb+srv://user:pass@cluster.mongodb.net/mystery_room?retryWrites=true&w=majority` |
| `GEMINI_API_KEY` | Official Google Gemini API Key | `AIzaSy...` |
| `GEMINI_MODEL` | Google GenAI Model Name | `gemini-2.5-flash` |
| `CLIENT_URL` | Deployed Frontend URL (for CORS) | `https://ai-mystery-room.vercel.app` |
| `NODE_ENV` | Runtime environment | `production` |

### Frontend (`client/.env`)
| Variable | Description | Example Production Value |
|---|---|---|
| `VITE_API_URL` | Backend API base endpoint | `https://ai-mystery-room-api.onrender.com/api` |

---

## 🚀 Local Development Setup

### 1. Backend
```bash
cd server
npm install
cp .env.example .env
# Edit server/.env with your GEMINI_API_KEY and MONGODB_URI
npm run dev
```
Backend runs on `http://localhost:5000`.

### 2. Frontend
```bash
cd client
npm install
cp .env.example .env
npm run dev
```
Client runs on `http://localhost:5173`.

### 3. Run Automated Tests
```bash
cd server
npm test
```
Executes:
- `tests/scoring.test.js`: Validates all point rules, penalties, and detective tiers.
- `tests/noLeak.test.js`: Proves that active case DTOs never expose private solution fields.
- `tests/sanitizer.test.js`: Verifies prompt injection stripping and premise sanitization.

---

## 🚢 Step-by-Step Deployment Guide

### Step 1: Database (MongoDB Atlas)
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/) and create a free M0 cluster.
2. In **Network Access**, add `0.0.0.0/0` (allow access from anywhere) so Render/Railway can connect.
3. In **Database Access**, create a user with read/write privileges.
4. Copy the connection string: `mongodb+srv://<username>:<password>@cluster.mongodb.net/mystery_room?retryWrites=true&w=majority`.

### Step 2: Backend (Render / Railway)
1. Push your repository to GitHub.
2. In Render, click **New Web Service** and connect your repository.
3. Configure settings:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Add Environment Variables:
   - `PORT`: `5000`
   - `MONGODB_URI`: `<Your MongoDB Atlas URI>`
   - `GEMINI_API_KEY`: `<Your Gemini Key>`
   - `GEMINI_MODEL`: `gemini-2.5-flash`
   - `CLIENT_URL`: `<Your Vercel Frontend URL>`
   - `NODE_ENV`: `production`
5. Click **Deploy**. Note down the assigned URL (e.g., `https://ai-mystery-room-api.onrender.com`).

### Step 3: Frontend (Vercel)
1. Go to [Vercel](https://vercel.com/) and click **Add New Project**.
2. Select your GitHub repository.
3. Configure settings:
   - **Root Directory**: `client`
   - **Framework Preset**: `Vite`
4. In **Environment Variables**, add:
   - `VITE_API_URL`: `https://ai-mystery-room-api.onrender.com/api` (points to your Render backend)
5. Click **Deploy**.
6. Back on Render, ensure `CLIENT_URL` matches your deployed Vercel domain.

---

## 🎬 Live Demonstration Script

Follow this script when presenting or recording the live demo:
1. **Atmosphere**: Open the homepage. Highlight the selected genre theme and toggle the ambient sound (rain synthesizer via Web Audio API).
2. **Mystery Creation**:
   - Navigate to `/create`.
   - Pick the **Medium** difficulty (4 suspects, 7 clues, 3 hints) and choose the **Noir** theme.
   - Enter or select the starter premise: *"A rare diamond vanished during a blackout at the Blackwood Manor."*
   - Click **Initialize Investigation Room**. Notice the step-by-step typewriter generation indicator (Pass 1 creation + Pass 2 solvability check).
3. **Investigation**:
   - **Suspects Dossier**: Open a suspect card (e.g. Arthur Sterling). Click **Interrogate Suspect**. Ask: *"Where were you at the time of the theft?"* Observe the in-character defense and see the question counter decrement.
   - **Evidence Locker**: Click **Examine Evidence** on 2 clues to discover them. Observe the clue text unlock and the +5 score notification.
   - **Progressive Hint**: Open the Hint drawer and unlock Level 1. Note the -10 point penalty warning and progressive clue guidance.
   - **Evidence Corkboard**: Switch to the Corkboard tab. Drag suspect polaroids, click two cards to tie a red yarn string between them, and pin a sticky note. Click **Save Board**.
   - **Contradiction Flagging**: Click **Flag Contradiction**. Pair a suspect's claimed alibi with a conflicting physical clue to earn +10 points.
4. **Accusation**:
   - Click **Make Accusation**.
   - Pick the prime suspect from the lineup.
   - Enter the Motive and Method.
   - Select 2 decisive supporting clues.
   - Type your deduction reasoning and click **Seal Case & Deliver Accusation**.
5. **Results & Verdict**:
   - Celebrate with confetti and observe the **Detective Rank Badge** (Master Detective / Sharp Eye / Close Call / Case Cold).
   - Review the authoritative score breakdown and the **Gemini Consulting Detective Critique**.
   - Review the unlocked solution dossier comparing decisive clues against the red herrings.
   - Click **View Shareable Case File Dossier** to see the clean, printable clearance certificate.
