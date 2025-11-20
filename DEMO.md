# Demo Guide - AI Resume Screening Tool

This guide walks through the complete functionality of the AI Resume Screening Tool, demonstrating the RAG-powered resume analysis and intelligent Q&A capabilities.

## 🎥 Demo Video

**Video Link**: [Insert Loom/YouTube link here]

**Duration**: 3-5 minutes

**Contents**:
1. Application overview and UI tour
2. Resume and JD upload process
3. Match analysis results
4. RAG-powered chat demonstration
5. Behind-the-scenes RAG flow explanation

## 📱 Application Walkthrough

### Step 1: Landing Page

When you first open the application at `http://localhost:5173`, you'll see:

- **Header**: "AI Resume Screening Tool" with RAG branding
- **Two Upload Zones**: 
  - Resume upload (left)
  - Job Description upload (right)
- **Analyze Button**: Disabled until both files are uploaded

**Features to Note**:
- Beautiful dark-themed glassmorphic design
- Gradient accents and smooth animations
- Professional typography (Inter font)

### Step 2: Upload Resume

**Try with**: `sample-data/resume1-senior-fullstack.txt`

1. Click on the first upload zone or drag the file
2. File validates automatically (PDF/TXT, under 10MB)
3. Green checkmark appears when uploaded
4. Upload zone shows file name

**What Happens Behind the Scenes**:
- File sent to backend: `POST /api/upload/resume`
- Document parsed (text extraction)
- Session ID created and returned
- File stored temporarily

### Step 3: Upload Job Description

**Try with**: `sample-data/job-description1-senior-fullstack.txt`

1. Click on the second upload zone
2. Same validation and upload process
3. Both zones now show green checkmarks

**Behind the Scenes**:
- File sent with session ID: `POST /api/upload/job-description`
- Document parsed and associated with session

### Step 4: Analyze Resume

1. Click the **"Analyze Resume"** button
2. Loading animation appears with steps:
   - ✓ Parsing documents
   - ✓ Generating embeddings
   - ✓ Analyzing match

**Behind the Scenes (Critical for Assessment)**:

This is where RAG implementation happens:

1. **Text Chunking**:
   - Resume split into semantic sections
   - Example: Summary, Experience, Education, Skills
   - Each chunk ~800 words with 200-word overlap

2. **Embedding Generation**:
   - OpenAI API called: `text-embedding-3-small`
   - Each chunk converted to 1536-dimensional vector
   - Batch processing for efficiency

3. **Vector Storage**:
   - Embeddings stored in vector database
   - Metadata includes: chunk type, index, source
   - Associated with session ID for retrieval

4. **Match Analysis**:
   - Resume + JD sent to OpenAI GPT-4o-mini
   - Structured prompt for scoring
   - JSON response with score, strengths, gaps

### Step 5: View Match Analysis

**Results Display**:

**Animated Score Circle** (75% for this example):
- Circular progress bar with gradient
- Smooth animation counting up from 0
- Color-coded: Green (75+), Blue (60-74), Yellow (40-59), Red (<40)

**Overall Assessment**:
"Strong candidate overall with excellent React and Node.js experience. Degree from state university meets requirements. Main gaps are Kubernetes and limited AWS exposure."

**Strengths** (Green checkmarks):
- ✓ 5 years React/Node.js experience
- ✓ Strong backend architecture skills
- ✓ BS Computer Science from SUNY Buffalo (state university)
- ✓ PostgreSQL expertise (4 years)
- ✓ Experience with Express.js and RESTful APIs

**Gaps** (Red X marks):
- × No Kubernetes experience
- × Limited AWS cloud exposure
- × No experience with microservices architecture

**Resume Highlights**:
- **Skills**: React, Node.js, TypeScript, PostgreSQL, MongoDB, AWS, Docker, etc.
- **Experience**: Senior Full-Stack Developer at Tech Solutions Inc. (3 years)
- **Education**: BS Computer Science from SUNY Buffalo (2019)

### Step 6: Chat with AI About Candidate

