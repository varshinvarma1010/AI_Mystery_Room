import React, { useState, useEffect } from 'react';
import { Trophy, Medal, History, Shield, Flame, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { caseApi } from '../api/caseApi.js';
import { useThemeAudio } from '../context/ThemeAudioContext.jsx';
import { usePlayer } from '../context/PlayerContext.jsx';

export default function LeaderboardPage() {
  const { themeStyles } = useThemeAudio();
  const { playerId, nickname, streak } = usePlayer();

  const [difficulty, setDifficulty] = useState('medium');
  const [leaderboard, setLeaderboard] = useState([]);
  const [personalHistory, setPersonalHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [lbData, histData] = await Promise.all([
          caseApi.getLeaderboard(difficulty),
          caseApi.getPlayerHistory(playerId)
        ]);
        setLeaderboard(lbData.leaderboard || []);
        setPersonalHistory(histData.cases || []);
      } catch (err) {
        console.warn('Failed to load leaderboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [difficulty, playerId]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-950/40 border border-amber-800 text-amber-400 text-xs font-mono">
          <Trophy className="w-3.5 h-3.5" />
          <span>Hall of Master Detectives</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Global Sleuth Leaderboard</h1>
        <p className="text-xs text-neutral-400">
          Rankings are calculated strictly by authoritative backend scoring and deduction accuracy.
        </p>
      </div>

      {/* Difficulty Tabs */}
      <div className="flex justify-center space-x-2">
        {['easy', 'medium', 'hard'].map((d) => (
          <button
            key={d}
            onClick={() => setDifficulty(d)}
            className={`px-5 py-2 rounded-xl text-xs font-bold uppercase font-mono transition-all ${
              difficulty === d
                ? 'bg-amber-600 text-black shadow-lg shadow-amber-600/20'
                : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
          >
            {d} Cases
          </button>
        ))}
      </div>

      {/* Leaderboard Table */}
      <div className={`p-6 rounded-3xl ${themeStyles.panel} border ${themeStyles.border} shadow-2xl`}>
        {loading ? (
          <div className="py-16 text-center text-xs text-neutral-400 font-mono">
            Loading rankings...
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Medal className="w-8 h-8 text-neutral-600 mx-auto" />
            <p className="text-xs text-neutral-400">No solved cases recorded on this difficulty yet.</p>
            <Link to="/create" className="inline-block text-xs font-bold text-amber-400 hover:underline">
              Be the first to solve one →
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-800 text-neutral-400 uppercase font-mono text-[10px]">
                  <th className="py-3 px-3">Rank</th>
                  <th className="py-3 px-3">Detective</th>
                  <th className="py-3 px-3">Case</th>
                  <th className="py-3 px-3">Clearance Tier</th>
                  <th className="py-3 px-3 text-right">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 font-mono">
                {leaderboard.map((entry, idx) => (
                  <tr key={entry._id} className="hover:bg-neutral-900/40 transition-colors">
                    <td className="py-3 px-3 font-bold">
                      {idx === 0 ? '🥇 #1' : idx === 1 ? '🥈 #2' : idx === 2 ? '🥉 #3' : `#${idx + 1}`}
                    </td>
                    <td className="py-3 px-3 text-white font-sans font-bold flex items-center space-x-2">
                      <span>{entry.nickname || 'Detective'}</span>
                    </td>
                    <td className="py-3 px-3 text-neutral-300 font-sans">{entry.title}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-950/40 border border-amber-800 text-amber-300">
                        {entry.score?.tier || 'Solved'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-amber-400 text-sm">
                      {entry.score?.total || 0} pts
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Personal Case History */}
      <div className={`p-6 rounded-3xl ${themeStyles.panel} border ${themeStyles.border} shadow-xl space-y-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <History className="w-4 h-4 text-amber-500" />
            <h3 className="font-bold text-white text-base">Your Investigation History</h3>
          </div>
          {streak > 0 && (
            <div className="flex items-center space-x-1 text-xs text-orange-400 font-mono">
              <Flame className="w-3.5 h-3.5 fill-orange-400" />
              <span>{streak} Streak</span>
            </div>
          )}
        </div>

        {personalHistory.length === 0 ? (
          <p className="text-xs text-neutral-500 py-4">No cases logged for your detective identity yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {personalHistory.map((item) => (
              <Link
                key={item._id}
                to={item.status === 'completed' ? `/case/${item._id}/result` : `/case/${item._id}`}
                className="p-3.5 rounded-xl bg-neutral-900/60 hover:bg-neutral-800/80 border border-neutral-800 transition-all text-xs block group"
              >
                <div className="flex items-center justify-between text-[10px] text-neutral-400 font-mono mb-1">
                  <span className="uppercase">{item.difficulty}</span>
                  <span className={item.status === 'completed' ? 'text-emerald-400' : 'text-amber-400'}>
                    {item.status === 'completed' ? 'Closed' : 'Active'}
                  </span>
                </div>
                <div className="font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-1">
                  {item.title}
                </div>
                {item.status === 'completed' && (
                  <div className="text-[11px] text-neutral-400 font-mono mt-2">
                    Score: <strong className="text-amber-400">{item.score?.total} pts</strong> • {item.score?.tier}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
