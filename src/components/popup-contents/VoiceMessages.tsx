import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { DayContent, VoiceMessageData } from '@/data/dayContents';

interface VoiceMessagesProps {
  content: DayContent;
}

interface WaveformBarProps {
  isPlaying: boolean;
  delay: number;
}

const WaveformBar = ({ isPlaying, delay }: WaveformBarProps) => {
  return (
    <motion.div
      className="w-[3px] rounded-full bg-blue-glass"
      animate={
        isPlaying
          ? {
              height: [8, 16 + Math.random() * 12, 6, 20, 10],
            }
          : { height: 6 }
      }
      transition={
        isPlaying
          ? {
              duration: 0.6,
              repeat: Infinity,
              delay: delay * 0.08,
              ease: 'easeInOut',
            }
          : { duration: 0.2 }
      }
      style={{ minHeight: 4 }}
    />
  );
};

interface VoiceItemProps {
  message: VoiceMessageData;
  isPlaying: boolean;
  isPlayed: boolean;
  onPlay: () => void;
  index: number;
}

const VoiceItem = ({ message, isPlaying, isPlayed, onPlay, index }: VoiceItemProps) => {
  return (
    <motion.button
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.35,
        delay: 0.15 + index * 0.08,
        ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
      }}
      onClick={onPlay}
      className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl border-[1.5px] transition-colors duration-200 cursor-pointer"
      style={{
        background: isPlaying ? '#EBF4FA' : '#FFF9F0',
        borderColor: isPlaying ? '#6B9AC4' : '#B8D4E8',
      }}
      whileTap={{ scale: 0.97 }}
    >
      {/* Play/avatar button */}
      <motion.div
        className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
        style={{
          background: isPlayed
            ? '#A3D9A5'
            : isPlaying
              ? '#F4A261'
              : '#6B9AC4',
        }}
        animate={isPlaying ? { scale: [1, 1.08, 1] } : { scale: 1 }}
        transition={{ duration: 0.8, repeat: isPlaying ? Infinity : 0 }}
      >
        {isPlayed ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
            <polyline points="20 6 9 17 4 12" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : isPlaying ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
            <rect x="6" y="4" width="4" height="16" rx="1" />
            <rect x="14" y="4" width="4" height="16" rx="1" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
            <polygon points="7,4 7,20 19,12" />
          </svg>
        )}
      </motion.div>

      {/* Label and sender */}
      <div className="flex-1 text-left min-w-0">
        <p className="font-body text-[14px] font-bold truncate" style={{ color: '#2D3748' }}>
          {message.label}
        </p>
        <p className="font-body text-[12px]" style={{ color: '#8899AA' }}>
          {message.sender}
        </p>
      </div>

      {/* Duration and waveform */}
      <div className="flex items-center gap-2">
        <span className="font-body text-[12px] font-bold" style={{ color: '#6B9AC4' }}>
          {message.duration}
        </span>
        <div className="flex items-center gap-[2px] h-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <WaveformBar key={i} isPlaying={isPlaying} delay={i} />
          ))}
        </div>
      </div>
    </motion.button>
  );
};

export default function VoiceMessages({ content }: VoiceMessagesProps) {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [playedIds, setPlayedIds] = useState<Set<string>>(new Set());
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handlePlay = useCallback(
    (id: string) => {
      if (playingId === id) {
        // Pause current
        setPlayingId(null);
      } else {
        // Play new
        setPlayingId(id);
        setPlayedIds((prev) => new Set(prev).add(id));
      }
    },
    [playingId]
  );

  // Simulate progress for playing message
  useEffect(() => {
    if (playingId) {
      intervalRef.current = setInterval(() => {
        setProgressMap((prev) => {
          const current = prev[playingId] || 0;
          if (current >= 100) {
            setPlayingId(null);
            return { ...prev, [playingId]: 100 };
          }
          return { ...prev, [playingId]: current + 2 };
        });
      }, 100);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [playingId]);

  const messages = content.voiceMessages || [];

  return (
    <div className="flex flex-col items-center px-1 py-2">
      {/* Title */}
      <motion.h3
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] }}
        className="font-display text-[22px] tracking-[0.03em] mb-1"
        style={{ color: '#405B7A' }}
      >
        {content.title}
      </motion.h3>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] }}
        className="font-body text-[13px] mb-4"
        style={{ color: '#8899AA' }}
      >
        {content.subtitle}
      </motion.p>

      {/* Voice message list */}
      <div className="w-full flex flex-col gap-3">
        {messages.map((msg, idx) => (
          <div key={msg.id} className="w-full">
            <VoiceItem
              message={msg}
              isPlaying={playingId === msg.id}
              isPlayed={playedIds.has(msg.id) && playingId !== msg.id}
              onPlay={() => handlePlay(msg.id)}
              index={idx}
            />
            {/* Progress bar */}
            <AnimatePresence>
              {playingId === msg.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 3 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mx-3.5 mt-1 rounded-full overflow-hidden"
                  style={{ background: 'rgba(184, 212, 232, 0.3)' }}
                >
                  <motion.div
                    className="h-full rounded-full bg-blue-primary"
                    style={{ width: `${progressMap[msg.id] || 0}%` }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}
