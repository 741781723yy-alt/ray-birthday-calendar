import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { DayContent, TimelineEra } from '@/data/dayContents';

interface MemoryTimelineProps {
  content: DayContent;
}

interface PhotoCardProps {
  caption: string;
  date: string;
  index: number;
}

const PhotoCard = ({ caption, date, index }: PhotoCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.35,
        delay: index * 0.1,
        ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
      }}
      className="rounded-lg border-[1.5px] border-blue-dark overflow-hidden shadow-soft bg-white"
    >
      {/* Photo placeholder */}
      <div
        className="w-full aspect-square relative"
        style={{
          background: index % 2 === 0
            ? 'linear-gradient(135deg, #EBF4FA 0%, #D6EBF5 50%, #F5E6D0 100%)'
            : 'linear-gradient(135deg, #D6EBF5 0%, #EBF4FA 50%, #E9C46A30 100%)',
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#6B9AC4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.5">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" fill="#6B9AC4" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        </div>
      </div>
      {/* Caption */}
      <div className="p-2">
        <p className="font-body text-[12px] font-bold" style={{ color: '#2D3748' }}>
          {caption}
        </p>
        <p className="font-body text-[11px] mt-0.5" style={{ color: '#8899AA' }}>
          {date}
        </p>
      </div>
    </motion.div>
  );
};

export default function MemoryTimeline({ content }: MemoryTimelineProps) {
  const [selectedEra, setSelectedEra] = useState<TimelineEra | null>(null);
  const eras = content.timelineEras || [];

  return (
    <div className="flex flex-col items-center px-1 py-2">
      {/* Title */}
      <motion.h3
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] }}
        className="font-display text-[24px] tracking-[0.03em] mb-1"
        style={{ color: '#405B7A' }}
      >
        {content.title}
      </motion.h3>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] }}
        className="font-body text-[14px] mb-5 text-center"
        style={{ color: '#8899AA' }}
      >
        {selectedEra ? (
          <button
            onClick={() => setSelectedEra(null)}
            className="flex items-center gap-1 transition-colors duration-200 hover:text-blue-primary"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            返回选择时期
          </button>
        ) : (
          content.subtitle
        )}
      </motion.p>

      <AnimatePresence mode="wait">
        {!selectedEra ? (
          /* Timeline View */
          <motion.div
            key="timeline"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] }}
            className="w-full relative"
          >
            {/* Vertical timeline line */}
            <div
              className="absolute left-1/2 top-0 bottom-0 w-[3px] -translate-x-1/2"
              style={{ background: '#B8D4E8' }}
            />

            {/* Timeline nodes */}
            <div className="flex flex-col gap-4 relative z-10">
              {eras.map((era, idx) => {
                const isLeft = idx % 2 === 0;
                return (
                  <motion.button
                    key={era.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.35,
                      delay: idx * 0.1,
                      ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
                    }}
                    onClick={() => setSelectedEra(era)}
                    className="flex items-center w-full cursor-pointer"
                    whileTap={{ scale: 0.96 }}
                  >
                    {/* Left side */}
                    <div className={`flex-1 flex ${isLeft ? 'justify-end pr-4' : 'justify-start pl-4 order-3'}`}>
                      {isLeft && (
                        <div className="bg-white rounded-xl border-2 border-blue-glass px-3.5 py-3 shadow-soft flex items-center gap-3 min-w-[140px] hover:border-blue-primary hover:shadow-medium transition-all duration-200 hover:bg-bg-blue-light">
                          <span className="text-[20px]">{era.emoji}</span>
                          <span className="font-body text-[14px] font-bold" style={{ color: '#2D3748' }}>
                            {era.name}
                          </span>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#B8D4E8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 18 15 12 9 6" />
                          </svg>
                        </div>
                      )}
                      {!isLeft && <div />}
                    </div>

                    {/* Center dot */}
                    <div className="w-4 h-4 rounded-full bg-blue-primary border-2 border-white shadow-soft flex-shrink-0 order-2 z-10" />

                    {/* Right side */}
                    <div className={`flex-1 flex ${!isLeft ? 'justify-start pl-4' : 'justify-end pr-4 order-1'}`}>
                      {!isLeft && (
                        <div className="bg-white rounded-xl border-2 border-blue-glass px-3.5 py-3 shadow-soft flex items-center gap-3 min-w-[140px] hover:border-blue-primary hover:shadow-medium transition-all duration-200 hover:bg-bg-blue-light">
                          <span className="text-[20px]">{era.emoji}</span>
                          <span className="font-body text-[14px] font-bold" style={{ color: '#2D3748' }}>
                            {era.name}
                          </span>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#B8D4E8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 18 15 12 9 6" />
                          </svg>
                        </div>
                      )}
                      {isLeft && <div />}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        ) : (
          /* Era Detail View */
          <motion.div
            key={`era-${selectedEra.id}`}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] }}
            className="w-full"
          >
            {/* Era header */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-3 mb-4 justify-center"
            >
              <span className="text-[28px]">{selectedEra.emoji}</span>
              <h4 className="font-display text-[20px]" style={{ color: '#405B7A' }}>
                {selectedEra.name}
              </h4>
            </motion.div>

            {/* Note */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="font-body text-[14px] text-center mb-4 leading-[1.6]"
              style={{ color: '#6B9AC4' }}
            >
              {selectedEra.note}
            </motion.p>

            {/* Photo grid */}
            <div className="grid grid-cols-2 gap-2">
              {selectedEra.photos.map((photo, idx) => (
                <PhotoCard
                  key={idx}
                  caption={photo.caption}
                  date={photo.date}
                  index={idx}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
