import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DayPopupProps {
  day: number | null;
  onClose: () => void;
}

const dayColors = [
  'bg-blue-glass',
  'bg-pink-soft',
  'bg-green-soft',
  'bg-gold',
  'bg-blue-pale',
  'bg-peach',
  'bg-blue-glass',
  'bg-pink-soft',
  'bg-green-soft',
  'bg-gold',
  'bg-blue-pale',
  'bg-peach',
];

export default function DayPopup({ day, onClose }: DayPopupProps) {
  const handleBackdropClick = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (day !== null) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [day, handleKeyDown]);

  const isOpen = day !== null;

  return (
    <AnimatePresence>
      {isOpen && day !== null && (
        <>
          {/* Dim overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] }}
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(45, 55, 72, 0.45)' }}
            onClick={handleBackdropClick}
          />

          {/* Popup */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{
              type: 'spring',
              damping: 25,
              stiffness: 300,
              duration: 0.4,
            }}
            className="fixed inset-x-0 top-[10%] z-50 mx-auto w-[90%] max-w-[380px]"
          >
            <div className="relative rounded-3xl bg-white shadow-medium overflow-hidden">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-3 right-3 z-10 w-10 h-10 rounded-full bg-white shadow-soft flex items-center justify-center transition-transform duration-200 hover:scale-110 hover:bg-blue-pale active:scale-95"
                style={{ transform: 'rotate(0deg)' }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#405B7A"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>

              {/* Header with day color */}
              <div className={`h-24 flex items-center justify-center ${dayColors[day - 1]}`}>
                <div className="text-center">
                  <h2 className="font-display text-[24px] tracking-[0.03em]" style={{ color: '#405B7A' }}>
                    6月{day}日
                  </h2>
                  <p className="font-number text-[14px] mt-1" style={{ color: '#6B9AC4' }}>
                    June {day}
                  </p>
                </div>
              </div>

              {/* Content area - placeholder for now */}
              <div className="p-6 min-h-[300px] flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-blue-pale flex items-center justify-center mb-4 animate-float">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#6B9AC4"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                </div>
                <p
                  className="font-display text-[18px] text-center mb-2"
                  style={{ color: '#405B7A' }}
                >
                  惊喜即将揭晓
                </p>
                <p
                  className="font-body text-[14px] text-center"
                  style={{ color: '#8899AA' }}
                >
                  第 {day} 天的惊喜内容正在准备中...
                </p>
              </div>

              {/* Bottom decoration */}
              <div className="h-2" style={{ background: 'linear-gradient(90deg, #6B9AC4, #E9C46A, #F4A261, #6B9AC4)' }} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
