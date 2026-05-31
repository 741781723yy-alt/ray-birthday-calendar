import { asset } from "@/lib/assets";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { DayContent } from '@/data/dayContents';

interface EnvelopeProps {
  content: DayContent;
}

// 信封图片动画变体
const envelopeVariants = {
  initial: { scale: 1, opacity: 1 },
  click: {
    scale: 1.05,
    transition: { duration: 0.3, ease: 'easeOut' as const }
  },
  fadeOut: {
    opacity: 0,
    transition: { duration: 0.5, ease: 'easeOut' as const }
  },
  hidden: { opacity: 0, scale: 0.9 },
};

// 信纸动画变体
const letterVariants = {
  hidden: { y: 60, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.8, ease: 'easeOut' as const }
  },
};

export default function Envelope({ content }: EnvelopeProps) {
  const [stage, setStage] = useState<'closed' | 'opening' | 'open'>('closed');
  const [showLetter, setShowLetter] = useState(false);

  const handleClick = () => {
    if (stage !== 'closed') return;

    // 动画流程：
    // 1. scale(1) → scale(1.05)，300ms
    // 2. fadeOut，500ms
    // 3. 切换到 open.png，fadeIn 600ms
    // 4. 邀请函内容 slideUp 800ms

    setStage('opening');

    // 300ms 后开始 fadeOut
    setTimeout(() => {
      // fadeOut 500ms
      setTimeout(() => {
        setStage('open');
        // open.png fadeIn 600ms 后显示信纸
        setTimeout(() => {
          setShowLetter(true);
        }, 600);
      }, 500);
    }, 300);
  };

  return (
    <div className="flex flex-col items-center py-4">
      {/* 信封图片层 */}
      <div className="relative" style={{ width: 300, height: 300 }}>
        {/* 关闭的信封 */}
        <AnimatePresence>
          {(stage === 'closed' || stage === 'opening') && (
            <motion.img
              src={asset("/assets/envelope-closed.png")}
              alt="关闭的信封"
              variants={envelopeVariants}
              initial="initial"
              animate={stage === 'opening' ? 'click' : 'initial'}
              onClick={handleClick}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center 42%',
                cursor: 'pointer',
              }}
            />
          )}
        </AnimatePresence>

        {/* 打开的信封 */}
        <AnimatePresence>
          {stage === 'open' && (
            <motion.img
              src={asset("/assets/envelope-open.png")}
              alt="打开的信封"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: 'easeOut' as const }}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center 42%',
              }}
            />
          )}
        </AnimatePresence>

        {/* 点击提示 - 仅关闭状态显示 */}
        {stage === 'closed' && (
          <motion.div
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{
              position: 'absolute',
              bottom: -30,
              left: 0,
              right: 0,
              textAlign: 'center',
              fontFamily: 'Quicksand, sans-serif',
              fontSize: 13,
              color: 'rgba(255,255,255,0.5)',
              pointerEvents: 'none',
            }}
          >
            点击打开信封
          </motion.div>
        )}
      </div>

      {/* 邀请函内容 - 信纸打开后显示 */}
      <AnimatePresence>
        {showLetter && (
          <motion.div
            key="letter"
            variants={letterVariants}
            initial="hidden"
            animate="visible"
            style={{
              width: 300,
              marginTop: 20,
              background: 'linear-gradient(145deg, #FFFEF8 0%, #FEF9F2 50%, #FDF5E8 100%)',
              borderRadius: 16,
              padding: '28px 24px',
              boxShadow: '0 8px 32px rgba(180,150,120,0.25), inset 0 1px 0 rgba(255,255,255,0.9)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* 信纸纹理 */}
            <div style={{
              position: 'absolute',
              inset: 0,
              background: `repeating-linear-gradient(
                0deg,
                transparent,
                transparent 28px,
                rgba(200,180,160,0.12) 28px,
                rgba(200,180,160,0.12) 29px
              )`,
              pointerEvents: 'none',
            }} />

            {/* 角落装饰 */}
            <div style={{ position: 'absolute', top: 8, right: 12, fontSize: 20, opacity: 0.12 }}>✿</div>
            <div style={{ position: 'absolute', bottom: 8, left: 12, fontSize: 18, opacity: 0.1, transform: 'rotate(-15deg)' }}>❀</div>

            {/* 邀请函内容 */}
            <div style={{ position: 'relative', zIndex: 1 }}>
              <p
                style={{
                  fontFamily: 'Quicksand, sans-serif',
                  fontSize: 20,
                  fontWeight: 700,
                  color: '#8B6A50',
                  textAlign: 'center',
                  marginBottom: 16,
                }}
              >
                ✉️ 邀请函
              </p>
              <p
                style={{
                  fontFamily: 'Quicksand, sans-serif',
                  fontSize: 15,
                  lineHeight: 1.9,
                  color: '#5A4A3A',
                  textAlign: 'center',
                  margin: 0,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {content.message?.split('\n').map((line, i, arr) => (
                  <span key={i}>
                    {line}
                    {i < arr.length - 1 && <br />}
                  </span>
                )) || '待填写...'}
              </p>
            </div>

            {/* 回到日历按钮 */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              onClick={() => window.history.back()}
              style={{
                display: 'block',
                margin: '24px auto 0',
                padding: '10px 28px',
                borderRadius: 20,
                border: '1px solid rgba(139,106,80,0.2)',
                background: 'linear-gradient(135deg, #F5E6D3, #EDD5BE)',
                color: '#8B6A50',
                fontSize: 14,
                fontWeight: 600,
                fontFamily: 'Quicksand, sans-serif',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(180,150,120,0.2)',
              }}
            >
              回到日历
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}