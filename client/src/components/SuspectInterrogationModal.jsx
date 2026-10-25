import React, { useState } from 'react';
import { X, Send, MessageSquare, AlertCircle } from 'lucide-react';
import { caseApi } from '../api/caseApi.js';
import { useThemeAudio } from '../context/ThemeAudioContext.jsx';

export default function SuspectInterrogationModal({
  caseId,
  suspect,
  onClose,
  questionsAsked,
  maxQuestions,
  onQuestionSubmitted,
  initialMessages = []
}) {
  const { themeStyles } = useThemeAudio();
  const [messages, setMessages] = useState(() => {
    return initialMessages.filter((m) => m.suspectId === suspect.id);
  });
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const remaining = Math.max(0, maxQuestions - questionsAsked);

  const quickPrompts = [
    'Where were you at the time of the incident?',
    'What was your exact relationship with the victim?',
    'Did you notice anyone behaving suspiciously?'
  ];

  const handleSend = async (textToSend) => {
    const q = (textToSend || question).trim();
    if (!q || loading || remaining <= 0) return;

    setError(null);
    setLoading(true);

    // Optimistically add player message
    const playerMsg = { sender: 'player', message: q, timestamp: new Date() };
    setMessages((prev) => [...prev, playerMsg]);
    setQuestion('');

    try {
      const data = await caseApi.interrogateSuspect(caseId, suspect.id, q);
      const suspectMsg = { sender: 'suspect', message: data.suspectReply, timestamp: new Date() };
      setMessages((prev) => [...prev, suspectMsg]);
      onQuestionSubmitted(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Interrogation interrupted. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 z-50">
      <div className={`w-full max-w-2xl rounded-2xl ${themeStyles.panel} border ${themeStyles.border} shadow-2xl flex flex-col max-h-[90vh] overflow-hidden`}>
        {/* Header */}
        <div className={`p-4 border-b ${themeStyles.border} flex items-center justify-between bg-neutral-900/60`}>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center font-bold text-amber-500">
              {suspect.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-white text-base sm:text-lg">{suspect.name}</h3>
                <span className="text-[11px] px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 font-mono">
                  {suspect.role}
                </span>
              </div>
              <p className="text-xs text-neutral-400 line-clamp-1">{suspect.publicBio}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className={`text-xs px-2.5 py-1 rounded-full border ${remaining > 0 ? 'bg-amber-950/40 border-amber-800 text-amber-400' : 'bg-red-950/40 border-red-800 text-red-400'}`}>
              {remaining} questions left
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Chat History */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#080b11]">
          {messages.length === 0 ? (
            <div className="text-center py-10 text-neutral-500 text-sm">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p>Cross-examine {suspect.name}.</p>
              <p className="text-xs text-neutral-600 mt-1">Each question costs 2 investigation points. Choose your words carefully.</p>
            </div>
          ) : (
            messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${m.sender === 'player' ? 'items-end' : 'items-start'}`}
              >
                <div className="text-[10px] text-neutral-500 mb-0.5 px-1 font-mono">
                  {m.sender === 'player' ? 'Detective' : suspect.name}
                </div>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                    m.sender === 'player'
                      ? 'bg-amber-700 text-white rounded-br-none'
                      : 'bg-neutral-800 text-neutral-100 border border-neutral-700 rounded-bl-none'
                  }`}
                >
                  {m.message}
                </div>
              </div>
            ))
          )}

          {loading && (
            <div className="flex flex-col items-start">
              <div className="text-[10px] text-neutral-500 mb-0.5 font-mono">{suspect.name} is speaking...</div>
              <div className="bg-neutral-800 border border-neutral-700 rounded-2xl rounded-bl-none px-4 py-2.5 text-sm text-neutral-400 animate-pulse flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce delay-100"></span>
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce delay-200"></span>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-lg bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Quick Prompts */}
        {remaining > 0 && (
          <div className="p-2 border-t border-neutral-800/80 bg-neutral-900/40 flex flex-wrap gap-1.5">
            {quickPrompts.map((qp, i) => (
              <button
                key={i}
                onClick={() => handleSend(qp)}
                disabled={loading}
                className="text-[11px] px-2.5 py-1 rounded-md bg-neutral-800/70 hover:bg-neutral-700 text-neutral-300 border border-neutral-700/60 transition-colors"
              >
                "{qp}"
              </button>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <div className={`p-3 border-t ${themeStyles.border} bg-neutral-900/80`}>
          {remaining > 0 ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center space-x-2"
            >
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder={`Ask ${suspect.name} a question (-2 pts)...`}
                disabled={loading}
                className="flex-1 bg-neutral-950 border border-neutral-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
              />
              <button
                type="submit"
                disabled={loading || !question.trim()}
                className={`p-2.5 rounded-xl font-bold text-black ${themeStyles.accentBg} disabled:opacity-40 disabled:cursor-not-allowed transition-all`}
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <div className="text-center py-2 text-xs text-red-400 font-mono">
              ⚠️ Interrogation allowance exhausted. Use your gathered statements to deduce the truth.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
