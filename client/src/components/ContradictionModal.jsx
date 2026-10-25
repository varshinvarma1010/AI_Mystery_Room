import React, { useState } from 'react';
import { X, ShieldAlert, CheckCircle2, AlertTriangle } from 'lucide-react';
import { caseApi } from '../api/caseApi.js';
import { useThemeAudio } from '../context/ThemeAudioContext.jsx';

export default function ContradictionModal({
  caseId,
  suspects = [],
  clues = [],
  onClose,
  onContradictionResolved
}) {
  const { themeStyles } = useThemeAudio();
  const [selectedSuspectId, setSelectedSuspectId] = useState(suspects[0]?.id || '');
  const [selectedClueId, setSelectedClueId] = useState('');
  const [statementText, setStatementText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const discoveredClues = clues.filter((c) => c.discovered);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSuspectId || !selectedClueId || !statementText.trim() || submitting) return;

    setSubmitting(true);
    setFeedback(null);

    try {
      const res = await caseApi.flagContradiction(
        caseId,
        selectedSuspectId,
        selectedClueId,
        statementText.trim()
      );
      setFeedback(res);
      onContradictionResolved(res);
    } catch (err) {
      setFeedback({
        isValid: false,
        message: err.response?.data?.error || 'Failed to verify contradiction.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 z-50">
      <div className={`w-full max-w-xl rounded-2xl ${themeStyles.panel} border ${themeStyles.border} shadow-2xl p-6 overflow-hidden`}>
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-white text-base">Flag a Testimony Contradiction</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-neutral-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-neutral-400 my-3">
          Did a suspect’s statement or claimed alibi directly conflict with discovered physical evidence?
          Valid flags award <strong className="text-emerald-400">+10 points</strong>. False accusations cost <strong className="text-red-400">-5 points</strong>.
        </p>

        {feedback ? (
          <div className={`p-4 rounded-xl border my-4 ${
            feedback.isValid 
              ? 'bg-emerald-950/50 border-emerald-800 text-emerald-200' 
              : 'bg-red-950/50 border-red-800 text-red-200'
          }`}>
            <div className="flex items-center space-x-2 font-bold text-sm mb-1">
              {feedback.isValid ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-red-400" />}
              <span>{feedback.isValid ? 'Contradiction Shattered!' : 'False Flag'}</span>
            </div>
            <p className="text-xs">{feedback.message}</p>
            {feedback.explanation && (
              <p className="text-xs mt-2 italic text-emerald-300">"{feedback.explanation}"</p>
            )}
            <button
              onClick={onClose}
              className="mt-4 w-full py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold"
            >
              Close Window
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Suspect</label>
              <select
                value={selectedSuspectId}
                onChange={(e) => setSelectedSuspectId(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                {suspects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Conflicting Discovered Clue</label>
              <select
                value={selectedClueId}
                onChange={(e) => setSelectedClueId(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="">-- Choose Discovered Clue --</option>
                {discoveredClues.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title} ({c.location})
                  </option>
                ))}
              </select>
              {discoveredClues.length === 0 && (
                <p className="text-[11px] text-amber-500 mt-1">You must discover clues first before flagging contradictions.</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Describe the Contradiction</label>
              <textarea
                value={statementText}
                onChange={(e) => setStatementText(e.target.value)}
                placeholder="Ex: Arthur claimed he stayed in the conservatory all evening, but his muddy shoe print was found right on the study balcony terrace..."
                rows={3}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-500 resize-none"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs text-neutral-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !selectedClueId || !statementText.trim()}
                className={`px-5 py-2 text-xs font-bold text-black rounded-lg ${themeStyles.accentBg} disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                {submitting ? 'Verifying...' : 'Submit Contradiction'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
