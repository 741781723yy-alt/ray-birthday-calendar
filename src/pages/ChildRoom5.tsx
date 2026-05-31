import { asset } from "@/lib/assets";
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router';

/* ═══════════════════════════════════════════
   ChildRoom 5 Page - 英国利兹体验（30岁）
   ═══════════════════════════════════════════ */

type Phase = 'travel' | 'leeds' | 'dialog' | 'cards' | 'ending';

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

/* ── 阶段一：毛玻璃卡片对话（5段） ── */
const DIALOG_CARDS = [
  ['这一年，你去英国读书啦！', '还去了好多好多地方。'],
  ['看起来真的很开心诶。'],
  ['世界好像也变大了，'],
  ['可以去很远很远的地方', '可以认识新的朋友', '可以在陌生城市乱逛'],
  ['你好像也越来越自由了。'],
];

/* ── 阶段二：暗背景结尾文字（3段） ── */
const ENDING_LINES = [
  ['虽然这些都是我没有参与的过去', '但通过你的描述', '我也慢慢认识更完整的你。'],
  ['你去了很多地方。'],
  ['不过我最开心的是——', '最后你也来到了我的世界。'],
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
    <span className="font-display text-[28px] leading-[1.8]" style={{ color: '#2B5E8C' }}>
      {displayed}
      <span style={{ opacity: cursorVisible ? 1 : 0, transition: 'opacity 0.2s', color: '#7BA7D9' }}>|</span>
    </span>
  );
}

/* ═══════════════════ 毛玻璃卡片 ═══════════════════ */

