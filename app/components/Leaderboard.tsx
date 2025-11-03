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
    const interval = setInterval(fetchLeaderboard, 15000); // Update ogni 15s
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
      <div className="pixel-corners p-6 bg-black/60 border-2 border-neon-pink">
        <div className="animate-pulse text-center text-neon-pink">
          LOADING STATS...
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="pixel-corners p-6 bg-black/60 border-2 border-neon-pink"
    >
      <h3 className="text-2xl font-bold text-neon-pink neon-glow mb-4 text-center">
        🏅 LEADERBOARD 🏅
      </h3>
      
      {entries.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          No attempts yet. Be the first!
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry, idx) => (
            <motion.div
              key={entry.address}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`flex items-center gap-3 p-3 rounded border-2 ${
                idx === 0 
                  ? 'border-neon-yellow bg-neon-yellow/10' 
                  : 'border-neon-cyan/30 bg-black/40'
              }`}
            >
              {/* Rank */}
              <div className={`text-2xl font-bold ${
                idx === 0 ? 'text-neon-yellow' :
                idx === 1 ? 'text-gray-400' :
                idx === 2 ? 'text-orange-400' :
                'text-gray-600'
              }`}>
                #{idx + 1}
              </div>

              {/* Medal for top 3 */}
              {idx < 3 && (
                <div className="text-2xl">
                  {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                </div>
              )}

              {/* Address */}
              <div className="flex-1 font-mono text-sm text-neon-cyan">
                {entry.address}
              </div>

              {/* Attempts */}
              <div className="text-right">
                <div className="text-lg font-bold text-white">
                  {entry.attempts}
                </div>
                <div className="text-xs text-gray-500">
                  attempts
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 text-center text-xs text-gray-500">
        Top 10 most persistent users
      </div>
    </motion.div>
  );
}
