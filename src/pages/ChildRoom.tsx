import { asset } from "@/lib/assets";
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router';

/* ═══════════════════════════════════════════
   Child Room Page - 时光机 → 儿童房 → 对话 → 奖章
   ═══════════════════════════════════════════ */

type Phase = 'travel' | 'room' | 'dialog' | 'medal' | 'ending';

/* ── Web Audio 音效 ── */
let audioCtx: AudioContext | null = null;

function getAudioCtx() {
  if (!audioCtx) audioCtx = new AudioContext();
  return audioCtx;
}

function playPopSound() {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.2);
  } catch { /* ignore */ }
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

/* ── 贴纸爆开数据 ── */
const STICKERS = [
  { emoji: '⭐', angle: -60, dist: 80, delay: 0, size: 28 },
  { emoji: '🌸', angle: -30, dist: 110, delay: 0.05, size: 24 },
  { emoji: '🌈', angle: 0, dist: 95, delay: 0.1, size: 32 },
  { emoji: '🐱', angle: 30, dist: 100, delay: 0.08, size: 26 },
  { emoji: '✨', angle: 60, dist: 85, delay: 0.03, size: 22 },
  { emoji: '💫', angle: 90, dist: 75, delay: 0.12, size: 24 },
  { emoji: '🌟', angle: 120, dist: 105, delay: 0.06, size: 26 },
  { emoji: '🌼', angle: 150, dist: 80, delay: 0.09, size: 22 },
  { emoji: '💖', angle: 180, dist: 90, delay: 0.04, size: 24 },
  { emoji: '🎀', angle: -120, dist: 95, delay: 0.11, size: 26 },
  { emoji: '🌙', angle: -150, dist: 85, delay: 0.07, size: 22 },
  { emoji: '🍀', angle: -90, dist: 100, delay: 0.02, size: 24 },
];

/* ── 对话文案 ── */
const DIALOG_INTRO: string[] = [
  '5岁的小陈蕊，你好呀～',
  '今天是儿童节，\n所以先来找你玩！',
];

const DIALOG_PART1: string[] = [
  '听说幼儿园的时候，',
  '你听到老师在背后议论',
  '别的小朋友的家长。',
];

const DIALOG_PART2: string[] = [
  '你有点害怕，',
  '怕老师也会这样议论妈妈。',
];

const DIALOG_PART3: string[] = [
  '不过我觉得，',
  '会因为这种事悄悄担心的你，',
  '是很细腻也很勇敢的小朋友。',
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

  const lines = displayed.split('\n');

  return (
    <span className="font-display text-[28px] leading-[1.8]" style={{ color: '#2c5282' }}>
      {lines.map((line, i) => (
        <span key={i}>
          {i > 0 && <br />}
          {line}
        </span>
      ))}
      <span style={{ opacity: cursorVisible ? 1 : 0, transition: 'opacity 0.2s', color: '#6B9AC4' }}>|</span>
    </span>
  );
}

/* ═══════════════════ 逐句淡入段落 ═══════════════════ */

