import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { 
  Trophy, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  Share2, 
  RotateCcw, 
  ShieldCheck, 
  ArrowRight,
  HelpCircle,
  FileText
} from 'lucide-react';
import { caseApi } from '../api/caseApi.js';
import { useThemeAudio } from '../context/ThemeAudioContext.jsx';

export default function ResultsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { themeStyles } = useThemeAudio();

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        setLoading(true);
        const data = await caseApi.getCaseResult(id);
        setResult(data);

        // Fire celebratory confetti if they achieved Master Detective or Sharp Eye
        if (data.score.tier === 'Master Detective' || data.score.tier === 'Sharp Eye') {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        }
      } catch (err) {
        console.error('Failed to load result:', err);
        setError(err.response?.data?.error || 'Failed to retrieve case result.');
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <div className="w-12 h-12 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin mx-auto mb-4"></div>
        <div className="text-white font-mono text-sm">Unsealing Official Verdict & Gemini Critique...</div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <XCircle className="w-10 h-10 text-red-500 mx-auto" />
        <h3 className="text-xl font-bold text-white">Case Result Locked</h3>
        <p className="text-xs text-neutral-400">{error || 'Accusation not yet recorded.'}</p>
        <Link to={`/case/${id}`} className="inline-block px-5 py-2 rounded-xl bg-amber-600 text-black text-xs font-bold">
          Return to Investigation
        </Link>
      </div>
    );
  }

  const isGuiltyCaught = result.score.tier !== 'Case Cold';
  const culprit = result.suspects.find((s) => s.id === result.solution?.culpritId);

  const tierColors = {
    'Master Detective': 'bg-amber-500/20 text-amber-300 border-amber-500',
    'Sharp Eye': 'bg-emerald-500/20 text-emerald-300 border-emerald-500',
    'Close Call': 'bg-blue-500/20 text-blue-300 border-blue-500',
    'Case Cold': 'bg-red-500/20 text-red-400 border-red-500'
  }[result.score.tier] || 'bg-neutral-800 text-neutral-300 border-neutral-700';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Verdict Hero Banner */}
      <div className={`p-8 rounded-3xl border shadow-2xl text-center space-y-4 ${
        isGuiltyCaught ? 'bg-gradient-to-b from-[#1c1d15] to-[#121722] border-amber-500/40' : 'bg-gradient-to-b from-[#221215] to-[#121722] border-red-800/40'
      }`}>
        <div className="inline-flex items-center space-x-1.5 px-4 py-1 rounded-full border text-xs font-mono font-bold uppercase tracking-wider" style={{ borderColor: 'inherit' }}>
          {isGuiltyCaught ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-red-400" />}
          <span>{isGuiltyCaught ? 'Case Closed — Culprit Apprehended' : 'Case Cold — Wrongful Accusation'}</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white">
          {isGuiltyCaught ? 'Justice Served' : 'The Culprit Escaped'}
        </h1>

        {/* Detective Rank Badge */}
        <div className="inline-block">
          <div className={`px-5 py-2 rounded-2xl border text-sm font-black uppercase tracking-widest ${tierColors}`}>
            Rank: {result.score.tier}
          </div>
        </div>

        <div className="text-3xl sm:text-4xl font-extrabold text-amber-400 font-mono">
          {result.score.total} <span className="text-sm text-neutral-400">Total Points</span>
        </div>
      </div>

      {/* Score Breakdown Table */}
      <div className={`p-6 sm:p-8 rounded-3xl ${themeStyles.panel} border ${themeStyles.border} shadow-xl space-y-4`}>
        <div className="flex items-center space-x-2 text-sm font-bold text-white uppercase tracking-wider">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>Forensic Score Breakdown</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800">
            <span className="text-neutral-400">Base Accusation</span>
            <div className="text-base font-bold text-white mt-1">+{result.score.baseAccusation}</div>
          </div>
          <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800">
            <span className="text-neutral-400">Motive Bonus</span>
            <div className="text-base font-bold text-emerald-400 mt-1">+{result.score.motiveBonus}</div>
          </div>
          <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800">
            <span className="text-neutral-400">Method Bonus</span>
            <div className="text-base font-bold text-emerald-400 mt-1">+{result.score.methodBonus}</div>
          </div>
          <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800">
            <span className="text-neutral-400">Decisive Clues</span>
            <div className="text-base font-bold text-amber-400 mt-1">{result.score.supportingCluesBonus >= 0 ? `+${result.score.supportingCluesBonus}` : result.score.supportingCluesBonus}</div>
          </div>
          <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800">
            <span className="text-neutral-400">Clues Found</span>
            <div className="text-base font-bold text-emerald-400 mt-1">+{result.score.cluesDiscoveredPoints}</div>
          </div>
          <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800">
            <span className="text-neutral-400">Hints Penalty</span>
            <div className="text-base font-bold text-red-400 mt-1">-{result.score.hintsPenalty}</div>
          </div>
          <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800">
            <span className="text-neutral-400">Questions Cost</span>
            <div className="text-base font-bold text-red-400 mt-1">-{result.score.questionsPenalty}</div>
          </div>
          <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800">
            <span className="text-neutral-400">Contradictions</span>
            <div className="text-base font-bold text-amber-400 mt-1">{result.score.contradictionPoints >= 0 ? `+${result.score.contradictionPoints}` : result.score.contradictionPoints}</div>
          </div>
        </div>
      </div>

      {/* Gemini Consulting Detective Critique */}
      {result.detectiveCritique && (
        <div className={`p-6 sm:p-8 rounded-3xl ${themeStyles.panel} border ${themeStyles.border} shadow-xl space-y-3`}>
          <div className="flex items-center space-x-2 text-sm font-bold text-amber-400">
            <Sparkles className="w-4 h-4" />
            <span>Gemini Consulting Detective Review</span>
          </div>
          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-serif italic whitespace-pre-line">
            "{result.detectiveCritique}"
          </p>
        </div>
      )}

      {/* Full Unlocked Solution Dossier */}
      <div className={`p-6 sm:p-8 rounded-3xl ${themeStyles.panel} border ${themeStyles.border} shadow-xl space-y-6`}>
        <div className="flex items-center space-x-2 text-sm font-bold text-white uppercase tracking-wider">
          <FileText className="w-4 h-4 text-amber-500" />
          <span>Classified Solution Dossier</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800">
            <span className="text-neutral-500 font-mono uppercase">Actual Culprit</span>
            <div className="text-base font-bold text-amber-400 mt-1">{culprit?.name || result.solution?.culpritId}</div>
            <div className="text-[11px] text-neutral-400 font-mono">{culprit?.role}</div>
          </div>
          <div className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800">
            <span className="text-neutral-500 font-mono uppercase">True Motive</span>
            <div className="text-sm font-bold text-neutral-200 mt-1">{result.solution?.motive}</div>
          </div>
          <div className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800">
            <span className="text-neutral-500 font-mono uppercase">True Method</span>
            <div className="text-sm font-bold text-neutral-200 mt-1">{result.solution?.method}</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-neutral-950/80 border border-neutral-800 text-xs text-neutral-300 leading-relaxed font-light">
          <div className="font-bold text-white mb-1 uppercase font-mono">Official Police Reconstruction</div>
          {result.solution?.explanation}
        </div>

        {/* Decisive Clues vs Red Herrings breakdown */}
        <div>
          <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">
            Clue Classification & Red Herrings
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {result.clues.map((c) => {
              const isDecisive = result.solution?.decisiveClueIds?.includes(c.id);
              const isRed = c.isRedHerring;
              return (
                <div
                  key={c.id}
                  className={`p-3 rounded-xl border text-xs ${
                    isRed
                      ? 'bg-red-950/20 border-red-900/60 text-red-200'
                      : isDecisive
                      ? 'bg-emerald-950/20 border-emerald-900/60 text-emerald-200'
                      : 'bg-neutral-900/40 border-neutral-800 text-neutral-300'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold mb-1">
                    <span>{c.title}</span>
                    <span className="text-[10px] font-mono uppercase">
                      {isRed ? '🚩 Red Herring' : isDecisive ? '⭐ Decisive Linchpin' : 'Supporting Evidence'}
                    </span>
                  </div>
                  <p className="text-[11px] opacity-80">{c.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Navigation & Sharing CTAs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
        <Link
          to={`/case/${id}/file`}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs font-bold text-white flex items-center justify-center space-x-2 transition-all"
        >
          <Share2 className="w-4 h-4 text-amber-400" />
          <span>View Shareable Case File Dossier</span>
        </Link>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <Link
            to="/leaderboard"
            className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs font-bold text-white text-center transition-all"
          >
            Leaderboard
          </Link>
          <Link
            to="/create"
            className={`flex-1 sm:flex-none px-6 py-3 rounded-xl font-bold text-black text-xs flex items-center justify-center space-x-1.5 ${themeStyles.accentBg} transition-all`}
          >
            <RotateCcw className="w-4 h-4" />
            <span>Investigate Next Mystery</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
