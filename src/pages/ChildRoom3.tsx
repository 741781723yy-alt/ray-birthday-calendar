import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router';

/* ═══════════════════════════════════════════
   ChildRoom 3 Page - 大学校园体验（20岁）
   ═══════════════════════════════════════════ */

type Phase = 'travel' | 'campus' | 'dialog' | 'dialog-cards' | 'ending';

/* ── Web Audio 音效 ── */
let audioCtx: AudioContext | null = null;
function getAudioCtx() {
  if (!audioCtx) audioCtx = new AudioContext();
  return audioCtx;
}

function playTickSound() {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(1200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.02);
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.03);
  } catch { /* ignore */ }
}

/* ── 对话文案（占位，等待用户提供） ── */
const DIALOG_CARDS: string[][] = [
  ['这是第一段对话占位文字', '等待用户提供具体内容...'],
  ['这是第二段对话占位文字', '等待用户提供具体内容...'],
  ['这是第三段对话占位文字', '等待用户提供具体内容...'],
];

/* ═══════════════════ 打字机效果 ═══════════════════ */

function TypewriterText({ text, speed = 85, onComplete }: { text: string; speed?: number; onComplete?: () => void }) {
  const [displayed, setDisplayed] = useState('');
  const [cursorVisible, setCursorVisible] = useState(true);

  useEffect(() => {
    setDisplayed('');
    let idx = 0;
    const interval = setInterval(() => {
      idx++;
      setDisplayed(text.slice(0, idx));
      playTickSound();
      if (idx >= text.length) {
        clearInterval(interval);
        onComplete?.();
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed, onComplete]);

  useEffect(() => {
    const blink = setInterval(() => setCursorVisible((v) => !v), 500);
    return () => clearInterval(blink);
  }, []);

  return (
    <span className="font-display text-[28px] leading-[1.8]" style={{ color: '#4A6741' }}>
      {displayed}
      <span style={{ opacity: cursorVisible ? 1 : 0, transition: 'opacity 0.2s', color: '#8FB883' }}>|</span>
    </span>
  );
}

/* ═══════════════════ 逐句淡入段落 ═══════════════════ */

function FadeParagraph({ lines, visible, delay = 0 }: { lines: string[]; visible: boolean; delay?: number }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center justify-center relative"
          style={{
            background: 'rgba(255, 253, 248, 0.45)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            borderRadius: 24,
            boxShadow: '0 8px 32px rgba(143, 184, 131, 0.08), inset 0 1px 0 rgba(255,255,255,0.6)',
            padding: '24px 28px',
            maxWidth: 340,
            width: '100%',
            minHeight: 120,
          }}
        >
          {/* Breathing glow */}
          <div
            className="absolute inset-0 rounded-3xl pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at 50% 30%, rgba(143,184,131,0.15) 0%, transparent 70%)',
              animation: 'breathe 4s ease-in-out infinite',
            }}
          />
          <div className="relative z-10">
            {lines.map((line, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: delay + i * 1.8 }}
                className="font-body text-[17px] leading-[2.2] text-center w-full"
                style={{ color: '#2D3748' }}
              >
                {line}
              </motion.p>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ═══════════════════ 主组件 ═══════════════════ */

export default function ChildRoom3() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>('travel');
  const [travelProgress, setTravelProgress] = useState(0);

  // Dialog sub-states
  const [showTypewriter, setShowTypewriter] = useState(false);
  const [showCard0, setShowCard0] = useState(false);
  const [showCard1, setShowCard1] = useState(false);
  const [showCard2, setShowCard2] = useState(false);
  const [cardsDone, setCardsDone] = useState(false);

  // ── Phase 1: Time travel ──
  useEffect(() => {
    if (phase !== 'travel') return;
    let frame: number;
    const start = performance.now();
    const duration = 1500;
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      setTravelProgress(progress);
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        setPhase('campus');
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [phase]);

  // ── Campus click → dialog ──
  const handleCampusClick = useCallback(() => {
    if (phase === 'campus') {
      setPhase('dialog');
      setTimeout(() => setShowTypewriter(true), 500);
    }
  }, [phase]);

  // ── Typewriter done → fade out → cards ──
  const handleTypewriterDone = useCallback(() => {
    setTimeout(() => {
      setShowTypewriter(false);
      setPhase('dialog-cards');
      setShowCard0(true);
    }, 2000);
  }, []);

  // ── Card chain ──
  const handleCard0Done = useCallback(() => {
    setTimeout(() => {
      setShowCard0(false);
      setTimeout(() => setShowCard1(true), 800);
    }, 1200);
  }, []);

  const handleCard1Done = useCallback(() => {
    setTimeout(() => {
      setShowCard1(false);
      setTimeout(() => setShowCard2(true), 800);
    }, 1200);
  }, []);

  const handleCard2Done = useCallback(() => {
    setTimeout(() => {
      setShowCard2(false);
      setCardsDone(true);
      setTimeout(() => setPhase('ending'), 1500);
    }, 500);
  }, []);

  // Auto-trigger card done callbacks
  useEffect(() => {
    if (showCard0) { const t = setTimeout(handleCard0Done, 4500); return () => clearTimeout(t); }
  }, [showCard0, handleCard0Done]);

  useEffect(() => {
    if (showCard1) { const t = setTimeout(handleCard1Done, 3500); return () => clearTimeout(t); }
  }, [showCard1, handleCard1Done]);

  useEffect(() => {
    if (showCard2) { const t = setTimeout(handleCard2Done, 3500); return () => clearTimeout(t); }
  }, [showCard2, handleCard2Done]);

  /* ═══════════════════ RENDER ═══════════════════ */

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ background: '#1a2e1a' }}>
      {/* ===== PHASE: TIME TRAVEL ===== */}
      <AnimatePresence>
        {phase === 'travel' && (
          <motion.div
            className="absolute inset-0 z-50 flex items-center justify-center"
            style={{ background: '#0a1a0a' }}
          >
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{
                filter: `blur(${travelProgress * 4}px)`,
                transform: `scale(${1 + travelProgress * 0.3})`,
              }}
            >
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    width: 60 + i * 50,
                    height: 60 + i * 50,
                    border: '2px solid rgba(143, 184, 131, 0.4)',
                    animation: `spin ${2 + i * 0.5}s linear infinite ${i % 2 === 0 ? '' : 'reverse'}`,
                    opacity: 1 - travelProgress * 0.5,
                    boxShadow: '0 0 20px rgba(143, 184, 131, 0.2), inset 0 0 20px rgba(169, 215, 140, 0.1)',
                  }}
                />
              ))}
              <div
                className="absolute rounded-full"
                style={{
                  width: 100 + travelProgress * 200,
                  height: 100 + travelProgress * 200,
                  background: `radial-gradient(circle, rgba(143,184,131,${0.3 + travelProgress * 0.4}) 0%, rgba(169,215,140,${travelProgress * 0.2}) 40%, transparent 70%)`,
                }}
              />
            </div>
            <motion.p
              className="absolute font-display text-[18px] z-10"
              style={{ color: '#B8E8C4' }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              时光穿梭中...
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== PHASE: CAMPUS + DIALOG + ENDING ===== */}
      <AnimatePresence>
        {phase !== 'travel' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0"
            onClick={handleCampusClick}
          >
            {/* Campus Background */}
            <div className="absolute inset-0">
              <img
                src="/university-campus.jpg"
                alt="大学校园"
                className="w-full h-full object-cover"
                style={{
                  filter: cardsDone ? 'brightness(0.5) blur(2px)' : 'brightness(1)',
                  transition: 'filter 2s ease',
                }}
                draggable={false}
              />
            </div>

            {/* Falling leaves */}
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute pointer-events-none"
                style={{
                  width: 8 + i * 3,
                  height: 8 + i * 3,
                  borderRadius: '50% 0 50% 0',
                  background: `rgba(${80 + i * 30}, ${140 + i * 20}, 60, 0.5)`,
                  top: `${-10 - i * 15}%`,
                  left: `${15 + i * 14}%`,
                  animation: `leaf-fall ${5 + i * 2}s linear infinite`,
                  animationDelay: `${i * 1.2}s`,
                }}
              />
            ))}

            {/* White overlay for dialog phases */}
            <AnimatePresence>
              {(phase === 'dialog' || phase === 'dialog-cards') && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 z-20"
                  style={{ background: 'rgba(255, 255, 255, 0.6)' }}
                />
              )}
            </AnimatePresence>

            {/* ═══ DIALOG: Typewriter ═══ */}
            <AnimatePresence>
              {phase === 'dialog' && showTypewriter && (
                <div className="absolute inset-0 z-30 flex items-center justify-center px-6">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex items-center justify-center"
                    style={{ minHeight: 100 }}
                  >
                    <TypewriterText
                      text="上大学的小陈蕊，你好呀～"
                      speed={85}
                      onComplete={handleTypewriterDone}
                    />
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* ═══ DIALOG: Cards ═══ */}
            {phase === 'dialog-cards' && (
              <div className="absolute inset-0 z-30 flex flex-col items-center justify-center px-6 gap-6">
                <FadeParagraph lines={DIALOG_CARDS[0]} visible={showCard0} delay={0} />
                <FadeParagraph lines={DIALOG_CARDS[1]} visible={showCard1} delay={0} />
                <FadeParagraph lines={DIALOG_CARDS[2]} visible={showCard2} delay={0} />
              </div>
            )}

            {/* ═══ ENDING PHASE ═══ */}
            <AnimatePresence>
              {phase === 'ending' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1.2 }}
                  className="absolute inset-0 z-30 flex flex-col items-center justify-center px-6"
                  onClick={(e) => e.stopPropagation()}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 1 }}
                    className="flex flex-col items-center"
                  >
                    <p className="font-display text-[22px] text-white mb-8 text-center" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
                      对话内容等待添加...
                    </p>
                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1, duration: 0.8 }}
                      className="px-6 py-3 rounded-full font-body text-[15px] font-bold text-white"
                      style={{
                        background: 'linear-gradient(135deg, #8FB883 0%, #7EA872 100%)',
                        boxShadow: '0 4px 12px rgba(143, 184, 131, 0.35)',
                      }}
                      onClick={() => navigate('/', { state: { buildingOpen: true } })}
                    >
                      回到日历
                    </motion.button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keyframes */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes leaf-fall {
          0% { transform: translateY(0) rotate(0deg) translateX(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 0.6; }
          100% { transform: translateY(100vh) rotate(360deg) translateX(-50px); opacity: 0; }
        }
        @keyframes breathe {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
