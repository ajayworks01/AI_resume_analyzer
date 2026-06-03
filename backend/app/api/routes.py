import os
import uuid
import aiofiles
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Form
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional

from app.database.db import get_db
from app.models.db_models import ResumeRecord, AnalysisRecord, RankingRecord
from app.services.resume_parser import extract_text, parse_resume
from app.services.matcher import analyze_match
from app.config import settings

router = APIRouter()

ALLOWED_EXTENSIONS = {"pdf", "docx", "doc"}
MAX_SIZE = settings.MAX_FILE_SIZE_MB * 1024 * 1024


def _allowed_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


# ──────────────────────────────────────────────────────────────────────────────
# UPLOAD RESUME
# ──────────────────────────────────────────────────────────────────────────────

@router.post("/upload-resume")
async def upload_resume(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):
    if not _allowed_file(file.filename):
        raise HTTPException(400, "Only PDF and DOCX files are supported")

    content = await file.read()
    if len(content) > MAX_SIZE:
        raise HTTPException(413, f"File too large. Max size is {settings.MAX_FILE_SIZE_MB}MB")

    # Save file
    unique_name = f"{uuid.uuid4()}_{file.filename}"
    file_path = os.path.join(settings.UPLOAD_DIR, unique_name)
    async with aiofiles.open(file_path, "wb") as f:
        await f.write(content)

    # Extract & parse
    try:
        raw_text = extract_text(content, file.filename)
        parsed = parse_resume(raw_text)
    except ValueError as e:
        raise HTTPException(422, str(e))

    # Save to DB
    record = ResumeRecord(
        filename=file.filename,
        candidate_name=parsed.get("name"),
        email=parsed.get("email"),
        phone=parsed.get("phone"),
        location=parsed.get("location"),
        raw_text=raw_text,
        extracted_data=parsed,
    )
    db.add(record)
    await db.commit()
    await db.refresh(record)

    return {
        "id": record.id,
        "filename": file.filename,
        "extracted": parsed,
        "raw_text": raw_text[:500] + "..." if len(raw_text) > 500 else raw_text,
    }


# ──────────────────────────────────────────────────────────────────────────────
# ANALYZE RESUME (with JD text)
# ──────────────────────────────────────────────────────────────────────────────

@router.post("/analyze-resume")
async def analyze_resume(
    resume_id: int = Form(...),
    job_description: str = Form(...),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(ResumeRecord).where(ResumeRecord.id == resume_id))
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(404, "Resume not found")

    analysis = analyze_match(record.raw_text, record.extracted_data or {}, job_description)

    analysis_record = AnalysisRecord(
        resume_id=resume_id,
        job_description=job_description,
        match_score=analysis["overall_score"],
        ats_score=analysis["ats_score"],
        skill_match=analysis["skill_match_score"],
        experience_match=analysis["experience_match_score"],
        analysis_data=analysis,
    )
    db.add(analysis_record)
    await db.commit()
    await db.refresh(analysis_record)

    return {
        "id": analysis_record.id,
        "resume_id": resume_id,
        "candidate_name": record.candidate_name,
        "job_description_preview": job_description[:100] + "...",
        "analysis": analysis,
        "created_at": analysis_record.created_at,
    }


# ──────────────────────────────────────────────────────────────────────────────
# MATCH RESUME (upload JD as file)
# ──────────────────────────────────────────────────────────────────────────────

@router.post("/match-resume")
async def match_resume(
    resume_id: int = Form(...),
    jd_file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):
    content = await jd_file.read()
    jd_text = extract_text(content, jd_file.filename)

    result = await db.execute(select(ResumeRecord).where(ResumeRecord.id == resume_id))
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(404, "Resume not found")

    analysis = analyze_match(record.raw_text, record.extracted_data or {}, jd_text)

    return {
        "resume_id": resume_id,
        "candidate_name": record.candidate_name,
        "analysis": analysis,
    }


# ──────────────────────────────────────────────────────────────────────────────
# RANK RESUMES
# ──────────────────────────────────────────────────────────────────────────────

@router.post("/rank-resumes")
async def rank_resumes(
    resume_ids: str = Form(...),  # comma-separated ids
    job_description: str = Form(...),
    db: AsyncSession = Depends(get_db),
):
    ids = [int(i.strip()) for i in resume_ids.split(",") if i.strip().isdigit()]
    if not ids:
        raise HTTPException(400, "Provide at least one resume_id")

    rankings = []
    for resume_id in ids:
        result = await db.execute(select(ResumeRecord).where(ResumeRecord.id == resume_id))
        record = result.scalar_one_or_none()
        if not record:
            continue
        analysis = analyze_match(record.raw_text, record.extracted_data or {}, job_description)
        rankings.append({
            "resume_id": resume_id,
            "candidate_name": record.candidate_name or record.filename,
            "filename": record.filename,
            "overall_score": analysis["overall_score"],
            "skill_match": analysis["skill_match_score"],
            "experience_match": analysis["experience_match_score"],
            "missing_skills_count": len(analysis["missing_skills"]),
            "matched_skills": analysis["matched_skills"],
            "strengths": analysis["strengths"],
        })

    rankings.sort(key=lambda x: x["overall_score"], reverse=True)
    for i, r in enumerate(rankings):
        r["rank"] = i + 1

    session_id = str(uuid.uuid4())[:8]
    ranking_record = RankingRecord(
        session_id=session_id,
        job_description=job_description,
        rankings_data=rankings,
    )
    db.add(ranking_record)
    await db.commit()
    await db.refresh(ranking_record)

    return {
        "session_id": session_id,
        "total_candidates": len(rankings),
        "rankings": rankings,
        "created_at": ranking_record.created_at,
    }


# ──────────────────────────────────────────────────────────────────────────────
# GET ANALYSIS
# ──────────────────────────────────────────────────────────────────────────────

@router.get("/analysis/{analysis_id}")
async def get_analysis(analysis_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(AnalysisRecord).where(AnalysisRecord.id == analysis_id))
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(404, "Analysis not found")
    return record


@router.get("/analyses")
async def list_analyses(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(AnalysisRecord).order_by(AnalysisRecord.created_at.desc()).limit(50))
    return result.scalars().all()


@router.get("/rankings")
async def get_rankings(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(RankingRecord).order_by(RankingRecord.created_at.desc()).limit(20))
    return result.scalars().all()


@router.get("/resumes")
async def list_resumes(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ResumeRecord).order_by(ResumeRecord.created_at.desc()).limit(100))
    records = result.scalars().all()
    return [
        {
            "id": r.id,
            "filename": r.filename,
            "candidate_name": r.candidate_name,
            "email": r.email,
            "created_at": r.created_at,
        }
        for r in records
    ]
