from sqlalchemy import Column, Integer, String, Float, Text, DateTime, JSON
from sqlalchemy.sql import func
from app.database.db import Base


class ResumeRecord(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255))
    candidate_name = Column(String(255))
    email = Column(String(255))
    phone = Column(String(100))
    location = Column(String(255))
    raw_text = Column(Text)
    extracted_data = Column(JSON)  # full parsed JSON
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class AnalysisRecord(Base):
    __tablename__ = "analyses"

    id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(Integer)
    job_description = Column(Text)
    match_score = Column(Float)
    ats_score = Column(Float)
    skill_match = Column(Float)
    experience_match = Column(Float)
    analysis_data = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class RankingRecord(Base):
    __tablename__ = "rankings"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(100))
    job_description = Column(Text)
    rankings_data = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
