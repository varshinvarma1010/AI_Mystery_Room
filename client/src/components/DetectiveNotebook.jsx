import React, { useState } from 'react';
import { BookOpen, Clock, Save, Check } from 'lucide-react';
import { caseApi } from '../api/caseApi.js';
import { useThemeAudio } from '../context/ThemeAudioContext.jsx';

export default function DetectiveNotebook({ caseId, clues = [], initialNotebook = '' }) {
  const { themeStyles } = useThemeAudio();
  const [notebookText, setNotebookText] = useState(initialNotebook);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const discoveredClues = clues.filter((c) => c.discovered);

  const handleSave = async () => {
    setSaving(true);
    try {
      await caseApi.updateNotebook(caseId, notebookText);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.warn('Failed to save notebook:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Freeform Detective Notepad */}
      <div className={`p-6 rounded-2xl ${themeStyles.panel} border ${themeStyles.border} shadow-xl flex flex-col`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <BookOpen className={`w-5 h-5 ${themeStyles.accent}`} />
            <h3 className="font-bold text-white text-base">Detective's Journal</h3>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-black ${themeStyles.accentBg} transition-all`}
          >
            {saved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            <span>{saved ? 'Saved' : 'Save Notes'}</span>
          </button>
        </div>

        <p className="text-xs text-neutral-400 mb-3">
          Jot down hunches, timeline discrepancies, and suspect alibi holes. Your notes are saved with this case file.
        </p>

        <textarea
          value={notebookText}
          onChange={(e) => setNotebookText(e.target.value)}
          placeholder="Ex: Butler claims he was serving tea at 9:15, but Dr. Julian's broken pocket watch stopped at 9:20 near the safe..."
          className="flex-1 w-full min-h-[300px] p-4 rounded-xl bg-neutral-950/80 border border-neutral-800 text-neutral-200 text-sm font-mono focus:outline-none focus:border-amber-500 leading-relaxed resize-none"
        />
      </div>

      {/* Auto-built Clue Timeline */}
      <div className={`p-6 rounded-2xl ${themeStyles.panel} border ${themeStyles.border} shadow-xl flex flex-col`}>
        <div className="flex items-center space-x-2 mb-4">
          <Clock className="w-5 h-5 text-amber-500" />
          <h3 className="font-bold text-white text-base">Evidence Timeline</h3>
        </div>

        <p className="text-xs text-neutral-400 mb-4">
          Chronological breakdown of uncovered physical evidence and testimonies:
        </p>

        <div className="flex-1 overflow-y-auto space-y-4 max-h-[360px] pr-2">
          {discoveredClues.length === 0 ? (
            <div className="text-center py-12 text-neutral-500 text-xs font-mono">
              No clues discovered yet. Inspect crime scene locations to build the timeline.
            </div>
          ) : (
            discoveredClues.map((clue, idx) => (
              <div key={clue.id} className="relative pl-6 pb-2 border-l-2 border-amber-900/60 last:border-0">
                <div className="absolute -left-[7px] top-0 w-3 h-3 rounded-full bg-amber-500 border-2 border-neutral-950"></div>
                <div className="text-[11px] text-amber-400 font-mono font-semibold uppercase">
                  Location: {clue.location}
                </div>
                <div className="text-sm font-bold text-white mt-0.5">{clue.title}</div>
                <p className="text-xs text-neutral-300 mt-1 leading-relaxed">{clue.text}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
