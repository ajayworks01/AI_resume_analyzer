import React from 'react';

function getColor(score) {
  if (score >= 75) return '#10b981'; // emerald
  if (score >= 50) return '#f59e0b'; // amber
  return '#ef4444'; // red
}

export default function ScoreGauge({ score, label, size = 120 }) {
  const color = getColor(score);
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#1e293b"
            strokeWidth={10}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={10}
            strokeDasharray={`${dash} ${circumference - dash}`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 1s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-display font-bold text-white">{score}%</span>
        </div>
      </div>
      {label && <span className="text-xs text-slate-400 font-medium text-center">{label}</span>}
    </div>
  );
}
