import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const ThemeAudioContext = createContext();

export const themes = {
  noir: {
    id: 'noir',
    name: 'Classic Noir',
    bg: 'bg-[#0a0d14]',
    panel: 'bg-[#121722]',
    border: 'border-neutral-800',
    accent: 'text-amber-500',
    accentBg: 'bg-amber-600 hover:bg-amber-500',
    font: 'font-mono'
  },
  victorian: {
    id: 'victorian',
    name: 'Victorian Manor',
    bg: 'bg-[#120e0b]',
    panel: 'bg-[#1c1612]',
    border: 'border-amber-950',
    accent: 'text-amber-400',
    accentBg: 'bg-amber-700 hover:bg-amber-600',
    font: 'font-serif'
  },
  scifi: {
    id: 'scifi',
    name: 'Sci-Fi Station',
    bg: 'bg-[#080d1a]',
    panel: 'bg-[#0e162b]',
    border: 'border-cyan-900',
    accent: 'text-cyan-400',
    accentBg: 'bg-cyan-600 hover:bg-cyan-500',
    font: 'font-sans'
  },
  cozy: {
    id: 'cozy',
    name: 'Cozy Village',
    bg: 'bg-[#141812]',
    panel: 'bg-[#1d241a]',
    border: 'border-emerald-950',
    accent: 'text-emerald-400',
    accentBg: 'bg-emerald-700 hover:bg-emerald-600',
    font: 'font-serif'
  },
  cyberpunk: {
    id: 'cyberpunk',
    name: 'Cyberpunk 2099',
    bg: 'bg-[#0d0716]',
    panel: 'bg-[#1a0e2e]',
    border: 'border-fuchsia-900',
    accent: 'text-fuchsia-400',
    accentBg: 'bg-fuchsia-600 hover:bg-fuchsia-500',
    font: 'font-mono'
  }
};

export const ThemeAudioProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem('mystery_theme') || 'noir';
  });

  const [soundEnabled, setSoundEnabled] = useState(false);
  const audioContextRef = useRef(null);
  const noiseNodeRef = useRef(null);
  const gainNodeRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('mystery_theme', currentTheme);
  }, [currentTheme]);

  // Web Audio API ambient soundscape (gentle rain & atmospheric tape hiss)
  useEffect(() => {
    if (soundEnabled) {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!audioContextRef.current) {
          audioContextRef.current = new AudioCtx();
        }
        const ctx = audioContextRef.current;
        if (ctx.state === 'suspended') {
          ctx.resume();
        }

        // Generate gentle brown noise buffer
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          output[i] = (lastOut + 0.02 * white) / 1.02;
          lastOut = output[i];
          output[i] *= 3.5; // Gain boost
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        // Bandpass filter for gentle rain acoustics
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, ctx.currentTime);

        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0.04, ctx.currentTime); // Soft background level

        whiteNoise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);

        whiteNoise.start(0);

        noiseNodeRef.current = whiteNoise;
        gainNodeRef.current = gainNode;
      } catch (e) {
        console.warn('Web Audio initialization error:', e);
      }
    } else {
      if (noiseNodeRef.current) {
        try {
          noiseNodeRef.current.stop();
          noiseNodeRef.current.disconnect();
        } catch (e) {}
        noiseNodeRef.current = null;
      }
    }

    return () => {
      if (noiseNodeRef.current) {
        try {
          noiseNodeRef.current.stop();
          noiseNodeRef.current.disconnect();
        } catch (e) {}
      }
    };
  }, [soundEnabled]);

  const toggleSound = () => setSoundEnabled((prev) => !prev);

  const themeStyles = themes[currentTheme] || themes.noir;

  return (
    <ThemeAudioContext.Provider
      value={{
        currentTheme,
        setCurrentTheme,
        themeStyles,
        soundEnabled,
        toggleSound
      }}
    >
      <div className={`${themeStyles.bg} ${themeStyles.font} min-h-screen text-neutral-200 transition-colors duration-500`}>
        {children}
      </div>
    </ThemeAudioContext.Provider>
  );
};

export const useThemeAudio = () => useContext(ThemeAudioContext);
