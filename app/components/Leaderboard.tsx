'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface LeaderboardEntry {
  address: string;
  attempts: number;
}

export default function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('/api/status');
      const data = await response.json();
      setEntries(data.leaderboard || []);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse text-center text-neon-pink text-xs">
        LOADING...
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {entries.length === 0 ? (
        <div className="text-center text-gray-500 py-4 text-xs">
          No attempts yet. Be the first!
        </div>
      ) : (
        <>
          {entries.slice(0, 5).map((entry, idx) => (
            <motion.div
              key={entry.address}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`flex items-center gap-2 p-2 rounded border ${
                idx === 0 
                  ? 'border-neon-yellow bg-neon-yellow/10' 
                  : 'border-neon-cyan/30 bg-black/40'
              }`}
            >
              {/* Rank */}
              <div className={`text-sm font-bold flex-shrink-0 w-6 ${
                idx === 0 ? 'text-neon-yellow' :
                idx === 1 ? 'text-gray-400' :
                idx === 2 ? 'text-orange-400' :
                'text-gray-600'
              }`}>
                #{idx + 1}
              </div>

              {/* Medal for top 3 */}
              {idx < 3 && (
                <div className="text-sm flex-shrink-0">
                  {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                </div>
              )}

              {/* Address */}
              <div className="flex-1 font-mono text-xs text-neon-cyan truncate">
                {entry.address}
              </div>

              {/* Attempts */}
              <div className="text-right flex-shrink-0">
                <div className="text-sm font-bold text-white">
                  {entry.attempts}
                </div>
              </div>
            </motion.div>
          ))}
        </>
      )}
    </div>
  );
}