import React, { useState } from 'react';
import { X, HelpCircle, AlertCircle, Lightbulb } from 'lucide-react';
import { caseApi } from '../api/caseApi.js';
import { useThemeAudio } from '../context/ThemeAudioContext.jsx';

export default function HintModal({ caseId, hints = [], onClose, onHintUnlocked }) {
  const { themeStyles } = useThemeAudio();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const nextLockedHint = hints.find((h) => !h.used);

  const handleRequestHint = async () => {
    if (!nextLockedHint || loading) return;
    setLoading(true);
    setError(null);
    try {
      const data = await caseApi.requestHint(caseId);
      onHintUnlocked(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to request hint');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className={`w-full max-w-lg rounded-2xl ${themeStyles.panel} border ${themeStyles.border} shadow-2xl p-6`}>
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center space-x-2">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-white text-base">Detective Guidance (Hints)</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-neutral-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="my-4 space-y-3">
          {hints.map((h, i) => (
            <div
              key={i}
              className={`p-3.5 rounded-xl border ${
                h.used
                  ? 'bg-amber-950/20 border-amber-800/80 text-amber-200'
                  : 'bg-neutral-900/60 border-neutral-800 text-neutral-500'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-bold mb-1">
                <span className="uppercase font-mono">Level {h.level} Hint: {h.level === 1 ? 'Nudge' : h.level === 2 ? 'Stronger Lead' : 'Pointed Clue'}</span>
                <span>{h.used ? 'Unlocked (-10 pts)' : 'Locked'}</span>
              </div>
              <p className="text-xs leading-relaxed">
                {h.used ? h.text : '••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••'}
              </p>
            </div>
          ))}
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-lg bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        <div className="pt-2 border-t border-neutral-800 flex items-center justify-between">
          <span className="text-[11px] text-neutral-400">
            {nextLockedHint ? 'Requesting a hint deducts -10 points.' : 'All available hints unlocked.'}
          </span>
          {nextLockedHint && (
            <button
              onClick={handleRequestHint}
              disabled={loading}
              className={`px-4 py-2 rounded-lg text-xs font-bold text-black ${themeStyles.accentBg} disabled:opacity-50`}
            >
              {loading ? 'Consulting Files...' : `Unlock Level ${nextLockedHint.level} Hint`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
