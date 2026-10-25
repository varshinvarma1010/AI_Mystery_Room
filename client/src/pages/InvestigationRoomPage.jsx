import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Users, 
  Search, 
  Pin, 
  BookOpen, 
  Lightbulb, 
  Gavel, 
  Clock, 
  MessageSquare, 
  ShieldAlert, 
  CheckCircle, 
  AlertCircle,
  FileText
} from 'lucide-react';
import { caseApi } from '../api/caseApi.js';
import { useThemeAudio } from '../context/ThemeAudioContext.jsx';
import SuspectInterrogationModal from '../components/SuspectInterrogationModal.jsx';
import ContradictionModal from '../components/ContradictionModal.jsx';
import EvidenceCorkboard from '../components/EvidenceCorkboard.jsx';
import DetectiveNotebook from '../components/DetectiveNotebook.jsx';
import HintModal from '../components/HintModal.jsx';

export default function InvestigationRoomPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { themeStyles } = useThemeAudio();

  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('suspects'); // 'suspects' | 'clues' | 'corkboard' | 'notebook'

  // Modals state
  const [activeInterrogationSuspect, setActiveInterrogationSuspect] = useState(null);
  const [showContradictionModal, setShowContradictionModal] = useState(false);
  const [showHintModal, setShowHintModal] = useState(false);

  // Optional countdown timer
  const [timeLeft, setTimeLeft] = useState(() => {
    const saved = sessionStorage.getItem(`timer_${id}`);
    return saved ? parseInt(saved, 10) : null;
  });

  useEffect(() => {
    let timer;
    if (timeLeft !== null && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          sessionStorage.setItem(`timer_${id}`, (prev - 1).toString());
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [timeLeft, id]);

  const fetchCase = async () => {
    try {
      setLoading(true);
      const data = await caseApi.getCase(id);
      // If already completed, redirect to results
      if (data.status === 'completed') {
        navigate(`/case/${id}/result`);
        return;
      }
      setCaseData(data);
    } catch (err) {
      console.error('Failed to load case:', err);
      setError(err.response?.data?.error || 'Failed to load case dossier');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCase();
  }, [id]);

  const handleClueDiscovered = async (clueId) => {
    try {
      const res = await caseApi.discoverClue(id, clueId);
      setCaseData((prev) => ({
        ...prev,
        clues: prev.clues.map((c) => (c.id === clueId ? res.clue : c)),
        progress: {
          ...prev.progress,
          discoveredClueIds: res.discoveredClueIds
        },
        score: {
          ...prev.score,
          cluesDiscoveredPoints: res.cluesDiscoveredPoints,
          total: (prev.score.total || 0) + 5
        }
      }));
    } catch (err) {
      console.warn('Failed to discover clue:', err);
    }
  };

  const handleQuestionSubmitted = (data) => {
    setCaseData((prev) => ({
      ...prev,
      progress: {
        ...prev.progress,
        questionsAsked: data.questionsAsked
      },
      score: {
        ...prev.score,
        questionsPenalty: data.questionsPenalty
      }
    }));
  };

  const handleHintUnlocked = (data) => {
    setCaseData((prev) => ({
      ...prev,
      hints: prev.hints.map((h) => (h.level === data.hint.level ? data.hint : h)),
      progress: {
        ...prev.progress,
        hintsUsed: data.hintsUsed
      },
      score: {
        ...prev.score,
        hintsPenalty: data.hintsPenalty
      }
    }));
  };

  const handleContradictionResolved = (res) => {
    setCaseData((prev) => ({
      ...prev,
      score: {
        ...prev.score,
        contradictionPoints: res.contradictionPoints
      }
    }));
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin mx-auto"></div>
        <div className="text-white font-mono text-sm">Accessing Classified Case File...</div>
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
        <h3 className="text-xl font-bold text-white">Investigation Interrupted</h3>
        <p className="text-xs text-neutral-400">{error || 'Case file not found'}</p>
        <button
          onClick={() => navigate('/create')}
          className="px-6 py-2 rounded-xl bg-amber-600 text-black font-bold text-xs"
        >
          Return to Registry
        </button>
      </div>
    );
  }

  const discoveredCount = caseData.clues.filter((c) => c.discovered).length;
  const questionsRemaining = Math.max(0, (caseData.progress.maxQuestions || 8) - (caseData.progress.questionsAsked || 0));

  const formatTimer = (secs) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins}:${rem < 10 ? '0' : ''}${rem}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 space-y-6">
      {/* Top Investigation Bar */}
      <div className={`p-4 sm:p-5 rounded-2xl ${themeStyles.panel} border ${themeStyles.border} shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4`}>
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-amber-950/60 text-amber-400 border border-amber-800">
              {caseData.difficulty} Difficulty
            </span>
            <span className="text-[10px] text-neutral-400 font-mono">
              Theme: {caseData.theme}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white mt-1">{caseData.title}</h1>
        </div>

        {/* Stats & Actions */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {timeLeft !== null && (
            <div className={`flex items-center space-x-1 px-3 py-1.5 rounded-xl border font-mono text-xs font-bold ${
              timeLeft < 120 ? 'bg-red-950/40 border-red-800 text-red-400 animate-pulse' : 'bg-neutral-900 border-neutral-700 text-amber-400'
            }`}>
              <Clock className="w-3.5 h-3.5" />
              <span>{formatTimer(timeLeft)}</span>
            </div>
          )}

          <div className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-700 text-xs font-mono text-neutral-300">
            <span>Clues: <strong className="text-amber-400">{discoveredCount}/{caseData.clues.length}</strong></span>
          </div>

          <div className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-700 text-xs font-mono text-neutral-300">
            <span>Questions: <strong className={questionsRemaining > 0 ? 'text-amber-400' : 'text-red-400'}>{questionsRemaining}</strong> left</span>
          </div>

          <button
            onClick={() => setShowHintModal(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs text-amber-300 transition-colors"
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            <span>Hints ({caseData.progress.hintsUsed}/{caseData.hints.length})</span>
          </button>

          <button
            onClick={() => setShowContradictionModal(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs text-red-300 transition-colors"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
            <span>Flag Contradiction</span>
          </button>

          <button
            onClick={() => navigate(`/case/${id}/accuse`)}
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold text-black ${themeStyles.accentBg} shadow-lg hover:scale-105 transition-all`}
          >
            <Gavel className="w-4 h-4" />
            <span>Make Accusation</span>
          </button>
        </div>
      </div>

      {/* Story Background Card */}
      <div className={`p-5 rounded-2xl ${themeStyles.panel} border ${themeStyles.border} shadow-lg`}>
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-amber-500 mb-2">
          <FileText className="w-4 h-4" />
          <span>Crime Scene Incident Report</span>
        </div>
        <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-light">
          {caseData.story}
        </p>
      </div>

      {/* Primary Investigation Tabs */}
      <div className="flex border-b border-neutral-800 space-x-2 overflow-x-auto pb-1">
        {[
          { id: 'suspects', label: 'Suspect Dossiers', icon: Users, count: caseData.suspects.length },
          { id: 'clues', label: 'Evidence Locker', icon: Search, count: `${discoveredCount}/${caseData.clues.length}` },
          { id: 'corkboard', label: 'Evidence Corkboard', icon: Pin },
          { id: 'notebook', label: 'Journal & Timeline', icon: BookOpen }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-neutral-900 text-amber-400 border border-neutral-700 shadow-md'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/40'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-neutral-800 text-neutral-400">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Suspect Dossiers */}
      {activeTab === 'suspects' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {caseData.suspects.map((suspect) => (
            <div
              key={suspect.id}
              className={`p-5 rounded-2xl ${themeStyles.panel} border ${themeStyles.border} shadow-xl flex flex-col justify-between space-y-4`}
            >
              <div>
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-700 flex items-center justify-center font-black text-amber-500 text-lg shadow-inner">
                    {suspect.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">{suspect.name}</h3>
                    <span className="text-xs text-amber-400 font-mono">{suspect.role}</span>
                  </div>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed font-light">
                  {suspect.publicBio}
                </p>
              </div>

              <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between">
                <button
                  onClick={() => setActiveInterrogationSuspect(suspect)}
                  className={`w-full py-2 rounded-xl text-xs font-bold text-black flex items-center justify-center space-x-1.5 ${themeStyles.accentBg} transition-all`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Interrogate Suspect</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Clues & Forensic Locker */}
      {activeTab === 'clues' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {caseData.clues.map((clue) => (
            <div
              key={clue.id}
              className={`p-5 rounded-2xl border transition-all ${
                clue.discovered
                  ? `${themeStyles.panel} ${themeStyles.border} shadow-xl`
                  : 'bg-neutral-950/40 border-dashed border-neutral-800'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-mono text-neutral-500 mb-2">
                <span className="uppercase text-amber-400 font-bold">{clue.location}</span>
                <span className="capitalize">{clue.category}</span>
              </div>

              <h4 className="font-bold text-white text-sm mb-2">{clue.title}</h4>

              {clue.discovered ? (
                <div className="space-y-3">
                  <p className="text-xs text-neutral-300 leading-relaxed font-light">{clue.text}</p>
                  <div className="flex items-center space-x-1 text-[10px] text-emerald-400 font-mono">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Discovered & Cataloged (+5 pts)</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-neutral-500 italic">
                    Unexamined crime scene item. Forensic inspection required to reveal details.
                  </p>
                  <button
                    onClick={() => handleClueDiscovered(clue.id)}
                    className="w-full py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-amber-300 border border-neutral-700 text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Examine Evidence (+5 pts)</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Evidence Corkboard */}
      {activeTab === 'corkboard' && (
        <EvidenceCorkboard
          caseId={id}
          suspects={caseData.suspects}
          clues={caseData.clues}
          initialBoardState={caseData.progress?.boardState}
        />
      )}

      {/* Tab 4: Detective Notebook & Timeline */}
      {activeTab === 'notebook' && (
        <DetectiveNotebook
          caseId={id}
          clues={caseData.clues}
          initialNotebook={caseData.progress?.notebook}
        />
      )}

      {/* Interrogation Modal */}
      {activeInterrogationSuspect && (
        <SuspectInterrogationModal
          caseId={id}
          suspect={activeInterrogationSuspect}
          questionsAsked={caseData.progress.questionsAsked || 0}
          maxQuestions={caseData.progress.maxQuestions || 8}
          initialMessages={caseData.interrogationLog || []}
          onQuestionSubmitted={handleQuestionSubmitted}
          onClose={() => setActiveInterrogationSuspect(null)}
        />
      )}

      {/* Contradiction Modal */}
      {showContradictionModal && (
        <ContradictionModal
          caseId={id}
          suspects={caseData.suspects}
          clues={caseData.clues}
          onContradictionResolved={handleContradictionResolved}
          onClose={() => setShowContradictionModal(false)}
        />
      )}

      {/* Hint Modal */}
      {showHintModal && (
        <HintModal
          caseId={id}
          hints={caseData.hints}
          onHintUnlocked={handleHintUnlocked}
          onClose={() => setShowHintModal(false)}
        />
      )}
    </div>
  );
}
