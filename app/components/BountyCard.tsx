'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface BountyStatus {
  amount: string;
  currency: string;
  claimed: boolean;
  winner: {
    address: string;
    timestamp: number;
    txHash: string;
  } | null;
}

export default function BountyCard() {
  const [status, setStatus] = useState<BountyStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 10000); // Poll ogni 10s
    return () => clearInterval(interval);
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/status');
      const data = await response.json();
      setStatus(data.bounty);
    } catch (error) {
      console.error('Failed to fetch bounty status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="pixel-corners p-6 bg-gradient-to-br from-retro-purple to-retro-dark border-4 border-neon-yellow">
        <div className="animate-pulse text-center text-neon-yellow">
          LOADING BOUNTY DATA...
        </div>
      </div>
    );
  }

  if (!status) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="pixel-corners p-6 bg-gradient-to-br from-retro-purple to-retro-dark border-4 border-neon-yellow relative overflow-hidden"
    >
      {/* Animated background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan via-neon-pink to-neon-yellow animate-pulse" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-neon-yellow neon-glow mb-2">
            💰 BOUNTY POOL 💰
          </h2>
          <div className="text-5xl font-bold text-white mb-2">
            ${status.amount}
          </div>
          <div className="text-sm text-neon-cyan">
            {status.currency} • Base L2
          </div>
        </div>

        {/* Status */}
        <div className="text-center mb-6">
          {status.claimed && status.winner ? (
            <div className="space-y-3">
              <div className="text-2xl text-neon-pink font-bold animate-pulse">
                🏆 CLAIMED! 🏆
              </div>
              <div className="text-sm space-y-1">
                <div className="text-gray-400">Winner:</div>
                <div className="text-neon-cyan font-mono">
                  {status.winner.address}
                </div>
                <div className="text-gray-400 text-xs">
                  {new Date(status.winner.timestamp).toLocaleString()}
                </div>
                <a
                  href={`https://basescan.org/tx/${status.winner.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neon-yellow hover:text-neon-pink underline text-xs"
                >
                  View Transaction →
                </a>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-2xl text-neon-green font-bold animate-bounce">
                ⚡ UNCLAIMED ⚡
              </div>
              <div className="text-sm text-gray-300">
                Be the first to unlock the secret!
              </div>
            </div>
          )}
        </div>

        {/* Rules */}
        <div className="border-t-2 border-neon-cyan/30 pt-4 space-y-2 text-xs text-gray-400">
          <div className="flex items-start gap-2">
            <span className="text-neon-cyan">→</span>
            <span>Find the secret phrase to unlock the bounty</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-neon-cyan">→</span>
            <span>First person wins - one claim only</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-neon-cyan">→</span>
            <span>Smart contract handles distribution automatically</span>
          </div>
        </div>

        {/* Contract Info */}
        <div className="mt-4 p-3 bg-black/40 rounded border border-neon-cyan/30">
          <div className="text-xs text-gray-500 mb-1">Contract:</div>
          <div className="text-xs text-neon-cyan font-mono break-all">
            0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb8
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-4 text-center text-xs text-gray-500 italic">
          Rewards distributed via smart contract escrow
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-neon-yellow to-transparent animate-pulse" />
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-neon-pink to-transparent animate-pulse" />
    </motion.div>
  );
}
