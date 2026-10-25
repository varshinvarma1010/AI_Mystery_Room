import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Timer, Shield, AlertCircle, ArrowRight, Wand2 } from 'lucide-react';
import { caseApi } from '../api/caseApi.js';
import { useThemeAudio, themes } from '../context/ThemeAudioContext.jsx';
import { usePlayer } from '../context/PlayerContext.jsx';

export default function CreateMysteryPage() {
  const navigate = useNavigate();
  const { currentTheme, setCurrentTheme, themeStyles } = useThemeAudio();
  const { playerId, nickname } = usePlayer();

  const [premise, setPremise] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [isTimed, setIsTimed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [error, setError] = useState(null);

  const starterTemplates = [
    {
      title: 'The Blackwood Manor Poisoning',
      text: 'A reclusive billionaire collapses during a private dinner with his four heirs in a secluded country estate.',
      theme: 'victorian',
      difficulty: 'medium'
    },
    {
      title: 'Subway Midnight Heist',
      text: 'A vintage sapphire necklace vanishes inside a speeding express subway car as it crosses the underground tunnel in pitch darkness.',
      theme: 'noir',
      difficulty: 'easy'
    },
    {
      title: 'Orbital Station Airlock Sabotage',
      text: 'The lead hydroponics researcher on Orbital Outpost 9 is discovered deceased in a depressurized sector with airlock overrides engaged.',
      theme: 'scifi',
      difficulty: 'hard'
    },
    {
      title: 'Tea & Treason at Marple Creek',
      text: 'The village flower competition judge is found unconscious beside a ruined greenhouse with prized orchids crushed in the mud.',
      theme: 'cozy',
      difficulty: 'easy'
    }
  ];

  const loadingSteps = [
    'Consulting Gemini 2.5 generative engine...',
    'Drafting suspect alibis, motives, and hidden secrets...',
    'Seeding physical clues and deceptive red herrings...',
    'Conducting Pass-2 forensic solvability & consistency check...',
    'Locking crime scene dossiers...'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!premise.trim() || loading) return;

    setLoading(true);
    setError(null);
    setGenerationStep(0);

    // Simulate animated generation progress logs
    const interval = setInterval(() => {
      setGenerationStep((prev) => (prev < loadingSteps.length - 1 ? prev + 1 : prev));
    }, 2500);

    try {
      const newCase = await caseApi.createCase({
        premise: premise.trim(),
        difficulty,
        theme: currentTheme,
        playerId,
        nickname
      });

      clearInterval(interval);

      // If timed mode selected, store timer in sessionStorage
      if (isTimed) {
        const timeLimit = difficulty === 'easy' ? 600 : difficulty === 'medium' ? 720 : 900;
        sessionStorage.setItem(`timer_${newCase._id}`, timeLimit.toString());
      }

      navigate(`/case/${newCase._id}`);
    } catch (err) {
      clearInterval(interval);
      console.error('Case generation failed:', err);
      setError(err.response?.data?.error || 'Failed to generate mystery case. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className={`p-6 sm:p-10 rounded-3xl ${themeStyles.panel} border ${themeStyles.border} shadow-2xl space-y-8`}>
        {/* Header */}
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-950/40 border border-amber-800 text-amber-400 text-xs font-mono mb-3">
            <Wand2 className="w-3.5 h-3.5" />
            <span>AI Mystery Architect</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white">Create A New Mystery</h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Specify the crime premise or select a starter archetype. Gemini will build an intricate, solvable puzzle.
          </p>
        </div>

        {/* Loading Overlay */}
        {loading ? (
          <div className="py-16 text-center space-y-6">
            <div className="relative w-20 h-20 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin"></div>
              <div className="absolute inset-3 rounded-full border-4 border-red-500/20 border-b-red-500 animate-spin reverse"></div>
              <Sparkles className="w-8 h-8 text-amber-400 absolute inset-0 m-auto animate-pulse" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white font-mono">
                {loadingSteps[generationStep]}
              </h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                Gemini is ensuring fair play clues and testing logical consistency before unlocking the room...
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Premise Input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-2">
                Mystery Premise / Core Crime
              </label>
              <textarea
                value={premise}
                onChange={(e) => setPremise(e.target.value)}
                placeholder="Ex: A priceless Renaissance painting was slashed in a private gallery with no alarms triggered and four guests in attendance..."
                rows={3}
                maxLength={350}
                required
                className="w-full bg-neutral-950 border border-neutral-700 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors leading-relaxed resize-none"
              />
              <div className="flex justify-between text-[11px] text-neutral-500 mt-1">
                <span>Be as descriptive as you like.</span>
                <span>{premise.length}/350 chars</span>
              </div>
            </div>

            {/* Starter Chips */}
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Or Select A Curated Starter Case</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {starterTemplates.map((t, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setPremise(t.text);
                      setCurrentTheme(t.theme);
                      setDifficulty(t.difficulty);
                    }}
                    className="text-left p-3 rounded-xl bg-neutral-900/60 hover:bg-neutral-800 border border-neutral-800 hover:border-amber-500/50 transition-all text-xs group"
                  >
                    <div className="font-bold text-white group-hover:text-amber-400 transition-colors">
                      {t.title}
                    </div>
                    <div className="text-neutral-400 text-[11px] line-clamp-1 mt-0.5">{t.text}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-2">
                Difficulty Level
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'easy', label: 'Easy', details: '3 suspects • 5 clues • 2 hints' },
                  { id: 'medium', label: 'Medium', details: '4 suspects • 7 clues • 3 hints' },
                  { id: 'hard', label: 'Hard', details: '5 suspects • 9 clues • 3 hints' }
                ].map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setDifficulty(d.id)}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      difficulty === d.id
                        ? 'bg-amber-950/40 border-amber-500 text-white ring-1 ring-amber-500'
                        : 'bg-neutral-900/40 border-neutral-800 text-neutral-400 hover:bg-neutral-800'
                    }`}
                  >
                    <div className="font-bold text-sm capitalize">{d.label}</div>
                    <div className="text-[10px] text-neutral-400 font-mono mt-1">{d.details}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Theme Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-2">
                Visual & Narrative Atmosphere
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {Object.values(themes).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setCurrentTheme(t.id)}
                    className={`p-2.5 rounded-xl border text-xs text-center transition-all ${
                      currentTheme === t.id
                        ? 'bg-neutral-800 border-amber-500 text-amber-400 font-bold'
                        : 'bg-neutral-900/40 border-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Timed Mode Toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-neutral-900/60 border border-neutral-800">
              <div className="flex items-center space-x-3">
                <Timer className="w-5 h-5 text-amber-500" />
                <div>
                  <div className="text-xs font-bold text-white">Timed Investigation Mode</div>
                  <div className="text-[11px] text-neutral-400">
                    Earn speed bonus points for solving the case before the clock expires.
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isTimed}
                onChange={(e) => setIsTimed(e.target.checked)}
                className="w-4 h-4 accent-amber-500 cursor-pointer"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!premise.trim()}
              className={`w-full py-4 rounded-xl font-bold text-black flex items-center justify-center space-x-2 shadow-xl hover:scale-[1.01] transition-all text-sm ${themeStyles.accentBg} disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              <span>Initialize Investigation Room</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
