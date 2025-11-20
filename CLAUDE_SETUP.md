# Setup Guide - Claude Sonnet + Voyage AI Version

## 🎉 What Changed

I've switched the application from OpenAI to:
- **Claude Sonnet 3.5** for chat and analysis (better quality, generous free tier)
- **Voyage AI** for embeddings (optimized for RAG, free tier available)

Both services offer free tiers that are perfect for this demo!

## 🚀 Quick Setup (5 minutes)

### 1. Get Your API Keys (FREE)

#### Anthropic API Key (for Claude)
1. Go to https://console.anthropic.com/
2. Sign up or log in
3. Go to "API Keys" section
4. Click "Create Key"
5. Copy your key (starts with `sk-ant-...`)

**Free Tier**: $5 credits for new users!

#### Voyage AI API Key (for Embeddings)
1. Go to https://www.voyageai.com/
2. Sign up for free account
3. Go to Dashboard → API Keys
4. Create new API key
5. Copy your key (starts with `pa-...`)

**Free Tier**: 100M tokens/month free!

### 2. Configure Backend

Edit your `backend/.env` file:

```env
# AI API Keys
ANTHROPIC_API_KEY=sk-ant-your-key-here
VOYAGE_API_KEY=pa-your-key-here

# Server Configuration
PORT=3001
NODE_ENV=development

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads

# CORS Configuration
FRONTEND_URL=http://localhost:5173
```

**IMPORTANT**: 
- No spaces around `=`
- No quotes
- Replace the placeholder values with your actual keys

### 3. Restart Backend

The backend should auto-reload, but if not:
```bash
# Stop the current backend (Ctrl+C)
# Then restart:
cd backend
npm run dev
```

You should see:
```
🚀 Server is running on port 3001
📊 Health check: http://localhost:3001/api/health
🔧 Environment: development
```

### 4. Test the Connection

**Test Claude**:
```
http://localhost:3001/api/test/claude
```

**Test Voyage AI**:
```
http://localhost:3001/api/test/voyage
```

Both should return success messages!

### 5. Try the Application

1. Go to http://localhost:5173
2. Upload resume + job description
3. Click "Analyze Resume"
4. Chat with the AI!

## 🔍 Why This Is Better

**Claude Sonnet 3.5**:
- ✅ More accurate and nuanced responses
- ✅ Better at following instructions
- ✅ Excellent at JSON extraction
- ✅ Generous free tier ($5 credits)

**Voyage AI**:
- ✅ Optimized specifically for RAG
- ✅ Better embedding quality for retrieval
- ✅ 100M tokens/month free tier
- ✅ Faster embedding generation

## 🐛 Troubleshooting

**Backend won't start?**
- Check both API keys are set in `.env`
- Make sure no quotes around values
- Verify keys are valid (test endpoints above)

**"API key not configured" error?**
- Double check `.env` file has correct variable names:
  - `ANTHROPIC_API_KEY` (not OPENAI_API_KEY)
  - `VOYAGE_API_KEY`

**Test endpoints fail?**
- Anthropic: Check account has credits at https://console.anthropic.com/
- Voyage: Verify API key at https://www.voyageai.com/

## 📝 What Still Works

Everything! The application functionality is exactly the same:
- ✅ Resume upload and parsing
- ✅ Match scoring (now even better with Claude!)
- ✅ Strengths and gaps analysis
- ✅ RAG-powered chat
- ✅ Context-aware responses
- ✅ Conversation memory

## 🎯 Benefits for Your Demo

1. **Free to use** - Both services have generous free tiers
2. **Better quality** - Claude is known for superior response quality
3. **Optimized RAG** - Voyage AI embeddings are specifically designed for retrieval
4. **No quota issues** - Fresh accounts with ample credits

---

**Ready to go?** Just add your API keys to `.env` and restart the backend!
