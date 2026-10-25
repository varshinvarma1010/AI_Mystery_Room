import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Volume2, VolumeX, Flame, Palette, User, Sparkles } from 'lucide-react';
import { useThemeAudio, themes } from '../context/ThemeAudioContext.jsx';
import { usePlayer } from '../context/PlayerContext.jsx';

export default function Navbar() {
  const location = useLocation();
  const { currentTheme, setCurrentTheme, themeStyles, soundEnabled, toggleSound } = useThemeAudio();
  const { nickname, setNickname, streak } = usePlayer();
  const [showNickModal, setShowNickModal] = useState(false);
  const [nickInput, setNickInput] = useState(nickname);

  const saveNickname = (e) => {
    e.preventDefault();
    if (nickInput.trim()) {
      setNickname(nickInput.trim());
      setShowNickModal(false);
    }
  };

  return (
    <>
      <header className={`border-b ${themeStyles.border} ${themeStyles.panel} sticky top-0 z-40 backdrop-blur-md bg-opacity-90 px-4 lg:px-8 py-3 transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className={`p-2 rounded-lg bg-neutral-900 border ${themeStyles.border} group-hover:scale-105 transition-transform`}>
              <Search className={`w-5 h-5 ${themeStyles.accent}`} />
            </div>
            <div>
              <span className="font-extrabold tracking-wider text-base lg:text-lg text-white block">
                AI MYSTERY ROOM
              </span>
              <span className="text-[10px] text-neutral-400 uppercase tracking-widest block -mt-1">
                Gemini Detective
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link 
              to="/" 
              className={`${location.pathname === '/' ? themeStyles.accent : 'text-neutral-400 hover:text-white'} transition-colors`}
            >
              Home
            </Link>
            <Link 
              to="/create" 
              className={`${location.pathname === '/create' ? themeStyles.accent : 'text-neutral-400 hover:text-white'} transition-colors`}
            >
              New Case
            </Link>
            <Link 
              to="/daily" 
              className="text-amber-400 hover:text-amber-300 flex items-center space-x-1 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Daily Mystery</span>
            </Link>
            <Link 
              to="/leaderboard" 
              className={`${location.pathname === '/leaderboard' ? themeStyles.accent : 'text-neutral-400 hover:text-white'} transition-colors`}
            >
              Leaderboard
            </Link>
          </nav>

          {/* Controls: Audio, Theme, Streak, Profile */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Streak Counter */}
            {streak > 0 && (
              <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-orange-950/40 border border-orange-800 text-orange-400 text-xs font-semibold" title="Consecutive Cases Solved">
                <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
                <span>{streak} Streak</span>
              </div>
            )}

            {/* Ambient Sound Toggle */}
            <button
              onClick={toggleSound}
              className={`p-2 rounded-lg border ${themeStyles.border} bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 transition-colors`}
              title={soundEnabled ? 'Mute Atmospheric Ambience' : 'Play Atmospheric Ambience (Rain)'}
              aria-label="Toggle Sound"
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse" />
              ) : (
                <VolumeX className="w-4 h-4 text-neutral-500" />
              )}
            </button>

            {/* Theme Selector */}
            <div className="relative group">
              <button
                className={`p-2 rounded-lg border ${themeStyles.border} bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 transition-colors flex items-center space-x-1`}
                title="Select Visual Theme"
                aria-label="Theme selector"
              >
                <Palette className="w-4 h-4" />
              </button>
              <div className="absolute right-0 mt-2 w-44 rounded-xl bg-neutral-900 border border-neutral-800 shadow-2xl p-1.5 hidden group-hover:block z-50">
                <div className="text-[10px] uppercase font-bold text-neutral-500 px-2 py-1">Atmosphere</div>
                {Object.values(themes).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setCurrentTheme(t.id)}
                    className={`w-full text-left px-2 py-1.5 rounded-lg text-xs flex items-center justify-between ${
                      currentTheme === t.id ? 'bg-neutral-800 text-amber-400 font-bold' : 'text-neutral-300 hover:bg-neutral-800/60'
                    }`}
                  >
                    <span>{t.name}</span>
                    {currentTheme === t.id && <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Player Nickname Button */}
            <button
              onClick={() => setShowNickModal(true)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border ${themeStyles.border} bg-neutral-900/80 hover:bg-neutral-800 text-xs text-neutral-300 transition-colors`}
              title="Edit Detective Name"
            >
              <User className="w-3.5 h-3.5 text-neutral-400" />
              <span className="hidden sm:inline max-w-[100px] truncate">{nickname}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Nickname Modal */}
      {showNickModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`w-full max-w-sm rounded-2xl ${themeStyles.panel} border ${themeStyles.border} p-6 shadow-2xl`}>
            <h3 className="text-lg font-bold text-white mb-2">Detective Identification</h3>
            <p className="text-xs text-neutral-400 mb-4">Enter the name that will appear on case reports and the global leaderboard.</p>
            <form onSubmit={saveNickname} className="space-y-4">
              <input
                type="text"
                value={nickInput}
                onChange={(e) => setNickInput(e.target.value)}
                maxLength={25}
                className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-white text-sm focus:outline-none focus:border-amber-500"
                placeholder="e.g. Detective Dupin"
                autoFocus
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowNickModal(false)}
                  className="px-4 py-1.5 text-xs text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-1.5 text-xs font-bold text-black rounded-lg ${themeStyles.accentBg}`}
                >
                  Save Identity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