function GlassCard({ lines, visible }: { lines: string[]; visible: boolean }) {
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
            boxShadow: '0 8px 32px rgba(123, 167, 217, 0.08), inset 0 1px 0 rgba(255,255,255,0.6)',
            padding: '24px 28px',
            maxWidth: 340,
            width: '100%',
            minHeight: 120,
          }}
        >
          <div
            className="absolute inset-0 rounded-3xl pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at 50% 30%, rgba(123,167,217,0.15) 0%, transparent 70%)',
              animation: 'breathe 4s ease-in-out infinite',
            }}
          />
          <div className="relative z-10">
            {lines.map((line, i) => (
              <motion.p
                key={`${lines[0]}-${i}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 1.2 }}
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

/* ═══════════════════ 结尾文字 ═══════════════════ */

function EndingText({ lines, visible }: { lines: string[]; visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center text-center"
        >
          {lines.map((line, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 + i * 1.5 }}
              className="font-body text-[20px] leading-[2] font-bold text-white mb-1"
              style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}
            >
              {line}
            </motion.p>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ═══════════════════ 主组件 ═══════════════════ */

export default function ChildRoom5() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>('travel');
  const [travelProgress, setTravelProgress] = useState(0);

  // Dialog states
  const [showTypewriter, setShowTypewriter] = useState(false);

  // Card auto-play states
  const [cardIndex, setCardIndex] = useState(0);
  const [showCard, setShowCard] = useState(false);

  // Ending states
  const [endingIndex, setEndingIndex] = useState(0);
  const [showEndingLine, setShowEndingLine] = useState(false);
  const [showButton, setShowButton] = useState(false);

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
        setPhase('leeds');
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [phase]);

  // ── Leeds click → dialog ──
  const handleLeedsClick = useCallback(() => {
    if (phase === 'leeds') {
      setPhase('dialog');
      setTimeout(() => setShowTypewriter(true), 500);
    }
  }, [phase]);

  // ── Typewriter done → cards ──
  const handleTypewriterDone = useCallback(() => {
    setTimeout(() => {
      setShowTypewriter(false);
      setPhase('cards');
    }, 1500);
  }, []);

  // ── Cards auto-play (5 cards, 4s each, 0.5s pause after first) ──
  useEffect(() => {
    if (phase !== 'cards') return;

    const timeouts: ReturnType<typeof setTimeout>[] = [];

    const showNext = (index: number) => {
      if (index >= DIALOG_CARDS.length) {
        setShowCard(false);
        timeouts.push(setTimeout(() => setPhase('ending'), 200));
        return;
      }

      setCardIndex(index);
      setShowCard(true);

      const displayTime = 4000;

      timeouts.push(setTimeout(() => {
        setShowCard(false);
        // First card (index 0) has extra 0.5s pause
        const pauseAfter = index === 0 ? 1300 : 800;
        timeouts.push(setTimeout(() => {
          showNext(index + 1);
        }, pauseAfter));
      }, displayTime));
    };

    showNext(0);

    return () => timeouts.forEach(clearTimeout);
  }, [phase]);

  // ── Ending auto-play (3 lines, last stays + button after 2s) ──
  useEffect(() => {
    if (phase !== 'ending') return;

    const timeouts: ReturnType<typeof setTimeout>[] = [];

    const showNextEnding = (index: number) => {
      if (index >= ENDING_LINES.length) return;

      setEndingIndex(index);
      setShowEndingLine(true);

      const isLast = index === ENDING_LINES.length - 1;

      if (isLast) {
        timeouts.push(setTimeout(() => {
          setShowButton(true);
        }, 2000));
      } else {
        // First line stays 5s (3 lines need time), second line 3s
        const displayTime = index === 0 ? 5000 : 3000;
        timeouts.push(setTimeout(() => {
          setShowEndingLine(false);
          timeouts.push(setTimeout(() => {
            showNextEnding(index + 1);
          }, 800));
        }, displayTime));
      }
    };

    timeouts.push(setTimeout(() => {
      showNextEnding(0);
    }, 500));

    return () => timeouts.forEach(clearTimeout);
  }, [phase]);

  /* ═══════════════════ RENDER ═══════════════════ */

  const isDark = phase === 'ending';

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ background: '#1a2030' }}>
      {/* ===== PHASE: TIME TRAVEL ===== */}
      <AnimatePresence>
        {phase === 'travel' && (
          <motion.div
            className="absolute inset-0 z-50 flex items-center justify-center"
            style={{ background: '#0e1520' }}
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
                    border: '2px solid rgba(123, 167, 217, 0.4)',
                    animation: `spin ${2 + i * 0.5}s linear infinite ${i % 2 === 0 ? '' : 'reverse'}`,
                    opacity: 1 - travelProgress * 0.5,
                    boxShadow: '0 0 20px rgba(123, 167, 217, 0.2)',
                  }}
                />
              ))}
              <div
                className="absolute rounded-full"
                style={{
                  width: 100 + travelProgress * 200,
                  height: 100 + travelProgress * 200,
                  background: `radial-gradient(circle, rgba(123,167,217,${0.3 + travelProgress * 0.4}) 0%, transparent 70%)`,
                }}
              />
            </div>
            <motion.p
              className="absolute font-display text-[18px] z-10"
              style={{ color: '#B0D0F0' }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              时光穿梭中...
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== LEEDS + CARDS + ENDING ===== */}
      <AnimatePresence>
        {phase !== 'travel' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0"
            onClick={handleLeedsClick}
          >
            {/* Leeds Background */}
            <div className="absolute inset-0">
              <img
                src={asset("/leeds-scene.jpg")}
                alt="英国利兹"
                className="w-full h-full object-cover"
                style={{
                  filter: isDark ? 'brightness(0.35) blur(2px)' : 'brightness(1)',
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
                  background: `rgba(${140 + i * 20}, ${160 + i * 15}, ${200 + i * 10}, 0.5)`,
                  top: `${-10 - i * 15}%`,
                  left: `${15 + i * 14}%`,
                  animation: `leaf-fall ${5 + i * 2}s linear infinite`,
                  animationDelay: `${i * 1.2}s`,
                }}
              />
            ))}

            {/* White overlay for dialog + cards phases */}
            <AnimatePresence>
              {(phase === 'dialog' || phase === 'cards') && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 z-20"
                  style={{ background: 'rgba(255, 255, 255, 0.6)' }}
                />
              )}
            </AnimatePresence>

            {/* ═══ TYPEWRITER ═══ */}
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
                      text="30岁的小陈蕊，你好呀～"
                      speed={85}
                      onComplete={handleTypewriterDone}
                    />
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* ═══ GLASS CARDS ═══ */}
            {phase === 'cards' && (
              <div className="absolute inset-0 z-30 flex items-center justify-center px-6">
                <GlassCard lines={DIALOG_CARDS[cardIndex]} visible={showCard} />
              </div>
            )}

            {/* ═══ ENDING: Dark background + white text + button ═══ */}
            <AnimatePresence>
              {phase === 'ending' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1.2 }}
                  className="absolute inset-0 z-30 flex items-center justify-center px-6"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Text centered, button absolute below */}
                  <div className="relative" style={{ width: '100%', maxWidth: 400, height: 220 }}>
                    {/* Ending text lines - fixed at top center */}
                    <div className="absolute inset-x-0 top-0 flex items-start justify-center">
                      {endingIndex < ENDING_LINES.length && (
                        <EndingText
                          lines={ENDING_LINES[endingIndex]}
                          visible={showEndingLine}
                        />
                      )}
                    </div>

                    {/* Back button - fixed at bottom center, opacity fade only */}
                    <div className="absolute inset-x-0 bottom-0 flex items-center justify-center" style={{ height: 60 }}>
                      <AnimatePresence>
                        {showButton && (
                          <motion.button
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
                            className="px-8 py-3.5 rounded-full font-body text-[16px] font-bold text-white"
                            style={{
                              background: 'linear-gradient(135deg, #7BA7D9 0%, #5B8EC4 100%)',
                              boxShadow: '0 4px 16px rgba(123, 167, 217, 0.4)',
                            }}
                            onClick={() => navigate('/', { state: { buildingOpen: true } })}
                          >
                            回到日历
                          </motion.button>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
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
