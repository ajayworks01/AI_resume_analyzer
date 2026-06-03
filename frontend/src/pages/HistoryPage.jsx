import React, { useEffect, useState } from 'react';
import { BarChart3, Loader, RefreshCw } from 'lucide-react';
import { resumeService } from '../services/api';

function ScorePill({ score }) {
  const color = score >= 75 ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
    : score >= 50 ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
    : 'text-red-400 bg-red-500/10 border-red-500/20';
  return (
    <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${color}`}>
      {Math.round(score)}%
    </span>
  );
}

export default function HistoryPage() {
  const [analyses, setAnalyses] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('analyses');

  const load = async () => {
    setLoading(true);
    try {
      const [aRes, rRes] = await Promise.all([
        resumeService.getAllAnalyses(),
        resumeService.list(),
      ]);
      setAnalyses(aRes.data || []);
      setResumes(rRes.data || []);
    } catch (e) {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="min-h-screen p-6 md:p-10 max-w-5xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-white flex items-center gap-3">
            <BarChart3 size={28} className="text-violet-400" /> History
          </h1>
          <p className="text-slate-400 mt-1">Past analyses and uploaded resumes</p>
        </div>
        <button onClick={load} className="btn-secondary flex items-center gap-2 text-sm">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {['analyses', 'resumes'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
              tab === t ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {t} ({t === 'analyses' ? analyses.length : resumes.length})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader size={32} className="animate-spin text-sky-400" />
        </div>
      ) : tab === 'analyses' ? (
        <div className="space-y-3">
          {analyses.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <p className="text-slate-500">No analyses yet. Start by analyzing a resume.</p>
            </div>
          ) : analyses.map((a) => (
            <div key={a.id} className="glass-card p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-sky-500/20 flex items-center justify-center text-sky-400 font-bold text-sm">
                #{a.id}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">Analysis #{a.id}</p>
                <p className="text-xs text-slate-500 truncate">{a.job_description?.slice(0, 80)}...</p>
              </div>
              <ScorePill score={a.match_score || 0} />
              <span className="text-xs text-slate-500 hidden md:block">
                {new Date(a.created_at).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {resumes.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <p className="text-slate-500">No resumes uploaded yet.</p>
            </div>
          ) : resumes.map((r) => (
            <div key={r.id} className="glass-card p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-300 font-bold text-sm">
                {r.candidate_name?.[0] || '?'}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">{r.candidate_name || 'Unknown'}</p>
                <p className="text-xs text-slate-500">{r.email || r.filename}</p>
              </div>
              <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded-lg">{r.filename?.split('.').pop()?.toUpperCase()}</span>
              <span className="text-xs text-slate-500 hidden md:block">
                {new Date(r.created_at).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
