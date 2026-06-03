import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Cpu, FileText, ChevronRight, Loader } from 'lucide-react';
import DropZone from '../components/DropZone';
import AnalysisResult from '../components/AnalysisResult';
import { resumeService } from '../services/api';

const STEPS = ['Upload Resume', 'Job Description', 'Results'];

export default function AnalyzePage() {
  const [step, setStep] = useState(0);
  const [resumeFile, setResumeFile] = useState(null);
  const [uploadedResume, setUploadedResume] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!resumeFile) return toast.error('Please select a resume file');
    setLoading(true);
    try {
      const res = await resumeService.upload(resumeFile);
      setUploadedResume(res.data);
      setStep(1);
      toast.success(`Resume uploaded: ${res.data.extracted?.name || resumeFile.name}`);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) return toast.error('Please enter a job description');
    if (jobDescription.trim().length < 50) return toast.error('Job description is too short');
    setLoading(true);
    try {
      const res = await resumeService.analyze(uploadedResume.id, jobDescription);
      setAnalysis(res.data);
      setStep(2);
      toast.success('Analysis complete!');
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep(0);
    setResumeFile(null);
    setUploadedResume(null);
    setJobDescription('');
    setAnalysis(null);
  };

  return (
    <div className="min-h-screen p-6 md:p-10 max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-white flex items-center gap-3">
          <Cpu size={28} className="text-sky-400" /> Resume Analyzer
        </h1>
        <p className="text-slate-400 mt-1">Upload a resume and match it against a job description</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <React.Fragment key={s}>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              i === step ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
              : i < step ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-500'
            }`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                i < step ? 'bg-emerald-500 text-white' : i === step ? 'bg-sky-500 text-white' : 'bg-slate-700 text-slate-500'
              }`}>
                {i < step ? '✓' : i + 1}
              </span>
              <span className="hidden sm:inline">{s}</span>
            </div>
            {i < STEPS.length - 1 && <ChevronRight size={14} className="text-slate-600" />}
          </React.Fragment>
        ))}
      </div>

      {/* Step 0: Upload */}
      {step === 0 && (
        <div className="glass-card p-6 animate-slide-up">
          <h2 className="font-display font-semibold text-white mb-1 flex items-center gap-2">
            <FileText size={18} className="text-sky-400" /> Upload Resume
          </h2>
          <p className="text-slate-400 text-sm mb-5">Supports PDF and DOCX formats up to 10MB</p>
          <DropZone onFile={setResumeFile} label="resume (PDF/DOCX)" />
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleUpload}
              disabled={!resumeFile || loading}
              className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader size={16} className="animate-spin" /> : <Cpu size={16} />}
              {loading ? 'Uploading...' : 'Upload & Parse'}
            </button>
          </div>
        </div>
      )}

      {/* Step 1: JD */}
      {step === 1 && uploadedResume && (
        <div className="space-y-5 animate-slide-up">
          {/* Parsed info */}
          <div className="glass-card p-5">
            <h3 className="font-semibold text-white mb-3 flex items-center gap-2 text-sm">
              <FileText size={16} className="text-emerald-400" /> Parsed Resume
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                ['Name', uploadedResume.extracted?.name],
                ['Email', uploadedResume.extracted?.email],
                ['Phone', uploadedResume.extracted?.phone],
                ['Location', uploadedResume.extracted?.location],
                ['Experience', uploadedResume.extracted?.total_experience_years ? `${uploadedResume.extracted.total_experience_years} yrs` : null],
                ['Education', uploadedResume.extracted?.education?.[0]?.degree?.slice(0, 30)],
              ].filter(([, v]) => v).map(([k, v]) => (
                <div key={k} className="bg-slate-800/60 rounded-lg px-3 py-2">
                  <p className="text-xs text-slate-500">{k}</p>
                  <p className="text-sm text-slate-200 truncate">{v}</p>
                </div>
              ))}
            </div>
            {uploadedResume.extracted?.technical_skills?.length > 0 && (
              <div className="mt-3">
                <p className="text-xs text-slate-500 mb-2">Detected Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {uploadedResume.extracted.technical_skills.slice(0, 15).map((s) => (
                    <span key={s} className="text-xs bg-sky-500/10 text-sky-300 border border-sky-500/20 px-2 py-0.5 rounded-md">{s}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* JD input */}
          <div className="glass-card p-6">
            <h2 className="font-display font-semibold text-white mb-1">Job Description</h2>
            <p className="text-slate-400 text-sm mb-4">Paste the full job description for best results</p>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here..."
              rows={10}
              className="input-field resize-none font-mono text-sm"
            />
            <p className="text-xs text-slate-500 mt-2">{jobDescription.length} characters</p>
            <div className="mt-4 flex items-center justify-between">
              <button onClick={reset} className="btn-secondary text-sm">← Back</button>
              <button
                onClick={handleAnalyze}
                disabled={!jobDescription.trim() || loading}
                className="btn-primary flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader size={16} className="animate-spin" /> : <Cpu size={16} />}
                {loading ? 'Analyzing...' : 'Run AI Analysis'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Results */}
      {step === 2 && analysis && (
        <div className="animate-slide-up">
          <AnalysisResult
            analysis={analysis.analysis}
            candidateName={analysis.candidate_name || uploadedResume?.extracted?.name}
          />
          <div className="mt-6 flex gap-3">
            <button onClick={reset} className="btn-primary">Analyze Another</button>
          </div>
        </div>
      )}
    </div>
  );
}
