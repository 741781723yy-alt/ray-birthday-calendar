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

// Theme configurations for different days
const themes: Record<string, {
  titleColor: string;
  quoteColor: string;
  buttonBg: string;
  buttonShadow: string;
  dividerColor: string;
  navigateTo: string;
  buttonText: string;
}> = {
  // Day 1: Blue theme - Childhood
  '1': {
    titleColor: '#405B7A',
    quoteColor: '#6B9AC4',
    buttonBg: 'linear-gradient(135deg, #6B9AC4 0%, #5A8AB4 100%)',
    buttonShadow: '0 4px 12px rgba(107, 154, 196, 0.35)',
    dividerColor: 'bg-blue-glass',
    navigateTo: '/child-room',
    buttonText: '坐上时光机 回到过去',
  },
  // Day 2: Pink theme - Teenage years
  '2': {
    titleColor: '#8B4557',
    quoteColor: '#E091A3',
    buttonBg: 'linear-gradient(135deg, #E091A3 0%, #D08094 100%)',
    buttonShadow: '0 4px 12px rgba(224, 145, 163, 0.35)',
    dividerColor: 'bg-pink-soft',
    navigateTo: '/child-room-2',
    buttonText: '走进教室 听听青春',
  },
  // Day 6: Orange theme - Office
  '6': {
    titleColor: '#B8651A',
    quoteColor: '#E9A44A',
    buttonBg: 'linear-gradient(135deg, #E9A44A 0%, #D4883A 100%)',
    buttonShadow: '0 4px 12px rgba(233, 164, 74, 0.35)',
    dividerColor: 'bg-orange',
    navigateTo: '/child-room-6',
    buttonText: '出发吧',
  },
  // Day 5: Light blue theme - Leeds
  '5': {
    titleColor: '#4A7FB5',
    quoteColor: '#7BA7D9',
    buttonBg: 'linear-gradient(135deg, #7BA7D9 0%, #5B8EC4 100%)',
    buttonShadow: '0 4px 12px rgba(123, 167, 217, 0.35)',
    dividerColor: 'bg-blue-soft',
    navigateTo: '/child-room-5',
    buttonText: '出发吧',
  },
  // Day 4: Yellow theme - Shanghai street
  '4': {
    titleColor: '#8B6914',
    quoteColor: '#E9C46A',
    buttonBg: 'linear-gradient(135deg, #E9C46A 0%, #D4A840 100%)',
    buttonShadow: '0 4px 12px rgba(233, 196, 106, 0.35)',
    dividerColor: 'bg-yellow-soft',
    navigateTo: '/child-room-4',
    buttonText: '出发吧',
  },
  // Day 7: Blue theme - Gallery
  '7': {
    titleColor: '#4A7FB5',
    quoteColor: '#7BA7D9',
    buttonBg: 'linear-gradient(135deg, #7BA7D9 0%, #5B8EC4 100%)',
    buttonShadow: '0 4px 12px rgba(123, 167, 217, 0.35)',
    dividerColor: 'bg-blue-soft',
    navigateTo: '/child-room-7',
    buttonText: '出发吧',
  },
  // Day 3: Green theme - University years
  '3': {
    titleColor: '#4A6741',
    quoteColor: '#8FB883',
    buttonBg: 'linear-gradient(135deg, #8FB883 0%, #7EA872 100%)',
    buttonShadow: '0 4px 12px rgba(143, 184, 131, 0.35)',
    dividerColor: 'bg-green-soft',
    navigateTo: '/child-room-3',
    buttonText: '点击按钮 回到过去',
  },
  // Day 10: Green theme
  '10': {
    titleColor: '#4A6741',
    quoteColor: '#8FB883',
    buttonBg: 'linear-gradient(135deg, #8FB883 0%, #7EA872 100%)',
    buttonShadow: '0 4px 12px rgba(143, 184, 131, 0.35)',
    dividerColor: 'bg-green-soft',
    navigateTo: '/child-room-10',
    buttonText: '回顾这段旅程',
  },
};

export default function TextMessage({ content }: TextMessageProps) {
  const navigate = useNavigate();
  const paragraphs = content.message?.split('\n\n') || [];
  
  // Get theme for current day, fallback to blue theme (day 1)
  const dayKey = String(content.day);
  const theme = themes[dayKey] || themes['1'];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col items-center text-center px-2 py-3"
    >
      {/* Decorative top divider */}
      <motion.div variants={itemVariants} className="flex items-center gap-2 mb-5">
        <div className={`w-8 h-[2px] rounded-full ${theme.dividerColor}`} />
        <svg width="14" height="14" viewBox="0 0 24 24" fill="#F4A261">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
        <div className={`w-8 h-[2px] rounded-full ${theme.dividerColor}`} />
      </motion.div>

      {/* Title - only show if title is not empty */}
      {content.title && (
        <motion.h3
          variants={itemVariants}
          className="font-display text-[26px] tracking-[0.03em] mb-5"
          style={{ color: theme.titleColor }}
        >
          {content.title}
        </motion.h3>
      )}

      {/* Decorative quotation mark */}
      <motion.div
        variants={itemVariants}
        className="text-[40px] font-number leading-none mb-2 opacity-25 select-none"
        style={{ color: theme.quoteColor }}
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
        style={{ color: theme.quoteColor }}
      >
        &ldquo;
      </motion.div>

      {/* Theme-colored button */}
      <motion.button
        variants={itemVariants}
        className="px-6 py-3 rounded-full font-body text-[15px] font-bold text-white mb-5 transition-transform duration-200 hover:scale-105 active:scale-95"
        style={{
          background: theme.buttonBg,
          boxShadow: theme.buttonShadow,
        }}
        onClick={() => {
          navigate(theme.navigateTo);
        }}
      >
        {theme.buttonText}
      </motion.button>

      {/* Bottom divider with heart */}
      <motion.div variants={itemVariants} className="flex items-center gap-2">
        <div className={`w-8 h-[2px] rounded-full ${theme.dividerColor}`} />
        <svg width="14" height="14" viewBox="0 0 24 24" fill="#F4A261">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
        <div className={`w-8 h-[2px] rounded-full ${theme.dividerColor}`} />
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
