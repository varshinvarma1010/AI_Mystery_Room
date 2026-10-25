import React, { createContext, useContext, useState, useEffect } from 'react';

const PlayerContext = createContext();

export const PlayerProvider = ({ children }) => {
  const [playerId, setPlayerId] = useState(() => {
    return localStorage.getItem('mystery_player_id') || `det_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  });

  const [nickname, setNickname] = useState(() => {
    return localStorage.getItem('mystery_nickname') || 'Detective Holmes';
  });

  const [streak, setStreak] = useState(() => {
    return parseInt(localStorage.getItem('mystery_streak') || '0', 10);
  });

  useEffect(() => {
    localStorage.setItem('mystery_player_id', playerId);
  }, [playerId]);

  useEffect(() => {
    localStorage.setItem('mystery_nickname', nickname);
  }, [nickname]);

  useEffect(() => {
    localStorage.setItem('mystery_streak', streak.toString());
  }, [streak]);

  const incrementStreak = () => setStreak((prev) => prev + 1);
  const resetStreak = () => setStreak(0);

  return (
    <PlayerContext.Provider
      value={{
        playerId,
        nickname,
        setNickname,
        streak,
        incrementStreak,
        resetStreak
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => useContext(PlayerContext);
