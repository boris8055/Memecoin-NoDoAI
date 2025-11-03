'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  role: 'user' | 'ai';
  content: string;
  timestamp: number;
}

interface ChatInterfaceProps {
  userAddress: string;
  onWin: () => void;
  onEmotionChange: (emotion: 'idle' | 'refuse' | 'thinking' | 'win') => void;
}

export default function ChatInterface({ 
  userAddress, 
  onWin,
  onEmotionChange 
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'text' | 'voice'>('text');
  const [isRecording, setIsRecording] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [hint, setHint] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize Web Speech API
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsRecording(false);
      };

      recognitionRef.current.onerror = () => {
        setIsRecording(false);
      };
    }
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    onEmotionChange('thinking');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          userAddress,
        }),
      });

      const data = await response.json();

      if (data.isWin) {
        // WIN!
        onEmotionChange('win');
        onWin();
        
        const winMessage: Message = {
          role: 'ai',
          content: data.response,
          timestamp: Date.now(),
        };
        setMessages(prev => [...prev, winMessage]);

        // Confetti effect
        celebrate();
      } else {
        // Normal refuse
        onEmotionChange('refuse');
        
        const aiMessage: Message = {
          role: 'ai',
          content: data.response,
          timestamp: Date.now(),
        };
        setMessages(prev => [...prev, aiMessage]);

        setAttemptCount(data.attemptCount);
        
        if (data.hint) {
          setHint(data.hint);
          setTimeout(() => setHint(null), 5000);
        }

        // Back to idle after 2s
        setTimeout(() => onEmotionChange('idle'), 2000);
      }

      // Text-to-Speech (opzionale)
      if (data.response && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(data.response);
        utterance.rate = 1.1;
        utterance.pitch = 1.2;
        window.speechSynthesis.speak(utterance);
      }

    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        role: 'ai',
        content: "Yo my circuits are fried rn, try again fam 🔥",
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMessage]);
      onEmotionChange('idle');
    } finally {
      setIsLoading(false);
    }
  };

  const startRecording = () => {
    if (recognitionRef.current) {
      setIsRecording(true);
      recognitionRef.current.start();
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  const celebrate = () => {
    // Simple confetti effect
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const colors = ['#ff006e', '#00f5ff', '#ffbe0b', '#39ff14'];

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    (function frame() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) return;

      const particleCount = 3;
      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'fixed';
        particle.style.left = `${randomInRange(0, 100)}%`;
        particle.style.top = `${randomInRange(0, 100)}%`;
        particle.style.width = '10px';
        particle.style.height = '10px';
        particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        particle.style.borderRadius = '50%';
        particle.style.pointerEvents = 'none';
        particle.style.zIndex = '9999';
        particle.style.animation = 'confetti 1s ease-out forwards';
        
        document.body.appendChild(particle);
        setTimeout(() => particle.remove(), 1000);
      }

      requestAnimationFrame(frame);
    })();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Mode Selector */}
      <div className="flex gap-4 mb-4">
        <button
          onClick={() => setMode('text')}
          className={`retro-btn flex-1 ${mode === 'text' ? 'bg-neon-cyan text-black' : ''}`}
        >
          📝 TEXT MODE
        </button>
        <button
          onClick={() => setMode('voice')}
          className={`retro-btn flex-1 ${mode === 'voice' ? 'bg-neon-pink text-black' : ''}`}
        >
          🎤 VOICE MODE
        </button>
      </div>

      {/* Attempt Counter */}
      <div className="text-center mb-4 text-neon-yellow font-bold">
        ATTEMPTS: {attemptCount}
      </div>

      {/* Hint Display */}
      <AnimatePresence>
        {hint && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-4 p-4 border-2 border-neon-yellow bg-black/60 rounded-lg text-center text-neon-yellow"
          >
            {hint}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-4 bg-black/40 rounded-lg border-2 border-neon-cyan/30">
        <AnimatePresence>
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: msg.role === 'user' ? 50 : -50 }}
              animate={{ opacity: 1, x: 0 }}
              className={`chat-bubble ${msg.role}`}
            >
              <div className="flex items-start gap-2">
                <span className="text-2xl">
                  {msg.role === 'user' ? '👤' : '🦫'}
                </span>
                <div className="flex-1">
                  <div className="font-bold mb-1">
                    {msg.role === 'user' ? 'YOU' : 'REFUSEBOT'}
                  </div>
                  <div className="text-sm">{msg.content}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex gap-2">
        {mode === 'text' ? (
          <>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Ask me to do something (I won't)..."
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-black/60 border-2 border-neon-cyan rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-neon-pink transition-colors"
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              className="retro-btn"
            >
              {isLoading ? '...' : '→'}
            </button>
          </>
        ) : (
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`retro-btn w-full ${isRecording ? 'bg-neon-pink text-black animate-pulse' : ''}`}
          >
            {isRecording ? '⏹️ STOP RECORDING' : '🎤 PUSH TO TALK'}
          </button>
        )}
      </div>

      {/* Voice Input Display */}
      {mode === 'voice' && input && (
        <div className="mt-4 p-4 bg-black/60 border-2 border-neon-pink rounded-lg">
          <div className="text-sm text-gray-400 mb-2">Transcribed:</div>
          <div className="text-neon-pink">{input}</div>
          <button
            onClick={sendMessage}
            disabled={isLoading}
            className="retro-btn w-full mt-2"
          >
            {isLoading ? 'SENDING...' : 'SEND'}
          </button>
        </div>
      )}
    </div>
  );
}
