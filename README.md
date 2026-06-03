# AI Resume Analyzer

A full-stack AI-powered resume analysis platform that parses resumes, matches them against job descriptions, and provides actionable insights.

![AI Resume Analyzer](https://img.shields.io/badge/AI-Resume%20Analyzer-blue?style=for-the-badge)
![Python](https://img.shields.io/badge/Python-3.10+-green?style=flat-square)
![React](https://img.shields.io/badge/React-18+-blue?style=flat-square)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-teal?style=flat-square)

---

## Features

-  **Resume Upload** – PDF & DOCX support with drag-and-drop
-  **AI Parsing** – Extracts name, email, skills, experience, education automatically
-  **JD Matching** – Compare resume vs job description with detailed scoring
-  **Analytics Dashboard** – Match scores, skill charts, ATS compatibility
-  **Candidate Ranking** – Rank multiple resumes by relevance
-  **AI Suggestions** – Actionable improvement recommendations
- **Dark/Light Mode** – Full theme support
-  **Export Reports** – Download analysis as PDF/JSON

---

##  Quick Start

### Prerequisites

- Python 3.10+
- Node.js 18+
- pip & npm

---

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/ai-resume-analyzer.git
cd ai-resume-analyzer
```

---

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Mac/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Download spaCy model
python -m spacy download en_core_web_sm

# Copy environment file
cp .env.example .env

# Run the backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be live at: http://localhost:8000  
API Docs: http://localhost:8000/docs

---

### 3. Frontend Setup

```bash
# Open new terminal
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start the app
npm start
```

Frontend will be live at: http://localhost:3000

---

##  Project Structure

```
ai-resume-analyzer/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app entry point
│   │   ├── api/
│   │   │   └── routes.py        # All API endpoints
│   │   ├── services/
│   │   │   ├── resume_parser.py # Resume text extraction
│   │   │   ├── ai_analyzer.py   # AI analysis logic
│   │   │   └── matcher.py       # JD matching engine
│   │   ├── models/
│   │   │   └── schemas.py       # Pydantic models
│   │   ├── database/
│   │   │   └── db.py            # SQLite/SQLAlchemy setup
│   │   └── utils/
│   │       └── helpers.py       # Utility functions
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx              # Root component + routing
│   │   ├── components/          # Reusable UI components
│   │   ├── pages/               # Route pages
│   │   ├── services/            # API service layer
│   │   └── hooks/               # Custom React hooks
│   ├── package.json
│   └── .env.example
│
├── sample_data/                 # Test resumes & JDs
├── docker-compose.yml
└── README.md
```

---

##  API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/upload-resume` | Upload PDF/DOCX resume |
| POST | `/upload-job-description` | Upload or paste JD |
| POST | `/analyze-resume` | Full AI analysis |
| POST | `/match-resume` | Match resume vs JD |
| POST | `/rank-resumes` | Rank multiple resumes |
| GET | `/analysis/{id}` | Get saved analysis |
| GET | `/rankings` | Get all rankings |

---

##  Docker (Optional)
```bash
docker-compose up --build
```

---

##  Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, Tailwind CSS, Recharts |
| Backend | Python FastAPI, SQLAlchemy |
| AI/NLP | spaCy, scikit-learn, transformers |
| Database | SQLite (dev) / PostgreSQL (prod) |
| Auth | JWT tokens |

---

##  Environment Variables

### Backend `.env`
```
SECRET_KEY=your-secret-key-here
DATABASE_URL=sqlite:///./resume_analyzer.db
ALLOWED_ORIGINS=http://localhost:3000
```

### Frontend `.env`
```
REACT_APP_API_URL=http://localhost:8000
```

---

##  Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit: `git commit -m "Add my feature"`
4. Push: `git push origin feature/my-feature`
5. Open a Pull Request

---

## License

MIT License — free to use and modify.
