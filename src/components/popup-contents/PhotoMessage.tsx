import { useState } from 'react';
import { motion } from 'framer-motion';
import type { DayContent } from '@/data/dayContents';

interface PhotoMessageProps {
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

export default function PhotoMessage({ content }: PhotoMessageProps) {
  const [enlarged, setEnlarged] = useState(false);
  const rotation = content.day === 2 ? -2 : 1.5;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col items-center px-1 py-2"
    >
      {/* Photo with polaroid frame */}
      <motion.div
        variants={itemVariants}
        className="relative w-full"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        {/* Corner decorations */}
        <div className="absolute -top-2 -left-2 z-10">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#F4A261">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </div>
        <div className="absolute -bottom-1 -right-2 z-10">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#E9C46A">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </div>

        {/* Photo frame */}
        <motion.button
          onClick={() => setEnlarged(!enlarged)}
          className="w-full rounded-2xl border-[2.5px] border-blue-dark bg-white p-2 shadow-soft cursor-pointer block"
          whileTap={{ scale: 0.97 }}
          animate={enlarged ? { scale: 1.05, rotate: 0 } : { scale: 1, rotate: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        >
          {/* Photo placeholder - gradient with illustration */}
          <div
            className="w-full aspect-[4/3] rounded-xl overflow-hidden relative"
            style={{
              background: 'linear-gradient(135deg, #EBF4FA 0%, #D6EBF5 40%, #F5E6D0 100%)',
            }}
          >
            {/* Decorative scene inside photo */}
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Sun */}
              <div
                className="absolute top-[15%] right-[20%] w-10 h-10 rounded-full"
                style={{ background: 'radial-gradient(circle, #E9C46A 0%, #F4A261 70%)' }}
              />
              {/* Cloud */}
              <div className="absolute top-[20%] left-[15%]">
                <svg width="50" height="28" viewBox="0 0 120 60" fill="#B8D4E8">
                  <ellipse cx="30" cy="40" rx="25" ry="18" />
                  <ellipse cx="60" cy="32" rx="35" ry="22" />
                  <ellipse cx="85" cy="40" rx="28" ry="18" />
                </svg>
              </div>
              {/* Hills */}
              <div
                className="absolute bottom-0 left-0 right-0 h-[35%]"
                style={{ background: 'linear-gradient(180deg, #A3D9A5 0%, #7BC47E 100%)', borderRadius: '50% 50% 0 0 / 20px 20px 0 0' }}
              />
              {/* Photo icon */}
              <div className="relative z-10 flex flex-col items-center">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#6B9AC4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" fill="#6B9AC4" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <span className="font-body text-[11px] mt-1" style={{ color: '#6B9AC4' }}>
                  {content.title}
                </span>
              </div>
            </div>
          </div>

          {/* Caption below photo in frame */}
          <p
            className="font-body text-[12px] text-center mt-2 mb-1"
            style={{ color: '#8899AA' }}
          >
            {content.date}
          </p>
        </motion.button>
      </motion.div>

      {/* Photo caption text */}
      <motion.p
        variants={itemVariants}
        className="font-body text-[16px] text-center leading-[1.7] mt-5"
        style={{ color: '#2D3748' }}
      >
        {content.photoCaption}
      </motion.p>

      {/* Tap hint */}
      <motion.p
        variants={itemVariants}
        className="font-body text-[11px] mt-3"
        style={{ color: '#8899AA' }}
      >
        点击照片放大查看
      </motion.p>
    </motion.div>
  );
}
