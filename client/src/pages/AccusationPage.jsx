import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Gavel, AlertTriangle, ShieldCheck, CheckCircle2, ArrowLeft } from 'lucide-react';
import { caseApi } from '../api/caseApi.js';
import { useThemeAudio } from '../context/ThemeAudioContext.jsx';
import { usePlayer } from '../context/PlayerContext.jsx';

export default function AccusationPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { themeStyles } = useThemeAudio();
  const { incrementStreak, resetStreak } = usePlayer();

  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Accusation form state
  const [selectedCulpritId, setSelectedCulpritId] = useState('');
  const [motive, setMotive] = useState('');
  const [method, setMethod] = useState('');
  const [selectedSupportingClueIds, setSelectedSupportingClueIds] = useState([]);
  const [reasoning, setReasoning] = useState('');

  useEffect(() => {
    const fetchCase = async () => {
      try {
        setLoading(true);
        const data = await caseApi.getCase(id);
        if (data.status === 'completed') {
          navigate(`/case/${id}/result`);
          return;
        }
        setCaseData(data);
        if (data.suspects?.length > 0) {
          setSelectedCulpritId(data.suspects[0].id);
        }
      } catch (err) {
        setError('Failed to load case for accusation');
      } finally {
        setLoading(false);
      }
    };
    fetchCase();
  }, [id, navigate]);

  const toggleClueSelection = (clueId) => {
    if (selectedSupportingClueIds.includes(clueId)) {
      setSelectedSupportingClueIds((prev) => prev.filter((i) => i !== clueId));
    } else {
      if (selectedSupportingClueIds.length >= 3) return; // Max 3
      setSelectedSupportingClueIds((prev) => [...prev, clueId]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCulpritId || !motive.trim() || !method.trim() || selectedSupportingClueIds.length === 0 || !reasoning.trim() || submitting) {
      return;
    }

    setSubmitting(true);
    setError(null);

    // Read remaining timer if applicable
    const savedTime = sessionStorage.getItem(`timer_${id}`);
    const timeRemainingSeconds = savedTime ? parseInt(savedTime, 10) : 0;

    try {
      const result = await caseApi.submitAccusation(id, {
        culpritId: selectedCulpritId,
        motive: motive.trim(),
        method: method.trim(),
        supportingClueIds: selectedSupportingClueIds,
        reasoning: reasoning.trim(),
        timeRemainingSeconds
      });

      // Update player streak
      if (result.score.tier === 'Master Detective' || result.score.tier === 'Sharp Eye') {
        incrementStreak();
      } else {
        resetStreak();
      }

      sessionStorage.removeItem(`timer_${id}`);
      navigate(`/case/${id}/result`);
    } catch (err) {
      console.error('Accusation submission error:', err);
      setError(err.response?.data?.error || 'Failed to submit accusation.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <div className="w-12 h-12 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin mx-auto mb-4"></div>
        <div className="text-white font-mono text-sm">Convening Court of Inquiry...</div>
      </div>
    );
  }

  if (!caseData) return null;

  const discoveredClues = caseData.clues.filter((c) => c.discovered);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className={`p-6 sm:p-10 rounded-3xl ${themeStyles.panel} border ${themeStyles.border} shadow-2xl space-y-8`}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={() => navigate(`/case/${id}`)}
              className="flex items-center space-x-1.5 text-xs text-neutral-400 hover:text-white mb-2 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Crime Scene</span>
            </button>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center space-x-2">
              <Gavel className="w-6 h-6 text-amber-500" />
              <span>Deliver Final Accusation</span>
            </h2>
            <p className="text-xs text-neutral-400 mt-1">
              Assemble your structured accusation. Base points, motives, methods, and decisive clues will be authoritatively scored.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 1. Suspect Lineup */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-2">
              1. Identify the Prime Culprit
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {caseData.suspects.map((s) => {
                const isSelected = selectedCulpritId === s.id;
                return (
                  <div
                    key={s.id}
                    onClick={() => setSelectedCulpritId(s.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-amber-950/50 border-amber-500 ring-2 ring-amber-500 shadow-xl'
                        : 'bg-neutral-900/50 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-neutral-800 flex items-center justify-center font-bold text-amber-400">
                        {s.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm">{s.name}</div>
                        <div className="text-[11px] text-neutral-400 font-mono">{s.role}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Motive & Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1">
                2. True Motive (+25 bonus)
              </label>
              <input
                type="text"
                value={motive}
                onChange={(e) => setMotive(e.target.value)}
                placeholder="Ex: Urgent gambling debt default before midnight"
                required
                className="w-full bg-neutral-950 border border-neutral-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1">
                3. Crime Method (+25 bonus)
              </label>
              <input
                type="text"
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                placeholder="Ex: Balcony entry using stolen duplicate brass key"
                required
                className="w-full bg-neutral-950 border border-neutral-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* 3. Supporting Evidence (1-3 clues) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300">
                4. Select Decisive Supporting Clues (1 to 3)
              </label>
              <span className="text-[11px] text-neutral-400 font-mono">
                {selectedSupportingClueIds.length}/3 Selected (+10 valid, -10 red herring)
              </span>
            </div>

            {discoveredClues.length === 0 ? (
              <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-900/60 text-amber-300 text-xs">
                ⚠️ You have not discovered any physical clues yet. We strongly advise returning to the crime scene and cataloging evidence first.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
                {discoveredClues.map((c) => {
                  const isSelected = selectedSupportingClueIds.includes(c.id);
                  return (
                    <div
                      key={c.id}
                      onClick={() => toggleClueSelection(c.id)}
                      className={`p-3 rounded-xl border cursor-pointer text-xs transition-all flex items-start space-x-2.5 ${
                        isSelected
                          ? 'bg-amber-950/40 border-amber-500 text-white font-semibold'
                          : 'bg-neutral-900/40 border-neutral-800 text-neutral-400 hover:bg-neutral-800'
                      }`}
                    >
                      <div className={`mt-0.5 w-4 h-4 rounded-md border flex items-center justify-center flex-shrink-0 ${
                        isSelected ? 'bg-amber-500 border-amber-500 text-black' : 'border-neutral-700'
                      }`}>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                      <div>
                        <div className="font-bold text-neutral-200">{c.title}</div>
                        <div className="text-[10px] text-neutral-400 font-mono">{c.location}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 4. Deduction Reasoning */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1">
              5. Final Deduction Reasoning
            </label>
            <textarea
              value={reasoning}
              onChange={(e) => setReasoning(e.target.value)}
              placeholder="Explain step-by-step why the evidence leads strictly to your accused suspect..."
              rows={3}
              required
              className="w-full bg-neutral-950 border border-neutral-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500 leading-relaxed resize-none"
            />
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-4 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Warning before lock-in */}
          <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 text-[11px] text-neutral-400 flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <span>Once submitted, the case will be permanently closed and your deductions evaluated by Gemini.</span>
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={submitting || selectedSupportingClueIds.length === 0 || !reasoning.trim()}
            className={`w-full py-4 rounded-xl font-black text-black text-sm uppercase tracking-wider shadow-2xl flex items-center justify-center space-x-2 ${themeStyles.accentBg} disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            <Gavel className="w-4 h-4" />
            <span>{submitting ? 'Weighing Evidence with Gemini...' : 'Seal Case & Deliver Accusation'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
