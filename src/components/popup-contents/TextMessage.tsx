import { motion } from 'framer-motion';
import { useNavigate } from 'react-router';
import type { DayContent } from '@/data/dayContents';

interface TextMessageProps {
  content: DayContent;
}

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] } },
};

export default function TextMessage({ content }: TextMessageProps) {
  const navigate = useNavigate();
  const paragraphs = content.message?.split('\n\n') || [];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col items-center text-center px-2 py-3"
    >
      {/* Decorative top divider */}
      <motion.div variants={itemVariants} className="flex items-center gap-2 mb-5">
        <div className="w-8 h-[2px] rounded-full bg-blue-glass" />
        <svg width="14" height="14" viewBox="0 0 24 24" fill="#F4A261">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
        <div className="w-8 h-[2px] rounded-full bg-blue-glass" />
      </motion.div>

      {/* Title */}
      <motion.h3
        variants={itemVariants}
        className="font-display text-[26px] tracking-[0.03em] mb-5"
        style={{ color: '#405B7A' }}
      >
        {content.title}
      </motion.h3>

      {/* Decorative quotation mark */}
      <motion.div
        variants={itemVariants}
        className="text-[40px] font-number leading-none mb-2 opacity-25 select-none"
        style={{ color: '#6B9AC4' }}
      >
        &ldquo;
      </motion.div>

      {/* Message body */}
      <motion.div variants={itemVariants} className="max-w-[300px] w-full mb-4">
        {paragraphs.map((paragraph, idx) => (
          <p
            key={idx}
            className="font-body text-[16px] leading-[1.9] mb-2"
            style={{ color: '#2D3748' }}
          >
            {paragraph}
          </p>
        ))}
      </motion.div>

      {/* Decorative quotation mark */}
      <motion.div
        variants={itemVariants}
        className="text-[40px] font-number leading-none mb-5 opacity-25 select-none rotate-180"
        style={{ color: '#6B9AC4' }}
      >
        &ldquo;
      </motion.div>

      {/* Blue button */}
      <motion.button
        variants={itemVariants}
        className="px-6 py-3 rounded-full font-body text-[15px] font-bold text-white mb-5 transition-transform duration-200 hover:scale-105 active:scale-95"
        style={{
          background: 'linear-gradient(135deg, #6B9AC4 0%, #5A8AB4 100%)',
          boxShadow: '0 4px 12px rgba(107, 154, 196, 0.35)',
        }}
        onClick={() => {
          navigate('/child-room');
        }}
      >
        坐上时光机 回到过去
      </motion.button>

      {/* Bottom divider with heart */}
      <motion.div variants={itemVariants} className="flex items-center gap-2">
        <div className="w-8 h-[2px] rounded-full bg-blue-glass" />
        <svg width="14" height="14" viewBox="0 0 24 24" fill="#F4A261">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
        <div className="w-8 h-[2px] rounded-full bg-blue-glass" />
      </motion.div>

      {/* Floating footer icon */}
      <motion.div
        variants={itemVariants}
        className="mt-4 animate-float"
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="#E9C46A">
          <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 18H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z" />
          <circle cx="12" cy="14" r="5" fill="#F4A261" opacity="0.5" />
        </svg>
      </motion.div>
    </motion.div>
  );
}
