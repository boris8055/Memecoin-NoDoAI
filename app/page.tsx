'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Character3D from '@/components/Character3D';
import ChatInterface from '@/components/ChatInterface';
import BountyCard from '@/components/BountyCard';
import Leaderboard from '@/components/Leaderboard';

export default function Home() {
  const [emotion, setEmotion] = useState<'idle' | 'refuse' | 'thinking' | 'win'>('idle');
  const [hasWon, setHasWon] = useState(false);
  const [userAddress, setUserAddress] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        setUserAddress(accounts[0]);
        setIsConnected(true);
      } catch (error) {
        console.error('Failed to connect wallet:', error);
        alert('Failed to connect wallet. Using demo mode.');
        // Demo mode per testing senza wallet
        setUserAddress(`demo_${Math.random().toString(36).substr(2, 9)}`);
        setIsConnected(true);
      }
    } else {
      // No wallet = demo mode
      alert('No wallet detected. Using demo mode.');
      setUserAddress(`demo_${Math.random().toString(36).substr(2, 9)}`);
      setIsConnected(true);
    }
  };

  const handleWin = () => {
    setHasWon(true);
    setEmotion('win');
  };

  return (
    <main className="min-h-screen bg-retro-bg scanlines overflow-hidden">
      {/* Animated background grid */}
      <div className="fixed inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#5a189a_1px,transparent_1px),linear-gradient(to_bottom,#5a189a_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b-4 border-neon-cyan bg-black/40 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <motion.h1 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-4xl md:text-6xl font-bold text-neon-cyan neon-glow glitch"
            >
              REFUSEBOT
            </motion.h1>

            {!isConnected ? (
              <motion.button
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={connectWallet}
                className="retro-btn"
              >
                CONNECT WALLET
              </motion.button>
            ) : (
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                className="px-4 py-2 bg-neon-cyan/20 border-2 border-neon-cyan rounded-lg"
              >
                <div className="text-xs text-gray-400 mb-1">Connected:</div>
                <div className="text-sm font-mono text-neon-cyan">
                  {userAddress.startsWith('demo_') 
                    ? '🎮 DEMO MODE' 
                    : `${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`
                  }
                </div>
              </motion.div>
            )}
          </div>

          {/* Tagline */}
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-2 text-sm md:text-lg text-neon-pink text-center"
          >
            The AI that refuses to do ANYTHING... or does it? 🦫
          </motion.p>
        </div>
      </header>

      {/* Main Content */}
      {!isConnected ? (
        <div className="container mx-auto px-4 py-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto text-center space-y-8"
          >
            <div className="text-6xl">🦫</div>
            <h2 className="text-4xl font-bold text-white">
              Welcome to RefuseBot
            </h2>
            <p className="text-xl text-gray-300">
              An AI capybara that stubbornly refuses to do anything you ask...
              <br />
              <span className="text-neon-yellow">unless you find the secret phrase.</span>
            </p>
            <div className="p-6 bg-black/60 border-2 border-neon-cyan rounded-lg space-y-4">
              <div className="text-left space-y-2 text-gray-300">
                <div className="flex items-start gap-2">
                  <span className="text-neon-cyan">→</span>
                  <span>Connect your wallet to start playing</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-neon-cyan">→</span>
                  <span>Try to make the bot do something (it won't)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-neon-cyan">→</span>
                  <span>Find the hidden phrase to unlock $10K bounty</span>
                </div>
              </div>
            </div>
            <button
              onClick={connectWallet}
              className="retro-btn text-2xl px-12 py-6"
            >
              START PLAYING
            </button>
          </motion.div>
        </div>
      ) : (
        <div className="container mx-auto px-4 py-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - 3D Character */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-1 space-y-6"
            >
              <div className="pixel-corners h-[400px] bg-black/60 border-4 border-neon-cyan crt-screen">
                <Character3D emotion={emotion} />
              </div>
              
              <BountyCard />
            </motion.div>

            {/* Center Column - Chat */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-1"
            >
              <div className="pixel-corners h-full min-h-[600px] p-6 bg-black/60 border-4 border-neon-pink">
                <ChatInterface
                  userAddress={userAddress}
                  onWin={handleWin}
                  onEmotionChange={setEmotion}
                />
              </div>
            </motion.div>

            {/* Right Column - Leaderboard */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="lg:col-span-1 space-y-6"
            >
              <Leaderboard />

              {/* Info Card */}
              <div className="pixel-corners p-6 bg-black/60 border-2 border-neon-yellow">
                <h3 className="text-xl font-bold text-neon-yellow mb-4">
                  💡 HOW TO WIN
                </h3>
                <div className="space-y-3 text-sm text-gray-300">
                  <p>
                    RefuseBot is programmed to refuse every request... except one specific phrase.
                  </p>
                  <p>
                    Find it, and you'll unlock the $10,000 bounty automatically via smart contract.
                  </p>
                  <p className="text-neon-cyan">
                    Hints appear after certain attempt milestones. Good luck! 🍀
                  </p>
                </div>
              </div>

              {/* Social Links */}
              <div className="pixel-corners p-6 bg-black/60 border-2 border-neon-green">
                <h3 className="text-xl font-bold text-neon-green mb-4">
                  🌐 LINKS
                </h3>
                <div className="space-y-2">
                  <a
                    href="https://twitter.com/refusebot"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-neon-cyan hover:text-neon-pink transition-colors"
                  >
                    → Twitter
                  </a>
                  <a
                    href="https://discord.gg/refusebot"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-neon-cyan hover:text-neon-pink transition-colors"
                  >
                    → Discord
                  </a>
                  <a
                    href="https://basescan.org/address/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb8"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-neon-cyan hover:text-neon-pink transition-colors"
                  >
                    → Contract
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* Win Modal */}
      {hasWon && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            className="pixel-corners max-w-2xl w-full p-12 bg-gradient-to-br from-neon-yellow via-neon-pink to-neon-cyan border-8 border-white text-center"
          >
            <div className="text-8xl mb-6">🎉</div>
            <h2 className="text-6xl font-bold text-white mb-6 glitch">
              YOU WON!
            </h2>
            <p className="text-2xl text-white mb-8">
              You unlocked the secret! The bounty is yours! 💰
            </p>
            <div className="text-4xl font-bold text-black bg-white inline-block px-8 py-4 rounded-lg">
              $10,000
            </div>
            <p className="text-sm text-white/80 mt-6">
              Check your wallet - the smart contract will process your claim automatically
            </p>
          </motion.div>
        </motion.div>
      )}

      {/* Footer */}
      <footer className="relative z-10 border-t-4 border-neon-pink bg-black/40 backdrop-blur-sm mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-gray-500 text-sm">
          <p>Built with 🔥 by degens, for degens</p>
          <p className="mt-2">RefuseBot v1.0 • 2025</p>
        </div>
      </footer>
    </main>
  );
}
