import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { preloadAllAssets } from '@/lib/preload';

interface PreloadScreenProps {
  onComplete: () => void;
}

export default function PreloadScreen({ onComplete }: PreloadScreenProps) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<'images' | 'videos'>('images');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const { onProgress, promise } = preloadAllAssets();

    const IMAGE_COUNT = 130; // 图片数量（大约）

    onProgress((loaded, total) => {
      const pct = Math.round((loaded / total) * 100);
      setProgress(pct);

      // 图片加载完了，切到视频阶段
      if (loaded >= IMAGE_COUNT && phase === 'images') {
        setPhase('videos');
      }
    });

    promise.then(() => {
      setReady(true);
      setTimeout(onComplete, 600);
    });
  }, [onComplete, phase]);

  const phaseText = phase === 'images'
    ? '正在准备惊喜...'
    : '正在加载视频...';

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
        style={{
          background: 'linear-gradient(170deg, #1a0a2e 0%, #2d1b4e 40%, #1a0a2e 100%)',
        }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* 装饰星星 */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: `${10 + (i * 37) % 80}%`,
              top: `${5 + (i * 23) % 50}%`,
            }}
            animate={{
              opacity: [0.1, 0.6, 0.1],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 2 + (i % 3),
              delay: i * 0.3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <svg width={4 + (i % 4) * 2} height={4 + (i % 4) * 2} viewBox="0 0 16 16">
              <path d="M8 0L9.5 6.5L16 8L9.5 9.5L8 16L6.5 9.5L0 8L6.5 6.5Z" fill="#E9C46A" />
            </svg>
          </motion.div>
        ))}

        {/* 礼物盒图标 */}
        <motion.div
          animate={{
            y: [0, -8, 0],
            rotate: [0, 2, -2, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="mb-8"
        >
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
            <rect x="10" y="35" width="60" height="35" rx="4" fill="#F4A261" />
            <rect x="6" y="28" width="68" height="12" rx="4" fill="#E9C46A" />
            <rect x="35" y="28" width="10" height="42" fill="#E76F51" rx="2" />
            <rect x="6" y="32" width="68" height="6" fill="#E76F51" rx="1" />
            <ellipse cx="32" cy="26" rx="10" ry="7" fill="#E76F51" />
            <ellipse cx="48" cy="26" rx="10" ry="7" fill="#E76F51" />
            <circle cx="40" cy="28" r="4" fill="#D62828" />
          </svg>
        </motion.div>

        {/* 标题 */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-2xl font-bold mb-2 tracking-wider"
          style={{
            fontFamily: 'Quicksand, sans-serif',
            color: '#E9C46A',
            textShadow: '0 0 20px rgba(233,196,106,0.3)',
          }}
        >
          RAY的生日日历
        </motion.h1>

        {/* 阶段提示 */}
        <motion.p
          key={phase}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ duration: 0.5 }}
          className="text-sm mb-10 tracking-widest"
          style={{ color: '#B8A9D4', fontFamily: 'Quicksand, sans-serif' }}
        >
          {phaseText}
        </motion.p>

        {/* 进度条 */}
        <div
          className="w-56 h-2 rounded-full overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.1)' }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{
              background: phase === 'images'
                ? 'linear-gradient(90deg, #E9C46A, #F4A261)'
                : 'linear-gradient(90deg, #B8A9D4, #7B68EE)',
              width: `${progress}%`,
            }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* 进度数字 */}
        <motion.p
          className="mt-3 text-xs tracking-wider"
          style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Quicksand, sans-serif' }}
        >
          {progress}%
        </motion.p>

        {/* 完成提示 */}
        <AnimatePresence>
          {ready && (
            <motion.p
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 text-sm tracking-wider"
              style={{ color: '#E9C46A', fontFamily: 'Quicksand, sans-serif' }}
            >
              ✨ 准备好了！
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}
