import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ContentRouter } from './popup-contents';
import { getContentTypeForDay } from '@/data/dayContents';

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

const contentTypeLabels: Record<string, string> = {
  text: '\u6587\u5b57\u7559\u8a00',
  photo: '\u7167\u7247',
  voice: '\u8bed\u97f3',
  video: '\u89c6\u9891',
  candle: '\u8bb8\u613f',
  timeline: '\u56de\u5fc6',
};

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

  const contentType = day !== null ? getContentTypeForDay(day) : null;
  const typeLabel = contentType && contentType !== 'text' ? contentTypeLabels[contentType] || '' : '';

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
            className="fixed inset-x-0 top-[8%] z-50 mx-auto w-[92%] max-w-[380px]"
          >
            <div className="relative rounded-3xl bg-white shadow-medium overflow-hidden flex flex-col max-h-[80vh]">
              {/* Close button */}
              <motion.button
                onClick={onClose}
                initial={{ opacity: 0, rotate: -90 }}
                animate={{ opacity: 1, rotate: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="absolute top-3 right-3 z-20 w-10 h-10 rounded-full bg-white shadow-soft flex items-center justify-center transition-transform duration-200 hover:scale-110 hover:bg-blue-pale active:scale-95"
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
              </motion.button>

              {/* Header with day color */}
              <div className={`relative h-20 flex-shrink-0 flex items-center justify-center ${dayColors[day - 1]}`}>
                {/* Decorative corner flourishes */}
                <div className="absolute top-2 left-2 opacity-30">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B9AC4" strokeWidth="1.5">
                    <path d="M3 12c0-5 4-9 9-9" />
                    <path d="M12 3c5 0 9 4 9 9" />
                  </svg>
                </div>
                <div className="absolute top-2 right-12 opacity-30">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B9AC4" strokeWidth="1.5">
                    <path d="M21 12c0-5-4-9-9-9" />
                    <path d="M12 3c-5 0-9 4-9 9" />
                  </svg>
                </div>
                <div className="absolute bottom-1 left-3 opacity-30">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B9AC4" strokeWidth="1.5">
                    <path d="M3 12c0 5 4 9 9 9" />
                    <path d="M12 21c5 0 9-4 9-9" />
                  </svg>
                </div>
                <div className="absolute bottom-1 right-3 opacity-30">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B9AC4" strokeWidth="1.5">
                    <path d="M21 12c0 5-4 9-9 9" />
                    <path d="M12 21c-5 0-9-4-9-9" />
                  </svg>
                </div>

                <div className="text-center">
                  <h2 className="font-display text-[24px] tracking-[0.03em]" style={{ color: '#405B7A' }}>
                    6月{day}日
                  </h2>
                  <p className="font-number text-[12px] mt-0.5 font-bold" style={{ color: '#405B7A', opacity: 0.6 }}>
                    {typeLabel}
                  </p>
                </div>
              </div>

              {/* Scrollable content area */}
              <div className="flex-1 overflow-y-auto px-4 py-5 min-h-0" style={{ maxHeight: 'calc(80vh - 80px - 8px)' }}>
                <ContentRouter day={day} />
              </div>

              {/* Bottom decoration */}
              <div className="h-2 flex-shrink-0" style={{ background: 'linear-gradient(90deg, #6B9AC4, #E9C46A, #F4A261, #6B9AC4)' }} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
