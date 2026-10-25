import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Sparkles, Trophy, Shield, Cpu, Compass, ArrowRight, UserCheck } from 'lucide-react';
import { useThemeAudio } from '../context/ThemeAudioContext.jsx';
import { usePlayer } from '../context/PlayerContext.jsx';

export default function HomePage() {
  const { themeStyles } = useThemeAudio();
  const { nickname, streak } = usePlayer();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-16 space-y-16">
      {/* Hero Section */}
      <div className="text-center space-y-6 max-w-3xl mx-auto">
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-amber-950/40 border border-amber-800 text-amber-400 text-xs font-mono">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Powered by Google Gemini 2.5 • Dual-Pass Solvability</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
          Every Clue Tells A Story. <br />
          <span className={themeStyles.accent}>Some Lie.</span>
        </h1>

        <p className="text-base sm:text-lg text-neutral-400 leading-relaxed font-light">
          Step into dynamic, AI-generated murder mysteries. Cross-examine deceptive suspects, pin forensic evidence to your corkboard, spot contradictions, and accuse the true culprit.
        </p>

        {/* Primary CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            to="/create"
            className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-black flex items-center justify-center space-x-2 shadow-xl hover:scale-105 transition-all text-sm ${themeStyles.accentBg}`}
          >
            <Search className="w-4 h-4" />
            <span>Generate New Case</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            to="/daily"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-amber-300 bg-neutral-900 border border-neutral-700 hover:border-amber-500/80 hover:bg-neutral-800 flex items-center justify-center space-x-2 transition-all text-sm shadow-xl"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Today's Daily Mystery</span>
          </Link>
        </div>

        {/* Player Status Bar */}
        <div className="pt-2 text-xs text-neutral-400 font-mono flex items-center justify-center space-x-4">
          <span>Logged in as: <strong className="text-white">{nickname}</strong></span>
          {streak > 0 && <span>• Solved Streak: <strong className="text-orange-400">{streak} 🔥</strong></span>}
        </div>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`p-6 rounded-2xl ${themeStyles.panel} border ${themeStyles.border} shadow-lg space-y-3`}>
          <div className="w-10 h-10 rounded-xl bg-amber-950/60 border border-amber-800/80 flex items-center justify-center text-amber-400">
            <UserCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-base">Live Suspect Interrogation</h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Question suspects in real time. Powered by isolated Gemini personas, innocents defend their alibis while culprits deflect and deceive.
          </p>
        </div>

        <div className={`p-6 rounded-2xl ${themeStyles.panel} border ${themeStyles.border} shadow-lg space-y-3`}>
          <div className="w-10 h-10 rounded-xl bg-red-950/60 border border-red-800/80 flex items-center justify-center text-red-400">
            <Compass className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-base">Evidence Corkboard & Yarn</h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Drag suspect dossiers, pin forensic clues, and draw connecting red yarn strings to uncover the hidden narrative.
          </p>
        </div>

        <div className={`p-6 rounded-2xl ${themeStyles.panel} border ${themeStyles.border} shadow-lg space-y-3`}>
          <div className="w-10 h-10 rounded-xl bg-blue-950/60 border border-blue-800/80 flex items-center justify-center text-blue-400">
            <Shield className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-base">Zero-Leak Backend Security</h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            The culprit, solution, and red herring tags remain strictly on the backend. No developer console cheating possible.
          </p>
        </div>
      </div>

      {/* Difficulty Overview Matrix */}
      <div className={`p-8 rounded-3xl ${themeStyles.panel} border ${themeStyles.border} shadow-2xl`}>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white">Investigation Difficulty Tiers</h2>
          <p className="text-xs text-neutral-400 mt-1">
            Choose your sleuthing challenge. Each tier is calibrated for forensic fair play.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-3">
            <span className="text-xs uppercase font-mono font-bold text-emerald-400">Easy</span>
            <div className="text-2xl font-black text-white">100 Base Pts</div>
            <ul className="text-xs text-neutral-400 space-y-1.5 font-mono">
              <li>3 Suspects</li>
              <li>5 Clues (1 Red Herring)</li>
              <li>2 Progressive Hints</li>
              <li>6 Interrogation Questions</li>
            </ul>
          </div>

          <div className="p-5 rounded-2xl bg-neutral-900/60 border border-amber-800/50 space-y-3 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-600 text-black text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
              Recommended
            </div>
            <span className="text-xs uppercase font-mono font-bold text-amber-400">Medium</span>
            <div className="text-2xl font-black text-white">150 Base Pts</div>
            <ul className="text-xs text-neutral-400 space-y-1.5 font-mono">
              <li>4 Suspects</li>
              <li>7 Clues (2 Red Herrings)</li>
              <li>3 Progressive Hints</li>
              <li>8 Interrogation Questions</li>
            </ul>
          </div>

          <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-3">
            <span className="text-xs uppercase font-mono font-bold text-red-400">Hard</span>
            <div className="text-2xl font-black text-white">200 Base Pts</div>
            <ul className="text-xs text-neutral-400 space-y-1.5 font-mono">
              <li>5 Suspects</li>
              <li>9 Clues (3 Red Herrings)</li>
              <li>3 Progressive Hints</li>
              <li>10 Interrogation Questions</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