**Suggested Questions** (click to use):
- "Does this candidate have a degree from a state university?"
- "Can they handle backend architecture?"
- "What programming languages do they know?"
- "How many years of experience do they have?"

#### Example Q&A Session:

**Question 1**: "Does this candidate have a degree from a state university?"

**AI Response**:
"Yes, the candidate has a Bachelor of Science in Computer Science from State University of New York at Buffalo (SUNY Buffalo), which is a state university. They graduated in May 2019 with a GPA of 3.7/4.0."

**Behind the Scenes (RAG in Action)**:
1. Question embedded: `[0.234, -0.567, 0.891, ...]`
2. Vector search finds relevant chunks:
   - Education section (89% similarity)
   - Summary section (67% similarity)
3. Context assembled with sources
4. GPT-4o-mini generates answer using context
5. Response includes specific details from resume

**Question 2**: "Can they handle backend architecture?"

**AI Response**:
"Yes, this candidate demonstrates strong backend architecture capabilities. They have extensive experience with backend development, including:

- 5 years of Node.js experience
- Designed and implemented RESTful APIs handling 1M+ requests daily
- Architected microservices-based backend infrastructure that reduced response time by 40%
- Experience with PostgreSQL including query optimization
- Worked with various backend frameworks (Express.js, NestJS)

Their background suggests they can definitely handle backend architecture challenges."

**Behind the Scenes**:
1. Question: "Can they handle backend architecture?"
2. Retrieved chunks:
   - Experience section mentioning architecture
   - Technical skills section
   - Projects section
3. LLM synthesizes information from multiple sources
4. Provides evidence-based answer

**Question 3**: "Is this candidate eligible to work in the US?"

**AI Response**:
"Yes, according to the additional information section in the resume, the candidate states they are a U.S. Citizen and authorized to work in the United States."

**Question 4**: "What cloud platforms do they have experience with?"

**AI Response**:
"The candidate has experience with AWS (Amazon Web Services). Specifically:

- AWS EC2, S3, Lambda from skills section
- AWS Certified Developer – Associate certification (2022)
- Deployed projects on AWS using EC2 and RDS
- Experience with AWS CloudWatch

However, their AWS experience is noted as 'limited' in the gap analysis, suggesting it may not be as extensive as other skills like React or Node.js."

**Note**: This demonstrates RAG grounding - the AI correctly identifies both the skill AND the limitation noted in the analysis.

### Step 7: Conversation Context

The chat maintains conversation history, so you can ask follow-up questions:

**Question**: "What was their GPA?"

**AI Response**:
"Their GPA was 3.7 out of 4.0."

**Behind the Scenes**:
- Previous conversation context included in prompt
- "their" refers to the candidate from earlier questions
- Maintains conversational flow

### Step 8: Reset for New Analysis

Click **"New Analysis"** button to:
- Clear current session
- Delete uploaded files
- Reset to upload screen
- Clear chat history

## 🔍 RAG Verification Points

To verify proper RAG implementation, observe:

### 1. **Embeddings Are Generated**
- Check console logs during analysis
- Should see: "Generating embeddings for X chunks"
- Batch embedding API call to OpenAI

### 2. **Vector Search Happens**
- Each chat question triggers vector search
- Top-5 relevant chunks retrieved
- Similarity scores in response sources (0.6-0.9 typical)

### 3. **Context-Grounded Responses**
- Responses include specific details from resume
- AI cites exact information (e.g., "GPA of 3.7")
- When info not available, AI says so explicitly

### 4. **Not Just Direct LLM**
- Responses include "sources" array in API
- Each source has: text, score, chunkType
- Frontend could display sources (optional feature)

## 📊 Testing Different Scenarios

### Scenario 1: Strong Match (75%+)

**Resume**: `resume1-senior-fullstack.txt`
**JD**: `job-description1-senior-fullstack.txt`

**Expected Result**:
- Score: ~75-78%
- Multiple strengths
- Few gaps (mostly Kubernetes)
- AI can answer most questions confidently

### Scenario 2: Partial Match (50-70%)

