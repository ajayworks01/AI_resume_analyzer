import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Trophy, Upload, Loader, Medal, Star } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { resumeService } from '../services/api';

function RankBadge({ rank }) {
  if (rank === 1) return <span className="text-amber-400 font-bold">🥇 #1</span>;
  if (rank === 2) return <span className="text-slate-300 font-bold">🥈 #2</span>;
  if (rank === 3) return <span className="text-amber-600 font-bold">🥉 #3</span>;
  return <span className="text-slate-400 font-semibold">#{rank}</span>;
}

function ScoreBar({ value, color = 'bg-sky-500' }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-slate-700/60 rounded-full h-1.5">
        <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${value}%`, transition: 'width 0.8s ease' }} />
      </div>
      <span className="text-xs text-slate-400 w-10 text-right">{Math.round(value)}%</span>
    </div>
  );
}

export default function RankingPage() {
  const [step, setStep] = useState(0); // 0=upload, 1=jd, 2=results
  const [uploadedResumes, setUploadedResumes] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [jobDescription, setJobDescription] = useState('');
  const [ranking, setRanking] = useState(null);
  const [loading, setLoading] = useState(false);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'application/pdf': ['.pdf'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] },
    multiple: true,
    onDrop: async (files) => {
      setUploading(true);
      const results = [];
      for (const file of files) {
        try {
          const res = await resumeService.upload(file);
          results.push(res.data);
          toast.success(`Uploaded: ${res.data.extracted?.name || file.name}`);
        } catch (e) {
          toast.error(`Failed: ${file.name}`);
        }
      }
      setUploadedResumes((prev) => [...prev, ...results]);
      setUploading(false);
    },
  });

  const removeResume = (id) => setUploadedResumes((prev) => prev.filter((r) => r.id !== id));

  const handleRank = async () => {
    if (uploadedResumes.length < 2) return toast.error('Upload at least 2 resumes to rank');
    if (!jobDescription.trim()) return toast.error('Enter a job description');
    setLoading(true);
    try {
      const ids = uploadedResumes.map((r) => r.id);
      const res = await resumeService.rankMultiple(ids, jobDescription);
      setRanking(res.data);
      setStep(2);
      toast.success(`Ranked ${res.data.total_candidates} candidates!`);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 md:p-10 max-w-5xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-white flex items-center gap-3">
          <Trophy size={28} className="text-amber-400" /> Candidate Ranking
        </h1>
        <p className="text-slate-400 mt-1">Upload multiple resumes to rank them by job fit</p>
      </div>

      {step < 2 && (
        <div className="space-y-6">
          {/* Upload */}
          <div className="glass-card p-6">
            <h2 className="font-display font-semibold text-white mb-4 flex items-center gap-2">
              <Upload size={18} className="text-sky-400" /> Upload Resumes
              <span className="text-sm font-normal text-slate-400">(min 2)</span>
            </h2>

            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                isDragActive ? 'border-sky-400 bg-sky-500/10' : 'border-slate-700 hover:border-slate-500'
              }`}
            >
              <input {...getInputProps()} />
              {uploading
                ? <Loader size={28} className="animate-spin mx-auto text-sky-400 mb-2" />
                : <Upload size={28} className="mx-auto text-slate-500 mb-2" />}
              <p className="text-slate-300">{uploading ? 'Uploading...' : 'Drop multiple resumes here'}</p>
              <p className="text-slate-500 text-sm mt-1">PDF & DOCX supported</p>
            </div>

            {uploadedResumes.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm text-slate-400">{uploadedResumes.length} resume(s) ready</p>
                {uploadedResumes.map((r) => (
                  <div key={r.id} className="flex items-center gap-3 bg-slate-800/60 rounded-xl px-4 py-2.5 border border-slate-700">
                    <div className="w-7 h-7 rounded-full bg-sky-500/20 flex items-center justify-center text-sky-400 text-xs font-bold">
                      {r.extracted?.name?.[0] || '?'}
                    </div>
                    <span className="text-sm text-slate-300 flex-1">{r.extracted?.name || r.filename}</span>
                    <span className="text-xs text-slate-500">{r.filename}</span>
                    <button onClick={() => removeResume(r.id)} className="text-slate-500 hover:text-red-400 text-sm">✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* JD */}
          <div className="glass-card p-6">
            <h2 className="font-display font-semibold text-white mb-4">Job Description</h2>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here..."
              rows={8}
              className="input-field resize-none text-sm font-mono"
            />
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleRank}
                disabled={uploadedResumes.length < 2 || !jobDescription.trim() || loading}
                className="btn-primary flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader size={16} className="animate-spin" /> : <Trophy size={16} />}
                {loading ? 'Ranking...' : `Rank ${uploadedResumes.length} Candidates`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {step === 2 && ranking && (
        <div className="animate-slide-up space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-display font-bold text-white">🏆 Ranking Results</h2>
              <p className="text-slate-400 text-sm">{ranking.total_candidates} candidates analyzed</p>
            </div>
            <button onClick={() => { setStep(0); setRanking(null); setUploadedResumes([]); setJobDescription(''); }} className="btn-secondary text-sm">
              New Ranking
            </button>
          </div>

          <div className="space-y-4">
            {ranking.rankings.map((candidate, idx) => (
              <div
                key={candidate.resume_id}
                className={`glass-card p-5 transition-all ${idx === 0 ? 'border-amber-500/30 bg-amber-500/5' : ''}`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 text-center">
                    <RankBadge rank={candidate.rank} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-display font-semibold text-white">
                          {candidate.candidate_name || candidate.filename}
                        </p>
                        <p className="text-xs text-slate-500">{candidate.filename}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-2xl font-bold ${candidate.overall_score >= 75 ? 'text-emerald-400' : candidate.overall_score >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                          {Math.round(candidate.overall_score)}%
                        </p>
                        <p className="text-xs text-slate-500">Match Score</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Skill Match</p>
                        <ScoreBar value={candidate.skill_match} color="bg-sky-500" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Experience Match</p>
                        <ScoreBar value={candidate.experience_match} color="bg-violet-500" />
                      </div>
                    </div>

                    {candidate.matched_skills?.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {candidate.matched_skills.slice(0, 6).map((s) => (
                          <span key={s} className="text-xs bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2 py-0.5 rounded-md">{s}</span>
                        ))}
                        {candidate.matched_skills.length > 6 && (
                          <span className="text-xs text-slate-500">+{candidate.matched_skills.length - 6} more</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
