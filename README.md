# AI-Powered Resume Screening Tool

A full-stack application that uses RAG (Retrieval-Augmented Generation) to intelligently analyze resumes against job descriptions, providing match scores and enabling natural language Q&A about candidates.

## 🎯 Features

- **Resume Analysis**: Upload resume and job description to get instant match scoring
- **RAG-Powered Chat**: Ask questions about candidates with context-aware responses
- **Match Insights**: View strengths, gaps, and overall assessment
- **Resume Highlights**: Extract and display key skills, experience, and education
- **Modern UI**: Beautiful glassmorphic design with smooth animations
- **Real-time Processing**: Fast document parsing and embedding generation

## 🛠 Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **LLM**: OpenAI GPT-4o-mini & text-embedding-3-small
- **Vector Store**: In-memory (production-ready for Pinecone/Qdrant)
- **Document Parsing**: pdf-parse, native fs

### Frontend
- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **HTTP Client**: Axios
- **Styling**: Vanilla CSS with modern features

## 📋 Prerequisites

Before you begin, ensure you have:

- Node.js 18 or higher installed
- npm or yarn package manager
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd AI-Resume-Parser
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env and add your OpenAI API key
# OPENAI_API_KEY=your_openai_api_key_here

# Start development server
npm run dev
```

The backend server will start on `http://localhost:3001`

### 3. Frontend Setup

Open a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will start on `http://localhost:5173`

### 4. Test the Application

1. Open your browser to `http://localhost:5173`
2. Upload a resume from `sample-data/` folder
3. Upload a job description from `sample-data/` folder
4. Click "Analyze Resume"
5. View match analysis and chat with the AI about the candidate

## 📁 Project Structure

```
AI-Resume-Parser/
├── backend/
│   ├── src/
│   │   ├── services/
│   │   │   ├── documentParser.ts      # PDF/TXT parsing
│   │   │   ├── textChunker.ts         # Semantic text chunking
│   │   │   ├── embeddingService.ts    # OpenAI embeddings
│   │   │   ├── vectorStore.ts         # In-memory vector DB
│   │   │   ├── ragService.ts          # RAG implementation
│   │   │   └── analysisService.ts     # Match scoring
│   │   ├── routes/
│   │   │   ├── uploadRoutes.ts        # File upload & analysis
│   │   │   └── chatRoutes.ts          # Chat endpoints
│   │   ├── middleware/
│   │   │   └── errorHandler.ts        # Error handling
│   │   ├── app.ts                     # Express app setup
│   │   └── server.ts                  # Entry point
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── FileUpload.tsx         # File upload component
│   │   │   ├── MatchAnalysis.tsx      # Analysis display
│   │   │   └── ChatInterface.tsx      # Chat UI
│   │   ├── services/
│   │   │   └── api.ts                 # API client
│   │   ├── App.tsx                    # Main component
│   │   ├── main.tsx                   # Entry point
│   │   └── index.css                  # Global styles
│   ├── package.json
│   └── vite.config.ts
├── sample-data/
│   ├── resume1-senior-fullstack.txt
│   ├── resume2-backend-engineer.txt
│   ├── job-description1-senior-fullstack.txt
│   └── job-description2-backend-architect.txt
└── README.md
```

## 🔌 API Endpoints

### Upload & Analysis

**Upload Resume**
```
POST /api/upload/resume
Content-Type: multipart/form-data

Request Body:
- file: PDF or TXT file
- sessionId: (optional) existing session ID

Response:
{
  "status": "success",
  "sessionId": "uuid",
  "data": {
    "fileName": "resume.pdf",
    "fileType": "pdf",
    "wordCount": 450
  }
}
```

**Upload Job Description**
```
POST /api/upload/job-description
Content-Type: multipart/form-data

Request Body:
- file: PDF or TXT file
- sessionId: session ID from resume upload

Response:
{
  "status": "success",
  "data": {
    "fileName": "jd.txt",
    "fileType": "txt",
    "wordCount": 350
  }
}
```

**Analyze Resume**
```
POST /api/upload/analyze
Content-Type: application/json

Request Body:
{
  "sessionId": "uuid"
}

Response:
{
  "status": "success",
  "data": {
    "analysis": {
      "matchScore": 75,
      "strengths": ["React expertise", "Node.js experience", "CS degree"],
      "gaps": ["No Kubernetes", "Limited AWS"],
      "overallAssessment": "Strong candidate overall..."
    },
    "resumeInfo": {
      "skills": ["React", "Node.js", "PostgreSQL"],
      "experience": ["Senior Developer at Tech Co"],
      "education": ["BS CS from SUNY Buffalo"],
      "summary": "5+ years full-stack developer"
    },
    "sessionId": "uuid"
  }
}
```

