import React from 'react';
import { Link } from 'react-router-dom';
import { Cpu, Trophy, FileText, Zap, BarChart3, CheckCircle } from 'lucide-react';

const features = [
  {
    icon: FileText,
    title: 'Smart Parsing',
    desc: 'Extracts name, skills, experience, education from PDF & DOCX automatically.',
    color: 'text-sky-400',
    bg: 'bg-sky-500/10',
  },
  {
    icon: Cpu,
    title: 'AI Matching',
    desc: 'Compares resume against job descriptions with TF-IDF & keyword analysis.',
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
  },
  {
    icon: Trophy,
    title: 'Candidate Ranking',
    desc: 'Upload multiple resumes and rank them by relevance automatically.',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
  },
  {
    icon: BarChart3,
    title: 'Deep Analytics',
    desc: 'Visual charts for skill match, ATS score, and experience breakdown.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
  },
  {
    icon: Zap,
    title: 'ATS Optimization',
    desc: 'Get specific tips to pass Applicant Tracking Systems.',
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
  },
  {
    icon: CheckCircle,
    title: 'Actionable Feedback',
    desc: 'Receive improvement suggestions tailored to the target job.',
    color: 'text-teal-400',
    bg: 'bg-teal-500/10',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen p-6 md:p-10 animate-fade-in">
      {/* Hero */}
      <div className="max-w-4xl mx-auto text-center pt-10 pb-16">
        <div className="inline-flex items-center gap-2 bg-sky-500/10 border border-sky-500/20 text-sky-400 text-sm px-4 py-1.5 rounded-full mb-6">
          <Cpu size={14} />
          AI-Powered Resume Intelligence
        </div>
        <h1 className="text-4xl md:text-6xl font-display font-bold text-white leading-tight mb-6">
          Analyze Resumes with{' '}
          <span className="bg-gradient-to-r from-sky-400 to-violet-400 bg-clip-text text-transparent">
            AI Precision
          </span>
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-8">
          Upload resumes, paste job descriptions, and get instant match scores,
          ATS feedback, and candidate rankings — all powered by AI.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link to="/analyze" className="btn-primary inline-flex items-center gap-2">
            <Cpu size={16} />
            Start Analyzing
          </Link>
          <Link to="/rank" className="btn-secondary inline-flex items-center gap-2">
            <Trophy size={16} />
            Rank Candidates
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-display font-bold text-center text-white mb-8">
          Everything you need to hire smarter
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(({ icon: Icon, title, desc, color, bg }) => (
            <div key={title} className="glass-card p-6 hover:border-slate-600 transition-colors">
              <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-4`}>
                <Icon size={20} className={color} />
              </div>
              <h3 className="font-display font-semibold text-white mb-2">{title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-3xl mx-auto mt-16 glass-card p-8 text-center bg-gradient-to-br from-sky-500/10 to-violet-500/10 border-sky-500/20">
        <h2 className="text-2xl font-display font-bold text-white mb-3">Ready to get started?</h2>
        <p className="text-slate-400 mb-6">Upload your first resume and see your match score in seconds.</p>
        <Link to="/analyze" className="btn-primary inline-flex items-center gap-2">
          <FileText size={16} /> Upload Resume Now
        </Link>
      </div>
    </div>
  );
}
