# 🎓 StudyBuddy — AI Study Assistant

StudyBuddy is a modern AI-powered study platform that helps students manage notes, plan study sessions, practice recall, generate quizzes and flashcards, and ask questions about their own study material.

StudyBuddy is a modern React + Firebase + Gemini powered learning platform with a dedicated AI backend.

> **Project status:** Active development  
> **Frontend:** React + Vite  
> **Backend:** Node.js + Express  
> **Authentication:** Firebase Authentication  
> **AI:** Google Gemini  
> **Database:** Firebase Firestore

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 📝 **Notes Workspace** | Create and manage study notes in one place. |
| 📄 **PDF / Document Study** | Upload study material and use it inside the AI workspace. |
| 🤖 **AI Q&A** | Ask questions about selected notes or documents and receive grounded answers. |
| 🔎 **RAG-style Retrieval** | Relevant document sections are retrieved before the AI generates an answer. |
| 📚 **AI Summaries** | Generate concise summaries from study material. |
| 💡 **Explain Simply** | Turn difficult concepts into easier explanations. |
| 🃏 **Flashcards** | Generate flashcards from notes and documents for active recall. |
| 🧪 **Quiz Generator** | Generate practice questions and quizzes from study material. |
| 📄 **ATS Resume Review** | Analyze resume content and get improvement suggestions. |
| 🗓️ **Study Plan** | Organize learning goals and study activities. |
| ✅ **Task Manager** | Track daily academic tasks and priorities. |
| ⏱️ **Pomodoro Timer** | Use focused study sessions with breaks. |
| 🎨 **Whiteboard** | Practice diagrams, calculations, and quick visual notes. |
| 📈 **History / Progress** | Review study activity and progress. |
| 🌙 **Dark / Light Theme** | Responsive interface with theme support. |
| 🔐 **Firebase Authentication** | Email/password signup, login, logout, session restore, and password reset. |
| 🔑 **Strong Password UI** | Signup validates password length, uppercase, lowercase, number, and special character requirements. |
| 🔥 **Firestore Integration** | User/profile data can be persisted in Firebase Firestore. |

---

## 🧠 AI Architecture

StudyBuddy uses a document-grounded AI flow instead of sending an entire document blindly to the model.

```text
Notes / PDF
    ↓
Text extraction
    ↓
Chunking
    ↓
Relevant chunk retrieval
    ↓
Gemini
    ↓
Grounded answer + source excerpts
```

The AI backend currently uses Google Gemini through a Node/Express API.

Example configured model:

```env
GEMINI_MODEL=gemini-3.5-flash-lite
```

The model can be changed from the backend environment configuration without changing the frontend.

---

## 🧩 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React, Vite, React Router |
| **Styling** | CSS, responsive custom UI |
| **Icons** | React Icons |
| **Authentication** | Firebase Authentication |
| **Database** | Firebase Firestore |
| **AI Backend** | Node.js, Express |
| **AI Provider** | Google Gemini API |
| **Document AI** | Chunking + retrieval + grounded prompting |
| **Version Control** | Git & GitHub |
| **Deployment** | Vercel (frontend) + Render (backend) recommended |

---

## 📁 Project Structure

```text
StudyBuddy/
├── server/
│   ├── index.js
│   ├── package.json
│   ├── .env.example
│   └── .env                 # local only — never commit
│
├── studymate-react/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── firebase.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env.local           # local only — never commit
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
├── LICENSE
├── package.json
└── README.md
```

---

## 🚀 Local Setup

### Prerequisites

Install:

- Node.js
- npm
- Git
- A Firebase project
- A Google Gemini API key

---

## 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd StudyBuddy
```

---

## 2. Install Dependencies

Install frontend and backend dependencies:

```bash
npm run install:all
```

If needed, they can also be installed separately:

```bash
cd studymate-react
npm install
```

```bash
cd ../server
npm install
```

---

## 3. Configure Firebase

Create a Firebase project and enable:

```text
Authentication
└── Email / Password

