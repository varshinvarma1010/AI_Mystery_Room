import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, AlertCircle } from 'lucide-react';
import { caseApi } from '../api/caseApi.js';

export default function DailyCasePage() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDaily = async () => {
      try {
        const dailyCase = await caseApi.getDailyCase();
        navigate(`/case/${dailyCase._id}`);
      } catch (err) {
        console.error('Failed to load daily case:', err);
        setError('Failed to fetch today’s daily mystery. Please try again.');
      }
    };
    loadDaily();
  }, [navigate]);

  if (error) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
        <h3 className="text-lg font-bold text-white">Daily Mystery Unavailable</h3>
        <p className="text-xs text-neutral-400">{error}</p>
        <button
          onClick={() => navigate('/create')}
          className="px-6 py-2 rounded-xl bg-amber-600 text-black font-bold text-xs"
        >
          Generate Custom Case
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-32 text-center space-y-4">
      <div className="w-12 h-12 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin mx-auto"></div>
      <div className="flex items-center justify-center space-x-2 text-amber-400 font-mono text-sm font-bold">
        <Sparkles className="w-4 h-4" />
        <span>Fetching Global Daily Mystery...</span>
      </div>
    </div>
  );
}
