# AI Resume Screening Tool - Architecture Documentation

## System Overview

The AI Resume Screening Tool is a full-stack application that uses intelligent local algorithms to analyze resumes against job descriptions and provide conversational Q&A capabilities - all without external APIs!

## High-Level Architecture

```mermaid
graph TD
    A[User Browser] -->|HTTP| B[React Frontend]
    B -->|REST API| C[Express Backend]
    C -->|Parse| D[Document Parser]
    C -->|Chunk| E[Text Chunker]
    E -->|Store| F[Keyword Search Service]
    C -->|Query| F
    F -->|Retrieve Context| G[RAG Service]
    G -->|Generate Response| G
    C -->|Analyze| H[Analysis Service]
    H -->|Return Results| C
```

## Key Innovation: 100% Local Processing

Unlike traditional AI applications that rely on expensive APIs, this system uses:
- **Keyword Search**: TF-IDF algorithm for semantic-ish retrieval
- **Pattern Recognition**: Regex and rule-based extraction
- **Template Responses**: Context-aware answer generation
- **Smart Matching**: Weighted scoring algorithms

**Benefits**:
- ✅ $0 cost forever
- ✅ No API quotas
- ✅ Works offline
- ✅ < 1 second response times
- ✅ 100% private (data never leaves your machine)

## System Components

### Frontend Layer (React + TypeScript)

**Technology**: React 18, TypeScript, Vite, Axios

**Components**:
- `App.tsx`: Main application orchestrator
- `FileUpload.tsx`: Drag-and-drop file upload
- `MatchAnalysis.tsx`: Displays match score and insights
- `ChatInterface.tsx`: Conversational UI

**State Management**: Local React state (useState)

### Backend Layer (Node.js + Express + TypeScript)

**Technology**: Node.js 18+, Express.js, TypeScript

**Core Services**:

#### 1. Document Parser (`documentParser.ts`)
- Extracts text from PDF and TXT files
- Uses pdf-parse library
- Validates file type and size
- Cleans and normalizes text

#### 2. Text Chunker (`textChunker.ts`)  
- Splits documents into semantic sections
- Detects resume structure (Summary, Experience, Skills, etc.)
- Configurable chunk size (800 words default)
- Maintains context with overlap (200 words)

#### 3. Keyword Search Service (`keywordSearchService.ts`)
- TF-IDF based ranking algorithm
- Calculates term frequency and inverse document frequency
- Scores relevance based on:
  - Exact phrase matching (highest weight)
  - Individual term frequency
  - Partial matching
  - Document length normalization
- Returns top-K relevant chunks

#### 4. RAG Service (`ragService.ts`)
- Implements complete RAG pipeline locally
- **Flow**:
  1. Question → Keyword Search
  2. Retrieve top-5 relevant chunks
  3. Detect question intent (education, skills, experience, etc.)
  4. Generate template-based response using context
  5. Return answer with source attribution
- **Question Types**:
  - Education questions
  - Experience/years questions
  - Skills/technology questions
  - Work history questions
  - Authorization/visa questions
  - Generic questions
- Maintains conversation history (last 10 messages)

#### 5. Analysis Service (`analysisService.ts`)
- **Match Scoring**:
  - Extracts skills from both resume and JD
  - Identifies matching and missing skills
  - Compares years of experience
  - Verifies education requirements
  - Calculates weighted score:
    - Skills: 60%
    - Experience: 30%
    - Education: 10%
- **Strength Generation**:
  - Identifies standout qualifications
  - Highlights relevant experience
  - Notes advanced degrees or certifications
- **Gap Analysis**:
  - Lists missing required skills
  - Flags experience shortfalls
  - Notes missing education credentials
- **Information Extraction**:
  - Skills list
  - Work experience
  - Education details
  - Professional summary

## Data Flow

### Upload & Analysis Flow

```
1. User uploads resume (PDF/TXT)
   ↓
2. DocumentParser extracts text
   ↓
3. User uploads job description
   ↓  
4. User clicks "Analyze"
   ↓
5. TextChunker splits resume semantically
   ↓
6. KeywordSearchService indexes chunks
   ↓
7. AnalysisService performs matching:
   - Extract skills/experience/education
   - Calculate match score
   - Generate strengths/gaps
   ↓
8. Return results to frontend
   ↓
9. Display animated match score + insights
```

