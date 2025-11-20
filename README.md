# AI-Powered Resume Screening Tool

A full-stack application that uses intelligent algorithms to analyze resumes against job descriptions, providing match scores and enabling natural language Q&A about candidates.

## 🎯 Features

- **Resume Analysis**: Upload resume and job description to get instant match scoring
- **Smart Chat**: Ask questions about candidates with context-aware responses
- **Match Insights**: View strengths, gaps, and overall assessment
- **Resume Highlights**: Extract and display key skills, experience, and education
- **Modern UI**: Beautiful glassmorphic design with smooth animations
- **100% Free**: No API costs, works completely offline!

## 🛠 Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **AI**: Local rule-based system (keyword matching + pattern recognition)
- **Search**: TF-IDF keyword search
- **Document Parsing**: pdf-parse, native fs

### Frontend
- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **HTTP Client**: Axios
- **Styling**: Vanilla CSS with modern features

## 📋 Prerequisites

- Node.js 18 or higher
- npm or yarn package manager

**That's it! No API keys needed!**

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

# Create environment file (optional - has defaults)
cp .env.example .env

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
5. View match analysis and chat with the AI!

## 📁 Project Structure

```
AI-Resume-Parser/
├── backend/
│   ├── src/
│   │   ├── services/
│   │   │   ├── documentParser.ts      # PDF/TXT parsing
│   │   │   ├── textChunker.ts         # Semantic text chunking
│   │   │   ├── keywordSearchService.ts # TF-IDF search
│   │   │   ├── ragService.ts          # RAG implementation
│   │   │   └── analysisService.ts     # Match scoring
│   │   ├── routes/
│   │   │   ├── uploadRoutes.ts        # File upload & analysis
│   │   │   ├── chatRoutes.ts          # Chat endpoints
│   │   │   └── testRoutes.ts          # Health check
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
Body: file (PDF or TXT)
```

**Upload Job Description**
```
POST /api/upload/job-description
Content-Type: multipart/form-data
Body: file (PDF or TXT), sessionId
```

**Analyze Resume**
```
POST /api/upload/analyze
Content-Type: application/json
Body: { sessionId }
```

### Chat

**Ask Question**
```
POST /api/chat
Content-Type: application/json
Body: { question, sessionId }
```

**Get Chat History**
```
GET /api/chat/history/:sessionId
```

**Clear Chat History**
```
DELETE /api/chat/history/:sessionId
```

### Health Check
```
GET /api/health
```

## 💡 How It Works

This application implements a complete RAG (Retrieval-Augmented Generation) pipeline using local algorithms:

1. **Document Processing**: Parse PDFs/TXT files and extract text
2. **Text Chunking**: Split resume into semantic sections (~800 words each)
3. **Keyword Search**: Use TF-IDF algorithm for relevant chunk retrieval
4. **Pattern Recognition**: Extract skills, experience, education using regex patterns
5. **Rule-Based Analysis**: Smart matching between resume and job requirements
6. **Template-Based Chat**: Context-aware responses based on retrieved chunks

### Analysis Algorithm

The system uses:
- **Keyword Matching**: Identifies common technical skills and requirements
- **Experience Scoring**: Extracts and compares years of experience
- **Education Verification**: Detects degrees and universities
- **Weighted Scoring**: Skills (60%), Experience (30%), Education (10%)

### Chat System

The chat uses:
- **Intent Detection**: Understands what type of question is being asked
- **Context Retrieval**: Finds relevant resume sections using keyword search
- **Template Responses**: Generates natural answers based on context
- **Source Attribution**: Shows which resume sections were used

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
# Optional - system has sensible defaults
PORT=3001
NODE_ENV=development
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
FRONTEND_URL=http://localhost:5173
```

All values are optional and have defaults!

## 🐛 Troubleshooting

### Backend won't start
- Check if Node.js 18+ is installed: `node --version`
- Ensure port 3001 is not in use

### Frontend can't connect to backend
- Verify backend is running on port 3001
- Check browser console for CORS errors

### File upload fails
- Check file size is under 10MB
- Verify file extension is .pdf or .txt

## 📊 Performance

- **Document Parsing**: < 1 second for typical resume
- **Analysis**: < 1 second (all local processing)
- **Keyword Search**: < 100ms for typical query
- **Chat Response**: < 200ms (no API latency!)

## 🔐 Security

- Input validation on file uploads
- File size limits (10MB default)
- File type restrictions (.pdf, .txt only)
- CORS configuration for frontend origin
- Sanitized error messages

## 🚀 Production Deployment

### Backend
```bash
cd backend
npm run build
npm start
```

### Frontend
```bash
cd frontend
npm run build
# Serve dist/ folder with nginx or similar
```

### Environment Variables for Production

Set `NODE_ENV=production` and configure:
- `FRONTEND_URL` to your production frontend URL
- `PORT` if different from 3001

## 📈 Benefits Over API-Based Solutions

| Feature | API-Based | This App |
|---------|-----------|----------|
| Cost | $$ per request | $0 forever |
| Quota Limits | Yes | None |
| Internet Required | Yes | No |
| Privacy | Data sent to 3rd party | 100% local |
| Speed | 2-5 seconds | < 1 second |
| Reliability | API downtime | Always works |
| Setup | API keys needed | Zero config |

## 📝 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

- React team for the amazing framework
- Vite for blazing fast development experience
- TypeScript for type safety
- pdf-parse for PDF processing

## 💡 Future Enhancements

- [ ] Add more file formats (DOCX, RTF)
- [ ] Batch resume analysis
- [ ] Export reports as PDF
- [ ] Resume ranking for multiple candidates
- [ ] Custom skill dictionaries
- [ ] Multi-language support

---

**Built with ❤️ using 100% local processing - No APIs, No Costs, No Limits!**
