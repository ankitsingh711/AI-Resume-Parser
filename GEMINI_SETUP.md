# 🚀 Google Gemini Setup - EASIEST & FREE!

## Why Gemini is Perfect

✅ **Completely FREE** - No credit card needed
✅ **ONE API key** - Handles both chat AND embeddings  
✅ **High quality** - Gemini 1.5 Flash is excellent
✅ **Generous limits** - 60 requests/minute free tier
✅ **Easy setup** - 2 minutes total!

## Quick Setup

### 1. Get Your FREE Gemini API Key (1 minute)

1. Go to https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. Select "Create API key in new project" (or choose existing)
4. Copy your key (starts with `AIza...`)

That's it! No credit card, no billing, completely free!

### 2. Update Your `.env` File (30 seconds)

Edit `backend/.env`:

```env
GEMINI_API_KEY=AIzaSyYourActualKeyHere
PORT=3001
NODE_ENV=development
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
FRONTEND_URL=http://localhost:5173
```

**IMPORTANT**:
- No spaces around `=`
- No quotes
- Key starts with `AIza`

### 3. Restart Backend (10 seconds)

The backend should auto-reload. If not:
```bash
cd backend
npm run dev
```

Should see:
```
🚀 Server is running on port 3001
📊 Health check: http://localhost:3001/api/health
🔧 Environment: development
```

### 4. Test It!

Visit: http://localhost:3001/api/test/gemini

Should return:
```json
{
  "status": "success",
  "message": "Gemini connection working",
  "chat": {
    "model": "gemini-1.5-flash",
    "response": "Hello, API is working!"
  },
  "embeddings": {
    "model": "text-embedding-004",
    "dimensions": 768
  }
}
```

### 5. Try Your App!

1. Go to http://localhost:5173
2. Upload sample resume + job description
3. Click "Analyze Resume"
4. Chat with Gemini!

## What's Using Gemini

| Feature | Gemini Model | Purpose |
|---------|--------------|---------|
| Chat Q&A | gemini-1.5-flash | Answer questions about resume |
| Match Analysis | gemini-1.5-flash | Score resume vs JD |
| Resume Extraction | gemini-1.5-flash | Extract skills, experience, etc. |
| Embeddings | text-embedding-004 | Vector search for RAG |

## Free Tier Limits

- **60 requests per minute**
- **1500 requests per day**
- **1 million tokens per day**

MORE than enough for your demo and testing!

## Troubleshooting

**"GEMINI_API_KEY required" error?**
- Check `.env` file exists in `backend/` folder
- Verify key name is `GEMINI_API_KEY` (not OPENAI or ANTHROPIC)
- No quotes around the value

**Test endpoint fails?**
- Verify API key at https://aistudio.google.com/app/apikey
- Check key is active and not expired
- Make sure you copied the full key

**Upload works but analysis fails?**
- Check browser console for errors
- Verify backend is running on port 3001
- Test http://localhost:3001/api/health

## Benefits Over OpenAI/Claude

| | OpenAI | Claude | Gemini |
|---|--------|--------|--------|
| Free Tier | ❌ Trial only | 💰 $5 credits | ✅ Truly free |
| Credit Card | ✅ Required | ✅ Required | ❌ Not needed |
| API Keys Needed | 1 | 2 (Claude + Voyage) | 1 |
| Setup Time | 5 min | 10 min | 2 min |
| Quality | Excellent | Excellent | Excellent |

## Ready to Demo!

Once you see "Gemini connection working", you're all set to:
1. Upload resumes
2. Get match scores
3. Chat with Gemini about candidates
4. Record your demo video

---

**Total Setup Time**: ~ 2 minutes
**Cost**: $0 forever
**Complexity**: Simplest possible!
