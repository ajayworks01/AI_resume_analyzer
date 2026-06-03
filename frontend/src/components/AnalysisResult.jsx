import React from 'react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell
} from 'recharts';
import { CheckCircle, XCircle, AlertTriangle, Lightbulb, Shield } from 'lucide-react';
import ScoreGauge from './ScoreGauge';

function Tag({ children, color = 'sky' }) {
  const colors = {
    sky: 'bg-sky-500/10 text-sky-300 border-sky-500/20',
    red: 'bg-red-500/10 text-red-300 border-red-500/20',
    green: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
    violet: 'bg-violet-500/10 text-violet-300 border-violet-500/20',
  };
  return (
    <span className={`inline-block text-xs px-2.5 py-1 rounded-lg border font-medium ${colors[color]}`}>
      {children}
    </span>
  );
}

export default function AnalysisResult({ analysis, candidateName }) {
  const { overall_score, ats_score, skill_match_score, experience_match_score,
    education_match_score, matched_skills, missing_skills, strengths, weaknesses,
    suggestions, ats_tips, matched_keywords, missing_keywords } = analysis;

  const radarData = [
    { subject: 'Skills', value: skill_match_score },
    { subject: 'Experience', value: experience_match_score },
    { subject: 'Education', value: education_match_score },
    { subject: 'Keywords', value: analysis.keyword_match_score },
    { subject: 'ATS', value: ats_score },
  ];

  const barData = [
    { name: 'Skills', value: skill_match_score, fill: '#38bdf8' },
    { name: 'Experience', value: experience_match_score, fill: '#a78bfa' },
    { name: 'Education', value: education_match_score, fill: '#34d399' },
    { name: 'Keywords', value: analysis.keyword_match_score, fill: '#fb923c' },
  ];

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Candidate header */}
      {candidateName && (
        <div className="glass-card p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-400 to-violet-500 flex items-center justify-center text-white font-bold text-lg">
            {candidateName[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <p className="font-display font-bold text-white text-lg">{candidateName}</p>
            <p className="text-slate-400 text-sm">Resume Analysis Complete</p>
          </div>
        </div>
      )}

      {/* Score gauges */}
      <div className="glass-card p-6">
        <h3 className="font-display font-semibold text-white mb-6">Match Scores</h3>
        <div className="flex flex-wrap justify-around gap-6">
          <ScoreGauge score={Math.round(overall_score)} label="Overall Match" size={130} />
          <ScoreGauge score={Math.round(ats_score)} label="ATS Score" size={110} />
          <ScoreGauge score={Math.round(skill_match_score)} label="Skill Match" size={110} />
          <ScoreGauge score={Math.round(experience_match_score)} label="Experience" size={110} />
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="glass-card p-5">
          <h3 className="font-semibold text-white mb-4 text-sm">Skill Radar</h3>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#334155" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Radar dataKey="value" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-5">
          <h3 className="font-semibold text-white mb-4 text-sm">Score Breakdown</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} barSize={32}>
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#f1f5f9' }}
                formatter={(v) => [`${Math.round(v)}%`]}
              />
              {barData.map((entry) => (
                <Bar key={entry.name} dataKey="value" radius={[6, 6, 0, 0]}>
                  {barData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                </Bar>
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Skills */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="glass-card p-5">
          <h3 className="flex items-center gap-2 font-semibold text-emerald-400 mb-3 text-sm">
            <CheckCircle size={16} /> Matched Skills ({matched_skills.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {matched_skills.length > 0
              ? matched_skills.map((s) => <Tag key={s} color="green">{s}</Tag>)
              : <p className="text-slate-500 text-sm">None detected</p>}
          </div>
        </div>

        <div className="glass-card p-5">
          <h3 className="flex items-center gap-2 font-semibold text-red-400 mb-3 text-sm">
            <XCircle size={16} /> Missing Skills ({missing_skills.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {missing_skills.length > 0
              ? missing_skills.map((s) => <Tag key={s} color="red">{s}</Tag>)
              : <p className="text-slate-500 text-sm">No gaps detected 🎉</p>}
          </div>
        </div>
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="glass-card p-5">
          <h3 className="font-semibold text-white mb-3 text-sm">✅ Strengths</h3>
          <ul className="space-y-2">
            {strengths.map((s, i) => (
              <li key={i} className="text-sm text-slate-300 flex gap-2">
                <span className="text-emerald-400 flex-shrink-0">+</span>{s}
              </li>
            ))}
          </ul>
        </div>

        <div className="glass-card p-5">
          <h3 className="font-semibold text-white mb-3 text-sm">⚠️ Weaknesses</h3>
          <ul className="space-y-2">
            {weaknesses.map((s, i) => (
              <li key={i} className="text-sm text-slate-300 flex gap-2">
                <span className="text-amber-400 flex-shrink-0">!</span>{s}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Suggestions */}
      <div className="glass-card p-5">
        <h3 className="flex items-center gap-2 font-semibold text-white mb-4 text-sm">
          <Lightbulb size={16} className="text-amber-400" /> Improvement Suggestions
        </h3>
        <ul className="space-y-2.5">
          {suggestions.map((s, i) => (
            <li key={i} className="flex gap-3 text-sm text-slate-300">
              <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                {i + 1}
              </span>
              {s}
            </li>
          ))}
        </ul>
      </div>

      {/* ATS Tips */}
      <div className="glass-card p-5 border-sky-500/20">
        <h3 className="flex items-center gap-2 font-semibold text-white mb-4 text-sm">
          <Shield size={16} className="text-sky-400" /> ATS Optimization Tips
        </h3>
        <ul className="space-y-2">
          {ats_tips.map((tip, i) => (
            <li key={i} className="flex gap-2 text-sm text-slate-300">
              <span className="text-sky-400">→</span>{tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