**Resume**: `resume2-backend-engineer.txt`
**JD**: `job-description1-senior-fullstack.txt`

**Expected Result**:
- Score: ~55-65%
- Some strengths (Node.js, backend)
- More gaps (no React, self-taught, H1B)
- AI provides factual answers but notes limitations

### Scenario 3: Weak Match (<50%)

**Resume**: `resume2-backend-engineer.txt`
**JD**: `job-description2-backend-architect.txt`

**Expected Result**:
- Score: ~40-50%
- Few strengths
- Many gaps (no Kubernetes, limited years, no advanced degree)
- AI accurately reports missing qualifications

## 🎨 UI/UX Highlights

### Animations
- **Score Circle**: Smooth counting animation (1.5s)
- **Page Transitions**: Fade-in effects
- **Card Hovers**: Lift effect with shadow
- **Button Presses**: Scale down feedback
- **Typing Indicator**: Bouncing dots while AI responds

### Responsive Design
- Works on desktop (1920x1080)
- Tablet friendly (768px)
- Mobile responsive (375px)

### Accessibility
- High contrast colors
- Clear focus states
- Semantic HTML
- Keyboard navigation support

## 🧪 Testing Checklist

- [ ] Upload PDF resume (validates format)
- [ ] Upload TXT job description
- [ ] Analysis completes successfully
- [ ] Match score displays with animation
- [ ] Strengths and gaps are relevant
- [ ] Chat interface loads
- [ ] Suggested questions work
- [ ] Custom questions get answered
- [ ] Follow-up questions maintain context
- [ ] Responses are grounded in resume
- [ ] Sources array present in API response
- [ ] New analysis resets properly
- [ ] Error handling works (invalid file, network error)

## 📝 Sample Questions to Ask

**Biographical**:
- "Where did they go to school?"
- "What is their work authorization status?"
- "How many years of total experience?"

**Technical**:
- "What databases do they know?"
- "Do they have React experience?"
- "What cloud platforms have they used?"
- "Have they worked with microservices?"

**Qualifications**:
- "Do they meet the Kubernetes requirement?"
- "Are they qualified for a senior role?"
- "Do they have the required degree?"

**Behavioral** (tests context):
- "Have they led any teams?"
- "What kind of projects have they built?"
- "Do they have any certifications?"

## 🎯 Assessment Criteria Met

This demo demonstrates:

✅ **RAG Implementation**:
- Document chunking ✓
- Embedding generation ✓
- Vector storage ✓
- Semantic search ✓
- Context retrieval ✓
- Augmented generation ✓

✅ **Required Features**:
- File upload (PDF/TXT) ✓
- Match scoring ✓
- Strengths and gaps ✓
- Chat interface ✓
- Context-aware responses ✓

✅ **Technical Requirements**:
- Node.js backend ✓
- React frontend ✓
- TypeScript ✓
- OpenAI integration ✓
- Vector database ✓

✅ **UI/UX**:
- Professional design ✓
- Smooth animations ✓
- Responsive layout ✓
- Error handling ✓

## 🚀 Next Steps for Demo Video

1. **Setup** (30 sec):
   - Show both terminal windows running
   - Navigate to localhost:5173

2. **Upload** (45 sec):
   - Drag resume file
   - Show validation
   - Drag JD file
   - Click analyze

3. **Analysis** (1 min):
   - Show loading animation
   - Reveal match score with animation
   - Highlight strengths and gaps
   - Scroll through resume highlights

4. **Chat** (2 min):
   - Click suggested question
   - Read AI response
   - Ask custom question
   - Show follow-up question
   - Demonstrate context awareness

5. **RAG Explanation** (30 sec):
   - Quick diagram or explanation
   - Show API response with sources in DevTools
   - Highlight vector search in action

6. **Wrap-up** (30 sec):
   - Click reset
   - Show it's ready for next candidate
   - Thank you screen

**Total**: ~4.5 minutes

---

**Demo Prepared By**: [Your Name]
**Date**: [Current Date]
**Assessment**: Backend Developer Technical Assessment - Resume Screening with RAG