Firestore Database
└── Production mode
```

Create a Web App in Firebase and copy the Firebase web configuration.

Inside:

```text
studymate-react/.env.local
```

add:

```env
VITE_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=YOUR_PROJECT.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET=YOUR_PROJECT.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
VITE_FIREBASE_APP_ID=YOUR_APP_ID
```

Do not paste the JavaScript `firebaseConfig` object directly into `.env.local`. Vite environment files must use:

```text
VARIABLE_NAME=value
```

---

## 4. Firebase Authentication

StudyBuddy currently supports:

- Email/password signup
- Email/password login
- Logout
- Firebase session restoration after refresh
- Forgot-password / reset-password email

For stronger security, configure a Firebase Authentication password policy such as:

```text
Minimum 8 characters
At least 1 uppercase letter
At least 1 lowercase letter
At least 1 number
At least 1 special character
```

The signup UI also provides live password-strength feedback.

---

## 5. Firestore Security Rules

A simple user-profile rule can be configured as:

```js
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    match /users/{userId} {
      allow read, write:
        if request.auth != null
        && request.auth.uid == userId;
    }
  }
}
```

Use stricter collection-specific rules as more StudyBuddy data is migrated to Firestore.

---

## 6. Configure Gemini

Create the backend environment file:

```text
server/.env
```

Example:

```env
PORT=8787
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
GEMINI_MODEL=gemini-3.5-flash-lite
```

Never expose the Gemini API key in frontend code.

Never commit:

```text
server/.env
```

---

## 7. Run the Backend

Open Terminal 1:

```bash
cd server
npm run dev
```

Expected:

```text
StudyBuddy AI server listening on http://localhost:8787
Gemini AI enabled (...)
```

Health check:

```text
http://localhost:8787/api/health
```

A successful response should look similar to:

```json
{
  "ok": true,
  "aiConfigured": true,
  "provider": "gemini",
  "model": "gemini-3.5-flash-lite"
}
```

---

## 8. Run the Frontend

Open Terminal 2:

```bash
cd studymate-react
npm run dev
```

Open:

```text
http://localhost:5173
```

Keep the backend and frontend running in separate terminals.

---

## 🔐 Security

The following files must never be committed:

```text
server/.env
studymate-react/.env.local
```

Recommended root `.gitignore` entries:

```gitignore
**/node_modules/
**/dist/

server/.env
studymate-react/.env.local

.env
.env.local

.DS_Store
```

Before pushing to GitHub, verify:

```bash
git check-ignore server/.env studymate-react/.env.local
```

If an API key is accidentally exposed in a terminal screenshot, commit, issue, or public repository, revoke it immediately and create a new key.

---

## 🧪 Suggested Test Flow

After setup, test the app in this order:

```text
Signup
→ Login
→ Logout
→ Forgot Password
→ Dashboard
→ Notes / PDF upload
→ AI Workspace
→ Document Q&A
→ Summarize
→ Explain Simply
→ Flashcards
→ Quiz
→ ATS Resume Check
```

Example AI question:

```text
What is the difference between WHERE and HAVING? Give an SQL example.
```

---

## 🌐 Deployment

Recommended deployment architecture:

```text
GitHub
   ├── Vercel → React / Vite frontend
   ├── Render → Node / Express AI backend
   └── Firebase → Authentication + Firestore
```

### Frontend — Vercel

Use:

```text
Root Directory: studymate-react
Framework: Vite
Build Command: npm run build
Output Directory: dist
```

Add the Firebase `VITE_FIREBASE_*` variables in the Vercel project environment settings.

Do **not** add the Gemini API key to the frontend.

### Backend — Render

Use:

```text
Root Directory: server
Build Command: npm install
Start Command: node index.js
```

Add:

```env
GEMINI_API_KEY=YOUR_SECRET_KEY
GEMINI_MODEL=gemini-3.5-flash-lite
```

in Render's environment settings.

After deployment, add the deployed frontend domain to Firebase Authentication → Authorized domains.

---

## 🗺️ Current Roadmap

Planned improvements include:

- Full Firestore persistence for notes, tasks, quizzes, flashcards, sessions, and history
- Google Sign-In
- Custom StudyBuddy password-reset page
- Better document retrieval / embeddings
- Automatic Gemini model fallback on temporary model overload
- Improved progress analytics
- Cloud deployment and live production URL
- More robust AI source citations
- Collaborative study features


## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for details.
See:

```text
LICENSE
```

for details.

---

## ⭐ StudyBuddy

StudyBuddy brings the complete study loop into one workspace:

```text
Plan → Learn → Ask AI → Practice → Recall → Focus → Review
```
