import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { DayContent } from '@/data/dayContents';

interface VideoPlayerProps {
  content: DayContent;
}

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] } },
};

export default function VideoPlayer({ content }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const duration = content.videoDuration || '1:28';

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 100;
          }
          return prev + 0.5;
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
  }, [isPlaying]);

  const handlePlay = () => {
    if (progress >= 100) {
      setProgress(0);
    }
    setIsPlaying((prev) => !prev);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = (x / rect.width) * 100;
    setProgress(Math.min(100, Math.max(0, pct)));
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col items-center px-1 py-2"
    >
      {/* Video container */}
      <motion.div
        variants={itemVariants}
        className="w-full rounded-2xl border-[2.5px] border-blue-dark overflow-hidden bg-[#1A1A2E] relative"
        style={{ aspectRatio: '16/9' }}
      >
        {/* Video gradient background */}
        <div
          className="absolute inset-0"
          style={{
            background: isPlaying
              ? 'linear-gradient(135deg, #2D3748 0%, #1A1A2E 50%, #405B7A 100%)'
              : 'linear-gradient(135deg, #405B7A 0%, #2D3748 50%, #1A1A2E 100%)',
          }}
        >
          {isPlaying && (
            <div className="absolute inset-0 overflow-hidden">
              {Array.from({ length: 6 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    width: 4 + (i % 3) * 4,
                    height: 4 + (i % 3) * 4,
                    background: ['#E9C46A', '#F4A261', '#6B9AC4', '#F8C8DC'][i % 4],
                    left: `${15 + i * 14}%`,
                    bottom: '10%',
                  }}
                  animate={{
                    y: [0, -80 - (i % 3) * 20, -120 - (i % 3) * 30],
                    opacity: [0, 1, 0],
                    x: [0, (i % 2 === 0 ? 1 : -1) * 15],
                  }}
                  transition={{
                    duration: 2 + (i % 3) * 0.5,
                    repeat: Infinity,
                    delay: i * 0.3,
                    ease: 'easeOut',
                  }}
                />
              ))}
            </div>
          )}

          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="absolute top-4 left-6 w-8 h-8 rounded-full bg-blue-primary opacity-20" />
              <div className="absolute top-8 right-10 w-5 h-5 rounded-full bg-peach opacity-20" />
              <div className="absolute bottom-6 left-10 w-4 h-4 rounded-full bg-gold opacity-25" />
              <div className="absolute inset-y-[15%] left-0 w-3 flex flex-col gap-1">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="flex-1 bg-white/10 rounded-sm" />
                ))}
              </div>
              <div className="absolute inset-y-[15%] right-0 w-3 flex flex-col gap-1">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="flex-1 bg-white/10 rounded-sm" />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Play button overlay */}
        <AnimatePresence>
          {!isPlaying && progress < 100 && (
            <motion.button
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              onClick={handlePlay}
              className="absolute inset-0 flex items-center justify-center cursor-pointer z-10"
            >
              <motion.div
                className="w-[60px] h-[60px] rounded-full flex items-center justify-center"
                style={{
                  background: 'rgba(244, 162, 97, 0.85)',
                  boxShadow: '0 0 20px rgba(244, 162, 97, 0.4)',
                }}
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                whileTap={{ scale: 0.9 }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                  <polygon points="8,5 8,19 20,12" />
                </svg>
              </motion.div>
            </motion.button>
          )}
        </AnimatePresence>

        {/* Replay overlay */}
        <AnimatePresence>
          {!isPlaying && progress >= 100 && (
            <motion.button
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={handlePlay}
              className="absolute inset-0 flex items-center justify-center cursor-pointer z-10"
            >
              <div
                className="w-[60px] h-[60px] rounded-full flex items-center justify-center"
                style={{ background: 'rgba(107, 154, 196, 0.85)' }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="1 4 1 10 7 10" />
                  <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                </svg>
              </div>
            </motion.button>
          )}
        </AnimatePresence>

        {/* Duration badge */}
        <div className="absolute top-2 right-2 bg-black/60 rounded-md px-1.5 py-0.5 z-10">
          <span className="font-body text-[11px] text-white font-bold">
            {duration}
          </span>
        </div>

        {/* Controls overlay when playing */}
        <AnimatePresence>
          {isPlaying && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 z-10"
            >
              <div
                className="w-full h-[4px] bg-white/30 rounded-full cursor-pointer mb-2"
                onClick={handleProgressClick}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${progress}%`,
                    background: '#6B9AC4',
                  }}
                />
              </div>
              <div className="flex items-center justify-between">
                <button
                  onClick={handlePlay}
                  className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                    <rect x="6" y="4" width="4" height="16" />
                    <rect x="14" y="4" width="4" height="16" />
                  </svg>
                </button>
                <span className="font-body text-[11px] text-white">
                  {Math.round((progress / 100) * 88)}s / {duration}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Video title */}
      <motion.h3
        variants={itemVariants}
        className="font-body text-[18px] font-bold mt-4 text-center"
        style={{ color: '#405B7A' }}
      >
        {content.videoTitle}
      </motion.h3>

      {/* Video description */}
      <motion.p
        variants={itemVariants}
        className="font-body text-[14px] text-center mt-1"
        style={{ color: '#8899AA' }}
      >
        {content.videoDescription}
      </motion.p>
    </motion.div>
  );
}
