import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShieldCheck, Award, ArrowLeft, Printer, Share2, Check } from 'lucide-react';
import { caseApi } from '../api/caseApi.js';
import { useThemeAudio } from '../context/ThemeAudioContext.jsx';

export default function CaseFilePage() {
  const { id } = useParams();
  const { themeStyles } = useThemeAudio();

  const [caseFile, setCaseFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchFile = async () => {
      try {
        setLoading(true);
        const data = await caseApi.getCaseFile(id);
        setCaseFile(data);
      } catch (err) {
        console.error('Failed to load case file:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFile();
  }, [id]);

  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <div className="w-10 h-10 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin mx-auto mb-4"></div>
        <div className="text-white font-mono text-xs">Retrieving Archived Case File...</div>
      </div>
    );
  }

  if (!caseFile) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center text-xs text-neutral-400">
        Case file could not be retrieved or is still under active investigation.
      </div>
    );
  }

  const culprit = caseFile.suspects.find((s) => s.id === caseFile.solution?.culpritId);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between">
        <Link to={`/case/${id}/result`} className="flex items-center space-x-1.5 text-xs text-neutral-400 hover:text-white">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Verdict</span>
        </Link>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => window.print()}
            className="p-2 rounded-lg bg-neutral-900 border border-neutral-700 hover:bg-neutral-800 text-xs text-neutral-300"
            title="Print Case File"
          >
            <Printer className="w-4 h-4" />
          </button>
          <button
            onClick={copyShareLink}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-black font-bold text-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copied ? 'Link Copied!' : 'Share Dossier'}</span>
          </button>
        </div>
      </div>

      {/* Official Certificate Dossier */}
      <div className="p-8 sm:p-12 rounded-3xl bg-[#0f131c] border-2 border-amber-600/40 shadow-2xl space-y-8 font-serif text-neutral-200">
        {/* Certificate Header */}
        <div className="text-center space-y-2 border-b border-amber-800/40 pb-6">
          <div className="flex justify-center mb-2">
            <div className="p-3 rounded-full bg-amber-950/60 border border-amber-700/80 text-amber-400">
              <Award className="w-8 h-8" />
            </div>
          </div>
          <div className="text-xs uppercase tracking-widest text-amber-500 font-mono font-bold">
            Official Case Clearance Certificate
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white">{caseFile.title}</h1>
          <p className="text-xs text-neutral-400 font-mono">
            Investigated by: <strong className="text-amber-300">{caseFile.nickname || 'Anonymous Sleuth'}</strong> • Difficulty: {caseFile.difficulty.toUpperCase()}
          </p>
        </div>

        {/* Clearance Rank & Score */}
        <div className="flex items-center justify-around py-4 rounded-2xl bg-neutral-950/60 border border-neutral-800 font-mono text-center">
          <div>
            <div className="text-[10px] text-neutral-500 uppercase">Detective Clearance</div>
            <div className="text-base sm:text-lg font-bold text-amber-400">{caseFile.score.tier}</div>
          </div>
          <div className="h-8 w-px bg-neutral-800"></div>
          <div>
            <div className="text-[10px] text-neutral-500 uppercase">Final Forensic Score</div>
            <div className="text-base sm:text-lg font-bold text-white">{caseFile.score.total} pts</div>
          </div>
        </div>

        {/* Narrative & Solution Summary */}
        <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-neutral-300 font-light">
          <div>
            <div className="font-bold text-amber-400 font-mono uppercase text-xs mb-1">Incident Summary</div>
            <p>{caseFile.story}</p>
          </div>

          <div className="pt-4 border-t border-neutral-800/80">
            <div className="font-bold text-amber-400 font-mono uppercase text-xs mb-1">Official Solution</div>
            <p>
              The perpetrator was determined to be <strong className="text-white">{culprit?.name}</strong> ({culprit?.role}), acting out of <strong className="text-white">{caseFile.solution?.motive}</strong> via <strong className="text-white">{caseFile.solution?.method}</strong>.
            </p>
            <p className="mt-2 text-neutral-400 italic">"{caseFile.solution?.explanation}"</p>
          </div>
        </div>

        {/* AI Critique */}
        {caseFile.detectiveCritique && (
          <div className="p-4 rounded-xl bg-neutral-950/80 border border-neutral-800 space-y-1.5 text-xs italic text-neutral-300">
            <div className="font-bold text-amber-400 font-mono not-italic uppercase text-[10px]">
              Consulting Detective Commendation
            </div>
            <p>"{caseFile.detectiveCritique}"</p>
          </div>
        )}

        {/* Seal */}
        <div className="pt-6 border-t border-amber-900/40 flex items-center justify-between text-[11px] font-mono text-neutral-500">
          <span>AI Mystery Room • Powered by Gemini 2.5</span>
          <span>Verified Seal: #{caseFile._id.slice(-6).toUpperCase()}</span>
        </div>
      </div>
    </div>
  );
}
