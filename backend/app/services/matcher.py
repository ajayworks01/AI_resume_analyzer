import re
from typing import List, Dict, Any, Optional
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np


TECHNICAL_SKILLS_KEYWORDS = [
    "python", "java", "javascript", "typescript", "c++", "c#", "go", "rust", "ruby",
    "react", "angular", "vue", "node.js", "fastapi", "django", "flask", "spring",
    "sql", "mysql", "postgresql", "mongodb", "redis", "elasticsearch",
    "aws", "azure", "gcp", "docker", "kubernetes", "terraform", "jenkins",
    "git", "linux", "bash", "html", "css", "graphql", "rest", "api",
    "machine learning", "deep learning", "tensorflow", "pytorch", "scikit-learn",
    "pandas", "numpy", "spark", "hadoop", "kafka",
    "figma", "photoshop", "tableau", "power bi", "excel",
    "r", "scala", "swift", "kotlin", "php", "laravel", "next.js", "nuxt",
    "agile", "scrum", "devops", "ci/cd", "microservices", "cloud"
]


def _extract_keywords(text: str) -> List[str]:
    """Extract meaningful keywords from text."""
    text_lower = text.lower()
    found = [kw for kw in TECHNICAL_SKILLS_KEYWORDS if kw in text_lower]
    # Also extract capitalized words as potential skills
    words = re.findall(r'\b[A-Z][a-zA-Z+#.]+\b', text)
    found += [w.lower() for w in words if len(w) > 2]
    return list(set(found))


def _compute_tfidf_similarity(text1: str, text2: str) -> float:
    """Cosine similarity using TF-IDF."""
    try:
        vectorizer = TfidfVectorizer(stop_words="english", max_features=1000)
        tfidf = vectorizer.fit_transform([text1, text2])
        score = cosine_similarity(tfidf[0:1], tfidf[1:2])[0][0]
        return round(float(score) * 100, 1)
    except Exception:
        return 0.0


def _skill_match(resume_skills: List[str], jd_text: str):
    jd_lower = jd_text.lower()
    jd_skills = [kw for kw in TECHNICAL_SKILLS_KEYWORDS if kw in jd_lower]

    if not jd_skills:
        return [], [], 70.0

    resume_skills_lower = [s.lower() for s in resume_skills]
    matched = [s for s in jd_skills if s in resume_skills_lower]
    missing = [s for s in jd_skills if s not in resume_skills_lower]

    score = (len(matched) / len(jd_skills)) * 100 if jd_skills else 0
    return matched, missing, round(score, 1)


def _experience_match(resume_years: Optional[float], jd_text: str) -> float:
    """Match experience years."""
    patterns = [r"(\d+)\+?\s*years?\s+(?:of\s+)?experience", r"(\d+)\+?\s*yrs?"]
    required_years = None
    for p in patterns:
        m = re.search(p, jd_text, re.IGNORECASE)
        if m:
            required_years = float(m.group(1))
            break

    if required_years is None:
        return 75.0  # No requirement specified
    if resume_years is None:
        return 50.0  # Unknown
    if resume_years >= required_years:
        return min(100.0, (resume_years / required_years) * 90)
    else:
        return max(20.0, (resume_years / required_years) * 75)


def _education_match(resume_education: List[Dict], jd_text: str) -> float:
    jd_lower = jd_text.lower()
    degree_hierarchy = {
        "phd": 4, "doctorate": 4, "master": 3, "m.tech": 3, "msc": 3, "mba": 3,
        "bachelor": 2, "b.tech": 2, "bsc": 2, "b.e": 2, "associate": 1
    }
    required_level = 0
    for deg, level in degree_hierarchy.items():
        if deg in jd_lower:
            required_level = max(required_level, level)

    if required_level == 0:
        return 80.0

    candidate_level = 0
    for edu in resume_education:
        edu_text = str(edu).lower()
        for deg, level in degree_hierarchy.items():
            if deg in edu_text:
                candidate_level = max(candidate_level, level)

    if candidate_level >= required_level:
        return 100.0
    elif candidate_level == required_level - 1:
        return 70.0
    else:
        return 40.0


