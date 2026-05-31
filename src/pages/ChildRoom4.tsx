import { asset } from "@/lib/assets";
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router';

/* ═══════════════════════════════════════════
   ChildRoom 4 Page - 上海街道体验（25岁）
   ═══════════════════════════════════════════ */

type Phase = 'travel' | 'street' | 'dialog' | 'cards' | 'ending';

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

/* ── 阶段一：毛玻璃卡片对话 ── */
const DIALOG_CARDS = [
  ['听说那个时候，', '你住在离我很近的地方。'],
  ['说不定在我们不知道的时候，', '已经见过很多次了。'],
  ['真是太神奇了～'],
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
    <span className="font-display text-[28px] leading-[1.8]" style={{ color: '#5C3D05' }}>
      {displayed}
      <span style={{ opacity: cursorVisible ? 1 : 0, transition: 'opacity 0.2s', color: '#D4A840' }}>|</span>
    </span>
  );
}

/* ═══════════════════ 毛玻璃卡片 ═══════════════════ */

function GlassCard({ lines, visible, fadeDelay = 0 }: { lines: string[]; visible: boolean; fadeDelay?: number }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, delay: fadeDelay }}
          className="flex flex-col items-center justify-center relative"
          style={{
            background: 'rgba(255, 253, 248, 0.45)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            borderRadius: 24,
            boxShadow: '0 8px 32px rgba(233, 196, 106, 0.08), inset 0 1px 0 rgba(255,255,255,0.6)',
            padding: '24px 28px',
            maxWidth: 340,
            width: '100%',
            minHeight: 120,
          }}
        >
          <div
            className="absolute inset-0 rounded-3xl pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at 50% 30%, rgba(233,196,106,0.15) 0%, transparent 70%)',
              animation: 'breathe 4s ease-in-out infinite',
            }}
          />
          <div className="relative z-10">
            {lines.map((line, i) => (
              <motion.p
                key={`${lines[0]}-${i}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: fadeDelay + i * 1.8 }}
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

export default function ChildRoom4() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>('travel');
  const [travelProgress, setTravelProgress] = useState(0);

  // Dialog states
  const [showTypewriter, setShowTypewriter] = useState(false);

  // Card auto-play states
  const [cardIndex, setCardIndex] = useState(0);
  const [showCard, setShowCard] = useState(false);

  // Ending states
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
        setPhase('street');
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [phase]);

  // ── Street click → dialog ──
  const handleStreetClick = useCallback(() => {
    if (phase === 'street') {
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

  // ── Cards auto-play (3 cards, 4s each) ──
  useEffect(() => {
    if (phase !== 'cards') return;

    const timeouts: ReturnType<typeof setTimeout>[] = [];

    const showNext = (index: number) => {
      if (index >= DIALOG_CARDS.length) {
        // All cards done → ending
        setShowCard(false);
        timeouts.push(setTimeout(() => setPhase('ending'), 200));
        return;
      }

      setCardIndex(index);
      setShowCard(true);

      const displayTime = 4000;

      timeouts.push(setTimeout(() => {
        setShowCard(false);
        timeouts.push(setTimeout(() => {
          showNext(index + 1);
        }, 1300)); // 800ms fade + 0.5s pause
      }, displayTime));
    };

    showNext(0);

    return () => timeouts.forEach(clearTimeout);
  }, [phase]);

  // ── Ending: people walk 3s, then button appears ──
  useEffect(() => {
    if (phase !== 'ending') return;

    const t = setTimeout(() => {
      setShowButton(true);
    }, 4300); // person2 starts 0.3s late + 4s walk

    return () => clearTimeout(t);
  }, [phase]);

  /* ═══════════════════ RENDER ═══════════════════ */

  const isDark = phase === 'ending';

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ background: '#2a1e0a' }}>
      {/* ===== PHASE: TIME TRAVEL ===== */}
      <AnimatePresence>
        {phase === 'travel' && (
          <motion.div
            className="absolute inset-0 z-50 flex items-center justify-center"
            style={{ background: '#1a1005' }}
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
                    border: '2px solid rgba(233, 196, 106, 0.4)',
                    animation: `spin ${2 + i * 0.5}s linear infinite ${i % 2 === 0 ? '' : 'reverse'}`,
                    opacity: 1 - travelProgress * 0.5,
                    boxShadow: '0 0 20px rgba(233, 196, 106, 0.2), inset 0 0 20px rgba(255, 215, 100, 0.1)',
                  }}
                />
              ))}
              <div
                className="absolute rounded-full"
                style={{
                  width: 100 + travelProgress * 200,
                  height: 100 + travelProgress * 200,
                  background: `radial-gradient(circle, rgba(233,196,106,${0.3 + travelProgress * 0.4}) 0%, rgba(255,215,100,${travelProgress * 0.2}) 40%, transparent 70%)`,
                }}
              />
            </div>
            <motion.p
              className="absolute font-display text-[18px] z-10"
              style={{ color: '#F0D78C' }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              时光穿梭中...
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== STREET + CARDS + ENDING ===== */}
      <AnimatePresence>
        {phase !== 'travel' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0"
            onClick={handleStreetClick}
          >
            {/* Street Background */}
            <div className="absolute inset-0">
              <img
                src={asset("/shanghai-street.jpg")}
                alt="上海街道"
                className="w-full h-full object-cover"
                style={{
                  filter: isDark ? 'brightness(0.35) blur(2px)' : 'brightness(1)',
                  transition: 'filter 2s ease',
                }}
                draggable={false}
              />
            </div>

            {/* Falling golden leaves */}
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute pointer-events-none"
                style={{
                  width: 8 + i * 3,
                  height: 8 + i * 3,
                  borderRadius: '50% 0 50% 0',
                  background: `rgba(${200 + i * 15}, ${170 + i * 10}, 60, 0.5)`,
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
                      text="25岁的小陈蕊，你好呀～"
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
                <GlassCard lines={DIALOG_CARDS[cardIndex]} visible={showCard} fadeDelay={cardIndex === 0 ? 0.5 : 0} />
              </div>
            )}

            {/* ═══ ENDING: Dark background + two people walking + button ═══ */}
            <AnimatePresence>
              {phase === 'ending' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1.2 }}
                  className="absolute inset-0 z-30 flex flex-col items-center justify-center px-6"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Two people walking from corners to center */}
                  <div className="relative flex items-center justify-center" style={{ width: '100%', height: '55vh' }}>
                    {/* Person 1 - red arrow route: top-left → down-right → down-left */}
                    <motion.div
                      className="absolute"
                      style={{
                        height: '42vh',
                        maxHeight: 360,
                        bottom: '8%',
                        animation: showButton ? 'none' : 'walk-person1 4s ease-in-out forwards',
                        transform: showButton ? 'translateX(-40%) translateY(0) scaleX(1)' : undefined,
                      }}
                    >
                      <motion.img
                        src={asset("/person1.png")}
                        alt="person1"
                        className="h-full w-auto"
                        style={{ objectFit: 'contain' }}
                        animate={showButton ? { y: 0 } : { y: [0, -4, 0, -3, 0] }}
                        transition={showButton ? {} : { duration: 0.5, repeat: Infinity }}
                      />
                    </motion.div>

                    {/* Person 2 - blue arrow route: bottom-right → up-left → up */}
                    <motion.div
                      className="absolute"
                      style={{
                        height: '42vh',
                        maxHeight: 360,
                        bottom: '8%',
                        animation: showButton ? 'none' : 'walk-person2 4s ease-in-out 0.3s forwards',
                        transform: showButton ? 'translateX(40%) translateY(0) scaleX(1)' : undefined,
                      }}
                    >
                      <motion.img
                        src={asset("/person2.png")}
                        alt="person2"
                        className="h-full w-auto"
                        style={{ objectFit: 'contain' }}
                        animate={showButton ? { y: 0 } : { y: [0, -4, 0, -3, 0] }}
                        transition={showButton ? {} : { duration: 0.5, repeat: Infinity }}
                      />
                    </motion.div>
                  </div>

                  {/* Back button - appears after people stop */}
                  <div className="mt-8" style={{ height: 60 }}>
                    <AnimatePresence>
                      {showButton && (
                        <motion.button
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
                          className="px-8 py-3.5 rounded-full font-body text-[16px] font-bold text-white"
                          style={{
                            background: 'linear-gradient(135deg, #E9C46A 0%, #D4A840 100%)',
                            boxShadow: '0 4px 16px rgba(233, 196, 106, 0.4)',
                          }}
                          onClick={() => navigate('/', { state: { buildingOpen: true } })}
                        >
                          回到日历
                        </motion.button>
                      )}
                    </AnimatePresence>
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
        @keyframes walk-person1 {
          0%   { transform: translateX(-55vw) translateY(-40vh) scaleX(1); }
          29%  { transform: translateX(-8vw) translateY(-33vh) scaleX(1); }
          30%  { transform: translateX(-5vw) translateY(-35vh) scaleX(-1); }
          69%  { transform: translateX(-42vw) translateY(12vh) scaleX(-1); }
          70%  { transform: translateX(-45vw) translateY(15vh) scaleX(1); }
          100% { transform: translateX(-40%) translateY(0) scaleX(1); }
        }
        @keyframes walk-person2 {
          0%   { transform: translateX(50vw) translateY(30vh) scaleX(-1); }
          39%  { transform: translateX(-32vw) translateY(22vh) scaleX(-1); }
          40%  { transform: translateX(-35vw) translateY(25vh) scaleX(1); }
          69%  { transform: translateX(27vw) translateY(-12vh) scaleX(1); }
          70%  { transform: translateX(30vw) translateY(-15vh) scaleX(1); }
          100% { transform: translateX(40%) translateY(0) scaleX(1); }
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