### Chat (RAG)

**Ask Question**
```
POST /api/chat
Content-Type: application/json

Request Body:
{
  "question": "Does this candidate have a state university degree?",
  "sessionId": "uuid"
}

Response:
{
  "status": "success",
  "data": {
    "answer": "Yes, the candidate has a Bachelor of Science in Computer Science from SUNY Buffalo...",
    "sources": [
      {
        "text": "Bachelor of Science in Computer Science\nState University of New York at Buffalo...",
        "score": 0.89,
        "chunkType": "section"
      }
    ],
    "conversationId": "uuid"
  }
}
```

**Get Chat History**
```
GET /api/chat/history/:sessionId

Response:
{
  "status": "success",
  "data": {
    "history": [
      {
        "role": "user",
        "content": "Does the candidate have React experience?"
      },
      {
        "role": "assistant",
        "content": "Yes, the candidate has 5 years of React experience..."
      }
    ],
    "messageCount": 2
  }
}
```

## 💡 How RAG Works

This application implements a complete RAG pipeline:

1. **Document Processing**: Parse PDFs/TXT files and extract text
2. **Text Chunking**: Split resume into semantic sections (~800 words each)
3. **Embedding Generation**: Convert chunks to vectors using OpenAI embeddings
4. **Vector Storage**: Store embeddings in vector database with metadata
5. **Query Processing**: Convert user questions to embeddings
6. **Retrieval**: Find top-5 most relevant resume chunks using cosine similarity
7. **Augmented Generation**: Pass retrieved context + question to LLM for grounded response

This ensures responses are **factual** and **grounded in resume content**, not hallucinated.

## 🎨 UI Features

- **Drag & Drop**: Upload files by dragging into upload zones
- **Animated Score**: Circular progress indicator with smooth animation
- **Glassmorphism**: Modern frosted glass effects throughout
- **Responsive**: Works beautifully on desktop, tablet, and mobile
- **Dark Mode**: Professional dark theme with vibrant accents
- **Smooth Transitions**: Micro-animations enhance user experience

## 🔧 Configuration

### Environment Variables

Backend `.env`:
```bash
# Required
OPENAI_API_KEY=your_openai_api_key_here

# Optional
PORT=3001
NODE_ENV=development
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
FRONTEND_URL=http://localhost:5173
```

### Customization

**Adjust chunk size** (backend/src/services/textChunker.ts):
```typescript
const chunker = new TextChunker(800, 200); // size, overlap
```

**Change LLM model** (backend/src/services/ragService.ts):
```typescript
model: 'gpt-4o-mini' // or 'gpt-4', 'gpt-3.5-turbo'
```

**Modify retrieval count** (backend/src/services/ragService.ts):
```typescript
await this.vectorStore.search(question, 5); // top-k results
```

## 🐛 Troubleshooting

### Backend won't start
- Check if Node.js 18+ is installed: `node --version`
- Verify OpenAI API key is set in `.env`
- Ensure port 3001 is not in use

### Frontend can't connect to backend
- Verify backend is running on port 3001
- Check browser console for CORS errors
- Ensure Vite proxy is configured correctly

### RAG not working properly
- Check OpenAI API key has sufficient credits
- Verify embeddings are being generated (check logs)
- Ensure resume is being parsed correctly

### File upload fails
- Check file size is under 10MB
- Verify file extension is .pdf or .txt
- Check uploads directory exists and is writable

## 📊 Performance

- **Document Parsing**: < 1 second for typical resume
- **Embedding Generation**: ~2-3 seconds for average resume (10-15 chunks)
- **Vector Search**: < 100ms for typical query
- **Chat Response**: 2-4 seconds including retrieval + LLM generation

## 🔐 Security Considerations

- Environment variables for sensitive data
- Input validation on file uploads
- File size limits (10MB default)
- File type restrictions (.pdf, .txt only)
- CORS configuration for frontend origin
- Error messages don't expose internals

## 📈 Future Enhancements

- [ ] Replace in-memory vector store with Pinecone/Qdrant
- [ ] Add user authentication
- [ ] Support batch resume analysis
- [ ] Export analysis reports as PDF
- [ ] Add more file formats (DOCX, RTF)
- [ ] Implement resume ranking for multiple candidates
- [ ] Add email notifications
- [ ] Build Chrome extension

## 📝 License

MIT License - See LICENSE file for details

## 👥 Support

For questions or issues:
- Email: anshul@jobtalk.ai
- Create an issue in the repository

## 🙏 Acknowledgments

- OpenAI for GPT and embedding models
- React team for the amazing framework
- Vite for blazing fast development experience
