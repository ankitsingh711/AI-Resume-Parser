# Quick Start Guide

## Prerequisites
- Node.js 18+ installed
- OpenAI API key

## Setup (5 minutes)

### 1. Get Your OpenAI API Key
1. Go to https://platform.openai.com/api-keys
2. Sign in or create account
3. Click "Create new secret key"
4. Copy the key (starts with `sk-...`)

### 2. Configure Backend
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` and add your key:
```
OPENAI_API_KEY=sk-your-actual-key-here
```

### 3. Start Backend
```bash
cd backend
npm run dev
```

You should see:
```
🚀 Server is running on port 3001
📊 Health check: http://localhost:3001/api/health
🔧 Environment: development
```

### 4. Start Frontend (new terminal)
```bash
cd frontend
npm run dev
```

You should see:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

### 5. Test It!

1. Open browser to http://localhost:5173
2. Upload `sample-data/resume1-senior-fullstack.txt`
3. Upload `sample-data/job-description1-senior-fullstack.txt`
4. Click "Analyze Resume"
5. View results and ask questions in chat!

## Troubleshooting

**Backend won't start?**
- Check OpenAI API key is set in .env
- Verify Node.js version: `node --version` (need 18+)

**Frontend won't start?**
- Make sure backend is running first
- Check port 5173 isn't in use

**Upload fails?**
- Check file is .pdf or .txt
- Check file is under 10MB

**Chat doesn't work?**
- Verify OpenAI API key has credits
- Check browser console for errors

## What's Running?

- **Backend**: http://localhost:3001 (Express + TypeScript)
- **Frontend**: http://localhost:5173 (React + Vite)
- **API Health**: http://localhost:3001/api/health

## Next Steps

Once it's working:
1. Try different resume/JD combinations
2. Ask various questions in chat
3. Observe how RAG retrieves relevant context
4. Review DEMO.md for recording your demo video