### Chat Flow

```
1. User asks question
   ↓
2. KeywordSearchService retrieves relevant chunks
   ↓
3. RAGService detects question type
   ↓
4. Generate answer using template + context
   ↓
5. Return answer + source chunks
   ↓
6. Display in chat interface
```

## Algorithms

### TF-IDF Keyword Search

```
For each document chunk:
  score = 0
  
  # Exact phrase matching
  if query_phrase in document:
    score += 10
  
  # Term frequency
  for term in query_terms:
    if term in document:
      occurrences = count(term in document)
      score += log(1 + occurrences)
  
  # Normalize by document length
  score = score / log(1 + document_length)
  
Return top-K chunks by score
```

### Match Scoring

```
# Extract skills
resume_skills = extract_skills(resume)
required_skills = extract_skills(job_description)

# Skill matching
matching_skills = intersection(resume_skills, required_skills)
skill_score = (len(matching_skills) / len(required_skills)) * 100

# Experience matching  
candidate_years = extract_years(resume)
required_years = extract_years(job_description)
experience_score = min(100, (candidate_years / required_years) * 100)

# Education matching
has_education = check_education(resume, job_description)
education_score = 100 if has_education else 0

# Weighted final score
match_score = (skill_score * 0.6) + 
              (experience_score * 0.3) + 
              (education_score * 0.1)
```

### Pattern Recognition

Uses regex patterns to extract information:

```typescript
// Years of experience
/(\d+)\+?\s*(?:years?|yrs?)\s*(?:of\s+)?(?:experience|exp)/i

// Education
/bachelor[^.\n]*/i
/master[^.\n]*/i

// Job titles
/(?:senior|lead|staff)?\s*(?:software|full[\s-]?stack|backend)\s*(?:engineer|developer)/i

// Date ranges
/(\d{4})\s*-\s*(?:present|\d{4})/gi
```

## Performance

All operations are local and fast:

| Operation | Time |
|-----------|------|
| PDF Parsing | < 1s |
| Text Chunking | < 100ms |
| Keyword Indexing | < 50ms |
| Search Query | < 100ms |
| Analysis | < 500ms |
| Chat Response | < 200ms |

**Total Analysis Time**: ~1-2 seconds
**Total Chat Response**: < 500ms

## Scalability

Since everything runs locally:
- Memory usage: ~50-100MB per session
- CPU usage: Minimal (regex + string operations)
- No network latency
- Linear scaling with document size

**Limitations**:
- Not suitable for ML-based similarity (by design)
- Keyword matching may miss semantic relationships
- Pattern recognition requires common resume formats

**Strengths**:
- Zero marginal cost per request
- Predictable performance
- No external dependencies
- Complete privacy

## Security

- Input validation on uploads
- File size limits (10MB)
- File type restrictions (.pdf, .txt)
- CORS configuration
- No sensitive data sent externally
- Sanitized file names

## Future Enhancements

1. **Improved Matching**:
   - Synonym detection
   - Skill taxonomy
   - Fuzzy matching

2. **More Features**:
   - Batch processing
   - Resume ranking
   - Export reports
   - Custom scoring weights

3. **Better NLP**:
   - Named entity recognition
   - Sentiment analysis
   - Summarization

4. **Deployment**:
   - Docker containers
   - Horizontal scaling
   - Load balancing

## Comparison with AI API Solutions

| Aspect | This App | OpenAI/Claude |
|--------|----------|---------------|
| Cost | $0 | $0.03-0.10 per analysis |
| Speed | < 1s | 2-5s |
| Privacy | 100% local | Data sent to API |
| Reliability | Always works | API downtime risk |
| Customization | Full control | Limited |
| Accuracy | Very good for resumes | Excellent for all text |

## Conclusion

This architecture demonstrates that sophisticated resume screening doesn't require expensive AI APIs. By using smart algorithms and pattern recognition, we've built a production-ready system that's:

- **Free**: No ongoing costs
- **Fast**: Sub-second responses
- **Private**: Data never leaves your server
- **Reliable**: No external dependencies
- **Scalable**: Linear performance

Perfect for:
- Companies processing many resumes
- Cost-conscious startups
- Privacy-sensitive applications
- Offline deployments
- Educational/demo purposes
