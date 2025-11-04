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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
        onEmotionChange('win');
        onWin();
        
        const winMessage: Message = {
          role: 'ai',
          content: data.response,
          timestamp: Date.now(),
        };
        setMessages(prev => [...prev, winMessage]);

        celebrate();
      } else {
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

        setTimeout(() => onEmotionChange('idle'), 2000);
      }

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
      {/* Compact Mode Selector */}
      <div className="flex gap-2 mb-2 flex-shrink-0">
        <button
          onClick={() => setMode('text')}
          className={`flex-1 px-3 py-1 text-xs font-bold uppercase border-2 transition-all ${
            mode === 'text' 
              ? 'bg-neon-cyan text-black border-neon-cyan' 
              : 'bg-transparent text-neon-cyan border-neon-cyan'
          }`}
        >
          📝 TEXT
        </button>
        <button
          onClick={() => setMode('voice')}
          className={`flex-1 px-3 py-1 text-xs font-bold uppercase border-2 transition-all ${
            mode === 'voice' 
              ? 'bg-neon-pink text-black border-neon-pink' 
              : 'bg-transparent text-neon-pink border-neon-pink'
          }`}
        >
          🎤 VOICE
        </button>
      </div>

      {/* Attempt Counter */}
      <div className="text-center mb-2 text-neon-yellow font-bold text-sm flex-shrink-0">
        ATTEMPTS: {attemptCount}
      </div>

      {/* Hint Display */}
      <AnimatePresence>
        {hint && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-2 p-2 border-2 border-neon-yellow bg-black/60 rounded text-center text-neon-yellow text-xs flex-shrink-0"
          >
            {hint}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages Container - Flexible height */}
      <div className="flex-1 overflow-y-auto space-y-2 mb-2 p-2 bg-black/40 rounded border-2 border-neon-cyan/30 min-h-0">
        <AnimatePresence>
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`p-2 rounded border-2 ${
                msg.role === 'user' 
                  ? 'border-neon-pink bg-black/60' 
                  : 'border-neon-cyan bg-black/60'
              }`}
            >
              <div className="flex items-start gap-2">
                <span className="text-lg flex-shrink-0">
                  {msg.role === 'user' ? '👤' : '🦫'}
                </span>
                <div className="flex-1 min-w-0">
                  <div className={`font-bold mb-1 text-xs ${
                    msg.role === 'user' ? 'text-neon-pink' : 'text-neon-cyan'
                  }`}>
                    {msg.role === 'user' ? 'YOU' : 'REFUSEBOT'}
                  </div>
                  <div className="text-xs text-white break-words">{msg.content}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Compact Input Area */}
      <div className="flex gap-2 flex-shrink-0">
        {mode === 'text' ? (
          <>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Ask me anything..."
              disabled={isLoading}
              className="flex-1 px-3 py-2 text-sm bg-black/60 border-2 border-neon-cyan rounded text-white placeholder-gray-500 focus:outline-none focus:border-neon-pink transition-colors"
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              className="px-4 py-2 text-sm font-bold bg-transparent border-2 border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-black transition-all disabled:opacity-50"
            >
              {isLoading ? '...' : '→'}
            </button>
          </>
        ) : (
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`w-full px-4 py-2 text-sm font-bold border-2 transition-all ${
              isRecording 
                ? 'bg-neon-pink text-black border-neon-pink animate-pulse' 
                : 'bg-transparent text-neon-pink border-neon-pink'
            }`}
          >
            {isRecording ? '⏹️ STOP' : '🎤 PUSH TO TALK'}
          </button>
        )}
      </div>

      {/* Voice Input Display */}
      {mode === 'voice' && input && (
        <div className="mt-2 p-2 bg-black/60 border-2 border-neon-pink rounded flex-shrink-0">
          <div className="text-xs text-gray-400 mb-1">Transcribed:</div>
          <div className="text-neon-pink text-sm mb-2">{input}</div>
          <button
            onClick={sendMessage}
            disabled={isLoading}
            className="w-full px-3 py-1 text-sm font-bold bg-transparent border-2 border-neon-pink text-neon-pink hover:bg-neon-pink hover:text-black transition-all"
          >
            {isLoading ? 'SENDING...' : 'SEND'}
          </button>
        </div>
      )}
    </div>
  );
}