function FadeParagraph({
  lines,
  onComplete,
  visible,
}: {
  lines: string[];
  onComplete?: () => void;
  visible: boolean;
}) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          {lines.map((line, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: i * 1.8 }}
              className="font-body text-[17px] leading-[2.2]"
              style={{ color: '#2D3748' }}
              onAnimationComplete={i === lines.length - 1 ? onComplete : undefined}
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

export default function ChildRoom() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>('travel');
  const [travelProgress, setTravelProgress] = useState(0);

  // Dialog sub-states
  const [introIndex, setIntroIndex] = useState(0);
  const [showIntro, setShowIntro] = useState(false);
  const [showPart1, setShowPart1] = useState(false);
  const [showPart2, setShowPart2] = useState(false);
  const [showPart3, setShowPart3] = useState(false);
  const [showRewardButton, setShowRewardButton] = useState(false);
  const [showMedal, setShowMedal] = useState(false);
  const [showStickers, setShowStickers] = useState(false);
  const [showEnding, setShowEnding] = useState(false);
  const [windowBright, setWindowBright] = useState(false);

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
        setPhase('room');
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [phase]);

  // ── Room click → dialog ──
  const handleRoomClick = useCallback(() => {
    if (phase === 'room') {
      setPhase('dialog');
      setTimeout(() => setShowIntro(true), 500);
    }
  }, [phase]);

  // ── Intro typewriter chain ──
  const handleIntroComplete = useCallback(() => {
    if (introIndex === 0) {
      setTimeout(() => setIntroIndex(1), 1000);
    } else if (introIndex === 1) {
      setTimeout(() => {
        setShowIntro(false);
        setTimeout(() => setShowPart1(true), 500);
      }, 1800);
    }
  }, [introIndex]);

  // ── Part1 → fade out → Part2 ──
  const handlePart1Complete = useCallback(() => {
    setTimeout(() => {
      setShowPart1(false);
      setTimeout(() => setShowPart2(true), 800);
    }, 1200);
  }, []);

  // ── Part2 → fade out → Part3 ──
  const handlePart2Complete = useCallback(() => {
    setTimeout(() => {
      setShowPart2(false);
      setTimeout(() => setShowPart3(true), 800);
    }, 1200);
  }, []);

  // ── Part3 → Reward button ──
  const handlePart3Complete = useCallback(() => {
    setTimeout(() => setShowRewardButton(true), 1500);
  }, []);

  // ── Click reward → Medal ──
  const handleClaimReward = useCallback(() => {
    playPopSound();
    setPhase('medal');
    setShowRewardButton(false);
    setShowPart3(false);
    setTimeout(() => {
      setShowMedal(true);
      setTimeout(() => setShowStickers(true), 200);
    }, 100);
  }, []);

  // ── Medal complete → Ending ──
  useEffect(() => {
    if (!showStickers) return;
    const timer = setTimeout(() => {
      setShowEnding(true);
      setWindowBright(true);
      setPhase('ending');
    }, 1000);
    return () => clearTimeout(timer);
  }, [showStickers]);

  /* ═══════════════════ RENDER ═══════════════════ */

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ background: '#1a1a2e' }}>
      {/* ===== PHASE: TIME TRAVEL ===== */}
      <AnimatePresence>
        {phase === 'travel' && (
          <motion.div
            className="absolute inset-0 z-50 flex items-center justify-center"
            style={{ background: '#0a0a1a' }}
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
                    border: '2px solid rgba(107, 154, 196, 0.4)',
                    animation: `spin ${2 + i * 0.5}s linear infinite ${i % 2 === 0 ? '' : 'reverse'}`,
                    opacity: 1 - travelProgress * 0.5,
                    boxShadow: '0 0 20px rgba(107, 154, 196, 0.2), inset 0 0 20px rgba(233, 196, 90, 0.1)',
                  }}
                />
              ))}
              <div
                className="absolute rounded-full"
                style={{
                  width: 100 + travelProgress * 200,
                  height: 100 + travelProgress * 200,
                  background: `radial-gradient(circle, rgba(107,154,196,${0.3 + travelProgress * 0.4}) 0%, rgba(233,196,90,${travelProgress * 0.2}) 40%, transparent 70%)`,
                }}
              />
            </div>
            <motion.p
              className="absolute font-display text-[18px] z-10"
              style={{ color: '#B8D4E8' }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              时光穿梭中...
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== PHASE: ROOM + DIALOG + MEDAL + ENDING ===== */}
      <AnimatePresence>
        {phase !== 'travel' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0"
            onClick={handleRoomClick}
          >
            {/* Room Background */}
            <div className="absolute inset-0">
              <img
                src={asset("/child-room-night.png")}
                alt="儿童房"
                className="w-full h-full object-cover"
                style={{
                  filter: windowBright ? 'brightness(1.15)' : 'brightness(0.9)',
                  transition: 'filter 3s ease',
                }}
              />
            </div>

            {/* Window Light Glow */}
            <div
              className="absolute"
              style={{
                top: '8%',
                left: '8%',
                width: '40%',
                height: '25%',
                background: 'radial-gradient(ellipse, rgba(255,230,150,0.25) 0%, transparent 70%)',
                animation: 'window-flicker 4s ease-in-out infinite',
                opacity: windowBright ? 0.8 : 0.5,
                transition: 'opacity 3s ease',
              }}
            />

            {/* Orange Cat */}
            <motion.div
              className="absolute pointer-events-none"
              style={{ bottom: '8%', left: '5%', width: 80 }}
              animate={{ y: [0, -3, 0], scale: [1, 1.02, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <img src={asset("/cat-orange-sleeping.png")} alt="橘猫" className="w-full object-contain" draggable={false} />
            </motion.div>

            {/* Grey-White Cat */}
            <motion.div
              className="absolute pointer-events-none"
              style={{ bottom: '10%', right: '8%', width: 70 }}
              animate={{ y: [0, -2, 0], rotate: [-2, 2, -2] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <img src={asset("/cat-greywhite-playing.png")} alt="灰白小猫" className="w-full object-contain" draggable={false} />
            </motion.div>

            {/* White overlay */}
            <AnimatePresence>
              {(phase === 'dialog' || phase === 'medal' || phase === 'ending') && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 z-20"
                  style={{ background: 'rgba(255, 255, 255, 0.6)' }}
                />
              )}
            </AnimatePresence>

            {/* ═══ DIALOG CONTENT ═══ */}
            <AnimatePresence>
              {phase === 'dialog' && (
                <div className="absolute inset-0 z-30 flex flex-col items-center justify-start px-6 py-10 gap-6" style={{ paddingTop: '35%' }}>
                  {/* Intro typewriter (outside card) */}
                  <AnimatePresence>
                    {showIntro && introIndex < 2 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                      >
                        <div className="flex items-center justify-center" style={{ minHeight: 100 }}>
                          <TypewriterText
                            key={introIndex}
                            text={DIALOG_INTRO[introIndex]}
                            speed={85}
                            onComplete={handleIntroComplete}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Glassmorphism card - ALWAYS visible once Part 1 starts, NEVER fades */}
                  <div
                    className="relative w-full max-w-[360px] rounded-3xl px-7 py-8 text-center overflow-hidden"
                    style={{
                      background: 'rgba(255, 253, 248, 0.45)',
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)',
                      borderRadius: 24,
                      boxShadow: '0 8px 32px rgba(107, 154, 196, 0.08), inset 0 1px 0 rgba(255,255,255,0.6)',
                      minHeight: 200,
                      opacity: (showPart1 || showPart2 || showPart3) ? 1 : 0,
                      transition: 'opacity 0.8s ease',
                    }}
                  >
                    {/* Breathing glow */}
                    <div
                      className="absolute inset-0 rounded-3xl pointer-events-none"
                      style={{
                        background: 'radial-gradient(ellipse at 50% 30%, rgba(255,230,180,0.15) 0%, transparent 70%)',
                        animation: 'breathe 4s ease-in-out infinite',
                      }}
                    />

                    {/* Text container - fixed height, centered text */}
                    <div className="relative z-10 flex flex-col items-center justify-center" style={{ minHeight: 160 }}>
                      {/* Part 1 */}
                      <FadeParagraph
                        lines={DIALOG_PART1}
                        visible={showPart1}
                        onComplete={handlePart1Complete}
                      />

                      {/* Part 2 */}
                      <FadeParagraph
                        lines={DIALOG_PART2}
                        visible={showPart2}
                        onComplete={handlePart2Complete}
                      />

                      {/* Part 3 */}
                      <FadeParagraph
                        lines={DIALOG_PART3}
                        visible={showPart3}
                        onComplete={handlePart3Complete}
                      />
                    </div>
                  </div>

                  {/* Night-light button - OUTSIDE card, separate space */}
                  <div style={{ minHeight: 52 }}>
                    <AnimatePresence>
                      {showRewardButton && (
                        <motion.button
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 1 }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="relative px-7 py-3.5 rounded-full font-body text-[15px] font-bold overflow-hidden"
                          style={{
                            color: '#5A4A3A',
                            background: 'linear-gradient(135deg, rgba(255,250,240,0.8) 0%, rgba(255,245,220,0.7) 100%)',
                            backdropFilter: 'blur(8px)',
                            boxShadow: '0 2px 16px rgba(233, 196, 90, 0.2), 0 0 40px rgba(255,230,180,0.15), inset 0 1px 0 rgba(255,255,255,0.8)',
                            border: '1px solid rgba(255,255,255,0.5)',
                            textShadow: '0 1px 2px rgba(255,255,255,0.8)',
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleClaimReward();
                          }}
                        >
                          {/* Button glow pulse */}
                          <span
                            className="absolute inset-0 rounded-full pointer-events-none"
                            style={{
                              background: 'radial-gradient(circle at 50% 50%, rgba(255,230,180,0.3) 0%, transparent 70%)',
                              animation: 'glow-pulse 3s ease-in-out infinite',
                            }}
                          />
                          <span className="relative z-10">来领取你的儿童节奖励 ✨</span>
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )}
            </AnimatePresence>

            {/* ── MEDAL PHASE ── */}
            <AnimatePresence>
              {(phase === 'medal' || phase === 'ending') && (
                <div className="absolute inset-0 z-30 flex items-center justify-center">
                  <AnimatePresence>
                    {showMedal && (
                      <motion.div
                        initial={{ scale: 0, rotate: -20 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{
                          type: 'spring',
                          damping: 12,
                          stiffness: 200,
                          delay: 0.1,
                        }}
                        className="relative"
                        style={{ width: 220, height: 220 }}
                      >
                        <img
                          src={asset("/medal-brave.png")}
                          alt="六一限定·勇敢小朋友"
                          className="w-full h-full object-contain"
                          draggable={false}
                          style={{
                            filter: 'drop-shadow(0 8px 24px rgba(244, 162, 97, 0.4))',
                          }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {showStickers &&
                    STICKERS.map((s, i) => {
                      const rad = (s.angle * Math.PI) / 180;
                      const x = Math.cos(rad) * s.dist;
                      const y = Math.sin(rad) * s.dist;
                      return (
                        <motion.div
                          key={i}
                          initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
                          animate={{
                            scale: [0, 1.3, 1],
                            x,
                            y,
                            opacity: [1, 1, 0.8],
                          }}
                          transition={{
                            duration: 0.8,
                            delay: s.delay,
                            ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
                          }}
                          className="absolute pointer-events-none"
                          style={{ fontSize: s.size, zIndex: 50 }}
                        >
                          {s.emoji}
                        </motion.div>
                      );
                    })}
                </div>
              )}
            </AnimatePresence>

            {/* ── ENDING TEXT ── */}
            <AnimatePresence>
              {showEnding && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.5, delay: 0.5 }}
                  className="absolute inset-x-0 bottom-[8%] z-30 flex flex-col items-center justify-center px-6"
                >
                  {/* White card - centered */}
                  <div
                    className="rounded-2xl px-8 py-5 text-center"
                    style={{
                      background: 'rgba(255, 255, 255, 0.92)',
                      backdropFilter: 'blur(6px)',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                      maxWidth: 320,
                      width: '100%',
                    }}
                  >
                    <p
                      className="font-display text-[22px] leading-[1.6] font-bold"
                      style={{ color: '#2c5282' }}
                    >
                      六一限定·勇敢小朋友
                    </p>
                    <p
                      className="font-body text-[15px] leading-[1.8] mt-3"
                      style={{ color: '#4a5568' }}
                    >
                      记得找我领取奖励哦
                    </p>
                  </div>

                  {/* Back button - bottom center */}
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2 }}
                    className="mt-6 px-6 py-3 rounded-full font-body text-[15px] font-bold text-white"
                    style={{
                      background: 'linear-gradient(135deg, #6B9AC4 0%, #5A8AB4 100%)',
                      boxShadow: '0 4px 12px rgba(107, 154, 196, 0.35)',
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/', { state: { buildingOpen: true } });
                    }}
                  >
                    回到日历
                  </motion.button>
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
        @keyframes window-flicker {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.8; }
        }
        @keyframes breathe {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        @keyframes glow-pulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}
