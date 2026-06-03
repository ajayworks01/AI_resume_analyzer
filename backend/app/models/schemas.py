from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime


class ExtractedResume(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    summary: Optional[str] = None
    skills: List[str] = []
    technical_skills: List[str] = []
    soft_skills: List[str] = []
    experience: List[Dict[str, Any]] = []
    total_experience_years: Optional[float] = None
    education: List[Dict[str, Any]] = []
    certifications: List[str] = []
    projects: List[Dict[str, Any]] = []
    languages: List[str] = []


class ResumeResponse(BaseModel):
    id: int
    filename: str
    extracted: ExtractedResume
    raw_text: str


class MatchAnalysis(BaseModel):
    overall_score: float
    ats_score: float
    skill_match_score: float
    experience_match_score: float
    education_match_score: float
    keyword_match_score: float
    matched_skills: List[str]
    missing_skills: List[str]
    matched_keywords: List[str]
    missing_keywords: List[str]
    strengths: List[str]
    weaknesses: List[str]
    suggestions: List[str]
    ats_tips: List[str]


class AnalysisResponse(BaseModel):
    id: int
    resume_id: int
    candidate_name: Optional[str]
    job_description_preview: str
    analysis: MatchAnalysis
    created_at: datetime

    class Config:
        from_attributes = True


class RankingEntry(BaseModel):
    rank: int
    resume_id: int
    candidate_name: Optional[str]
    filename: str
    overall_score: float
    skill_match: float
    experience_match: float
    missing_skills_count: int


class RankingResponse(BaseModel):
    session_id: str
    total_candidates: int
    rankings: List[RankingEntry]
    created_at: datetime
