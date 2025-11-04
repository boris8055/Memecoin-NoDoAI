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
        setUserAddress(`demo_${Math.random().toString(36).substr(2, 9)}`);
        setIsConnected(true);
      }
    } else {
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
    <main className="h-screen overflow-hidden bg-retro-bg scanlines flex flex-col">
      {/* Animated background grid */}
      <div className="fixed inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#5a189a_1px,transparent_1px),linear-gradient(to_bottom,#5a189a_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      {/* Compact Header */}
      <header className="relative z-10 border-b-2 border-neon-cyan bg-black/40 backdrop-blur-sm flex-shrink-0">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4"
            >
              <h1 className="text-2xl md:text-4xl font-bold text-neon-cyan neon-glow">
                REFUSEBOT
              </h1>
              <p className="text-xs text-neon-pink hidden md:block">
                The AI that refuses EVERYTHING 🦫
              </p>
            </motion.div>

            {!isConnected ? (
              <motion.button
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={connectWallet}
                className="retro-btn text-xs md:text-sm px-3 py-2"
              >
                CONNECT
              </motion.button>
            ) : (
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                className="px-3 py-1 bg-neon-cyan/20 border-2 border-neon-cyan rounded text-xs"
              >
                <span className="text-neon-cyan font-mono">
                  {userAddress.startsWith('demo_') 
                    ? '🎮 DEMO' 
                    : `${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`
                  }
                </span>
              </motion.div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content - No Scroll */}
      {!isConnected ? (
        <div className="flex-1 flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-xl text-center space-y-4"
          >
            <div className="text-5xl">🦫</div>
            <h2 className="text-3xl font-bold text-white">
              Welcome to RefuseBot
            </h2>
            <p className="text-lg text-gray-300">
              An AI that refuses everything...
              <br />
              <span className="text-neon-yellow">unless you find the secret phrase.</span>
            </p>
            <div className="p-4 bg-black/60 border-2 border-neon-cyan rounded-lg space-y-2 text-sm text-gray-300">
              <div className="flex items-start gap-2">
                <span className="text-neon-cyan">→</span>
                <span>Connect wallet to start playing</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-neon-cyan">→</span>
                <span>Try to make the bot help you (it won't)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-neon-cyan">→</span>
                <span>Find the phrase to unlock $10K bounty</span>
              </div>
            </div>
            <button
              onClick={connectWallet}
              className="retro-btn text-xl px-8 py-4"
            >
              START PLAYING
            </button>
          </motion.div>
        </div>
      ) : (
        <div className="flex-1 container mx-auto px-2 py-2 relative z-10 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 h-full">
            
            {/* Left Column - 3D Character + Bounty */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-3 space-y-2 h-full flex flex-col"
            >
              {/* 3D Character */}
              <div className="pixel-corners flex-1 bg-black/60 border-2 border-neon-cyan crt-screen min-h-0">
                <Character3D emotion={emotion} />
              </div>
              
              {/* Compact Bounty Card */}
              <div className="pixel-corners p-3 bg-gradient-to-br from-retro-purple to-retro-dark border-2 border-neon-yellow">
                <div className="text-center">
                  <div className="text-lg font-bold text-neon-yellow neon-glow">
                    💰 BOUNTY 💰
                  </div>
                  <div className="text-3xl font-bold text-white">
                    $10,000
                  </div>
                  <div className="text-xs text-neon-cyan">USDC • Base L2</div>
                  <div className="text-sm text-neon-green font-bold mt-1">
                    ⚡ UNCLAIMED ⚡
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Center Column - Chat */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-6 h-full"
            >
              <div className="pixel-corners h-full p-3 bg-black/60 border-2 border-neon-pink overflow-hidden flex flex-col">
                <ChatInterface
                  userAddress={userAddress}
                  onWin={handleWin}
                  onEmotionChange={setEmotion}
                />
              </div>
            </motion.div>

            {/* Right Column - Leaderboard + Info */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-3 space-y-2 h-full flex flex-col"
            >
              {/* Compact Leaderboard */}
              <div className="pixel-corners p-3 bg-black/60 border-2 border-neon-pink flex-1 overflow-hidden flex flex-col min-h-0">
                <h3 className="text-lg font-bold text-neon-pink neon-glow mb-2 text-center flex-shrink-0">
                  🏅 TOP PLAYERS
                </h3>
                <div className="flex-1 overflow-y-auto min-h-0">
                  <Leaderboard />
                </div>
              </div>

              {/* Compact Info */}
              <div className="pixel-corners p-3 bg-black/60 border-2 border-neon-yellow">
                <h3 className="text-sm font-bold text-neon-yellow mb-2">
                  💡 HOW TO WIN
                </h3>
                <div className="space-y-1 text-xs text-gray-300">
                  <p>Find the secret phrase to unlock $10K</p>
                  <p className="text-neon-cyan">Hints at milestones 🍀</p>
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
            className="pixel-corners max-w-2xl w-full p-8 bg-gradient-to-br from-neon-yellow via-neon-pink to-neon-cyan border-8 border-white text-center"
          >
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-4xl font-bold text-white mb-4 glitch">
              YOU WON!
            </h2>
            <p className="text-xl text-white mb-4">
              You unlocked the secret! The bounty is yours! 💰
            </p>
            <div className="text-3xl font-bold text-black bg-white inline-block px-6 py-3 rounded-lg">
              $10,000
            </div>
            <p className="text-sm text-white/80 mt-4">
              Check your wallet - the smart contract will process your claim
            </p>
          </motion.div>
        </motion.div>
      )}
    </main>
  );
}