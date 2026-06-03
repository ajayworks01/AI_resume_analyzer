import React from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import {
  FileText, BarChart3, Trophy, Home, Cpu
} from 'lucide-react';

import HomePage from './pages/HomePage';
import AnalyzePage from './pages/AnalyzePage';
import RankingPage from './pages/RankingPage';
import HistoryPage from './pages/HistoryPage';

function Sidebar() {
  const navItems = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/analyze', icon: Cpu, label: 'Analyze' },
    { to: '/rank', icon: Trophy, label: 'Rank' },
    { to: '/history', icon: BarChart3, label: 'History' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-16 md:w-60 bg-slate-900/95 border-r border-slate-800 flex flex-col z-40 backdrop-blur-sm">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-800">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-400 to-violet-500 flex items-center justify-center flex-shrink-0">
          <FileText size={16} className="text-white" />
        </div>
        <span className="hidden md:block font-display font-bold text-white text-sm leading-tight">
          AI Resume<br />Analyzer
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group ${
                isActive
                  ? 'bg-sky-500/15 text-sky-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`
            }
          >
            <Icon size={18} className="flex-shrink-0" />
            <span className="hidden md:block text-sm">{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-slate-800 hidden md:block">
        <p className="text-xs text-slate-600">AI Resume Analyzer v1.0</p>
      </div>
    </aside>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-slate-950">
        <Sidebar />
        <main className="flex-1 ml-16 md:ml-60 min-h-screen">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/analyze" element={<AnalyzePage />} />
            <Route path="/rank" element={<RankingPage />} />
            <Route path="/history" element={<HistoryPage />} />
          </Routes>
        </main>
      </div>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#1e293b', color: '#f1f5f9', border: '1px solid #334155' },
          duration: 4000,
        }}
      />
    </BrowserRouter>
  );
}