def _generate_suggestions(missing_skills: List[str], match_score: float, 
                          resume_text: str, jd_text: str) -> List[str]:
    suggestions = []

    if missing_skills:
        top_missing = missing_skills[:5]
        suggestions.append(f"Add these missing skills to your resume: {', '.join(top_missing)}")

    if match_score < 60:
        suggestions.append("Tailor your resume summary to mirror the job description language")
        suggestions.append("Use more keywords directly from the job posting")

    if "docker" in jd_text.lower() and "docker" not in resume_text.lower():
        suggestions.append("Consider adding Docker/containerization experience or projects")

    if len(resume_text) < 500:
        suggestions.append("Your resume seems short — expand on work experience and projects")

    suggestions.append("Quantify achievements with numbers (e.g., 'Improved performance by 30%')")
    suggestions.append("Ensure your resume is ATS-friendly: use standard headings and no tables/images")
    suggestions.append("Add a strong professional summary at the top matching the role")

    return suggestions[:8]


def _generate_ats_tips(resume_text: str, missing_skills: List[str]) -> List[str]:
    tips = [
        "Use standard section headings: 'Work Experience', 'Education', 'Skills'",
        "Avoid headers, footers, tables, and graphics — ATS often can't parse them",
        "Use standard fonts: Arial, Calibri, or Times New Roman",
        "Save/export as PDF or plain DOCX for best ATS compatibility",
    ]
    if missing_skills:
        tips.append(f"Include these keywords from the JD: {', '.join(missing_skills[:3])}")
    return tips


def analyze_match(
    resume_text: str,
    parsed_resume: Dict[str, Any],
    jd_text: str,
) -> Dict[str, Any]:
    """Full analysis of resume vs job description."""

    # Scores
    tfidf_score = _compute_tfidf_similarity(resume_text, jd_text)
    matched_skills, missing_skills, skill_score = _skill_match(
        parsed_resume.get("skills", []), jd_text
    )
    exp_score = _experience_match(
        parsed_resume.get("total_experience_years"), jd_text
    )
    edu_score = _education_match(
        parsed_resume.get("education", []), jd_text
    )

    # Keyword match
    jd_keywords = _extract_keywords(jd_text)
    resume_keywords = _extract_keywords(resume_text)
    matched_kw = [k for k in jd_keywords if k in resume_keywords]
    missing_kw = [k for k in jd_keywords if k not in resume_keywords]
    keyword_score = (len(matched_kw) / max(len(jd_keywords), 1)) * 100

    # Weighted overall score
    overall = (
        tfidf_score * 0.25 +
        skill_score * 0.35 +
        exp_score * 0.20 +
        edu_score * 0.10 +
        keyword_score * 0.10
    )
    overall = round(min(overall, 99.0), 1)

    # ATS score (simpler)
    ats_score = round((skill_score * 0.5 + keyword_score * 0.3 + tfidf_score * 0.2), 1)
    ats_score = min(ats_score, 99.0)

    # Strengths / Weaknesses
    strengths, weaknesses = [], []
    if skill_score >= 70:
        strengths.append(f"Strong skill alignment — {len(matched_skills)} of required skills matched")
    else:
        weaknesses.append(f"Skill gap detected — missing {len(missing_skills)} required skills")

    if exp_score >= 80:
        strengths.append("Experience level meets or exceeds job requirements")
    elif exp_score < 50:
        weaknesses.append("Experience may not fully meet the job requirements")

    if edu_score >= 90:
        strengths.append("Education qualification matches the job requirement")
    elif edu_score < 50:
        weaknesses.append("Educational qualification may be below the requirement")

    if tfidf_score >= 60:
        strengths.append("Resume content is highly relevant to the job description")
    else:
        weaknesses.append("Resume language doesn't closely mirror the job description")

    if len(matched_kw) >= 5:
        strengths.append(f"Good keyword coverage: {len(matched_kw)} relevant keywords found")

    suggestions = _generate_suggestions(missing_skills, overall, resume_text, jd_text)
    ats_tips = _generate_ats_tips(resume_text, missing_skills)

    return {
        "overall_score": overall,
        "ats_score": ats_score,
        "skill_match_score": skill_score,
        "experience_match_score": exp_score,
        "education_match_score": edu_score,
        "keyword_match_score": round(keyword_score, 1),
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "matched_keywords": matched_kw[:20],
        "missing_keywords": missing_kw[:20],
        "strengths": strengths,
        "weaknesses": weaknesses,
        "suggestions": suggestions,
        "ats_tips": ats_tips,
    }
