import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { PlayerProvider } from './context/PlayerContext.jsx';
import { ThemeAudioProvider } from './context/ThemeAudioContext.jsx';
import Navbar from './components/Navbar.jsx';

import HomePage from './pages/HomePage.jsx';
import CreateMysteryPage from './pages/CreateMysteryPage.jsx';
import DailyCasePage from './pages/DailyCasePage.jsx';
import InvestigationRoomPage from './pages/InvestigationRoomPage.jsx';
import AccusationPage from './pages/AccusationPage.jsx';
import ResultsPage from './pages/ResultsPage.jsx';
import CaseFilePage from './pages/CaseFilePage.jsx';
import LeaderboardPage from './pages/LeaderboardPage.jsx';

export default function App() {
  return (
    <PlayerProvider>
      <ThemeAudioProvider>
        <div className="min-h-screen flex flex-col justify-between selection:bg-amber-600 selection:text-white">
          <Navbar />
          
          <main className="flex-1 pb-16">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/create" element={<CreateMysteryPage />} />
              <Route path="/daily" element={<DailyCasePage />} />
              <Route path="/case/:id" element={<InvestigationRoomPage />} />
              <Route path="/case/:id/accuse" element={<AccusationPage />} />
              <Route path="/case/:id/result" element={<ResultsPage />} />
              <Route path="/case/:id/file" element={<CaseFilePage />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
            </Routes>
          </main>

          <footer className="border-t border-neutral-800/80 py-6 px-4 text-center text-xs text-neutral-500 font-mono">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
              <div>
                AI Mystery Room • Powered by Google Gemini 2.5 & Node/Express/MongoDB
              </div>
              <div className="text-[11px] text-neutral-600">
                Zero-Leak Security • Dual-Pass Solvability Verified
              </div>
            </div>
          </footer>
        </div>
      </ThemeAudioProvider>
    </PlayerProvider>
  );
}
