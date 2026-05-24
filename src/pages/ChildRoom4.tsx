import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router';

/* ═══════════════════════════════════════════
   Child Room 4 Page - 星空花园·写给RAY的一封信
   ═══════════════════════════════════════════ */

type Phase = 'travel' | 'garden' | 'dialog' | 'wish' | 'ending';

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

function playSparkleSound() {
  try {
    const ctx = getAudioCtx();
    // 创建一组上升的音调来模拟星星闪烁
    for (let i = 0; i < 5; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      const baseFreq = 600 + i * 200;
      osc.frequency.setValueAtTime(baseFreq, ctx.currentTime + i * 0.08);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 2, ctx.currentTime + i * 0.08 + 0.1);
      gain.gain.setValueAtTime(0.08, ctx.currentTime + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.15);
      osc.start(ctx.currentTime + i * 0.08);
      osc.stop(ctx.currentTime + i * 0.08 + 0.15);
    }
  } catch { /* ignore */ }
}

/* ── 许愿星星数据 ── */
const WISH_STARS = [
  { emoji: '⭐', angle: -70, dist: 70, delay: 0, size: 24 },
  { emoji: '✨', angle: -40, dist: 100, delay: 0.08, size: 20 },
  { emoji: '🌟', angle: -10, dist: 85, delay: 0.15, size: 26 },
  { emoji: '✨', angle: 20, dist: 110, delay: 0.05, size: 22 },
  { emoji: '⭐', angle: 50, dist: 75, delay: 0.12, size: 28 },
  { emoji: '💫', angle: 80, dist: 95, delay: 0.03, size: 20 },
  { emoji: '🌟', angle: 110, dist: 80, delay: 0.18, size: 24 },
  { emoji: '✨', angle: 140, dist: 105, delay: 0.1, size: 22 },
  { emoji: '⭐', angle: -130, dist: 90, delay: 0.07, size: 26 },
  { emoji: '💫', angle: -100, dist: 85, delay: 0.14, size: 20 },
];

/* ── 背景星星数据 ── */
const BG_STARS = [...Array(30)].map((_, i) => ({
  id: i,
  left: Math.random() * 100,
  top: Math.random() * 55,
  size: 1 + Math.random() * 2.5,
  delay: Math.random() * 4,
  duration: 2 + Math.random() * 3,
  opacity: 0.3 + Math.random() * 0.7,
}));

/* ── 对话文案 ── */
const DIALOG_INTRO = '25岁的RAY，你好呀～';

const DIALOG_PART1 = [
  '这是一封来自未来的信。',
  '25岁的你，是否已经成为了自己想成为的人？',
];

const DIALOG_PART2 = [
  '我相信无论你在哪里，',
  '一定都在闪闪发光。',
  '你的善良和坚持，一定会带你走到很远的地方。',
];

const DIALOG_PART3 = [
  '未来的路还很长，',
  '但请记住，',
  '总有人在你身后默默支持你、为你加油。',
];

/* ═══════════════════ 打字机效果 ═══════════════════ */

function TypewriterText({ text, speed = 80, onComplete }: { text: string; speed?: number; onComplete?: () => void }) {
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
    <span className="font-display text-[28px] leading-[1.8]" style={{ color: '#D4A574' }}>
      {displayed}
      <span style={{ opacity: cursorVisible ? 1 : 0, transition: 'opacity 0.2s', color: '#E9C46A' }}>|</span>
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

/* ═══════════════════ 花园背景 ═══════════════════ */

function GardenBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* 深蓝色夜空渐变 */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, #0a0e27 0%, #1a1f4b 25%, #24305a 50%, #2a3d5e 70%, #3d5a4c 100%)',
        }}
      />

      {/* 柔和的月光光晕 */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '5%',
          right: '15%',
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(244, 224, 170, 0.15) 0%, rgba(244, 224, 170, 0.05) 40%, transparent 70%)',
          animation: 'moon-glow 6s ease-in-out infinite',
        }}
      />

      {/* 星星闪烁 */}
      {BG_STARS.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            width: star.size,
            height: star.size,
            background: 'rgba(255, 250, 230, 0.9)',
            boxShadow: `0 0 ${star.size * 2}px rgba(244, 224, 170, 0.6), 0 0 ${star.size * 4}px rgba(244, 224, 170, 0.3)`,
            animation: `star-twinkle ${star.duration}s ease-in-out infinite ${star.delay}s`,
            opacity: star.opacity,
          }}
        />
      ))}

      {/* 远景山峦（CSS绘制） */}
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: '25%',
          left: 0,
          right: 0,
          height: 120,
          background: 'linear-gradient(180deg, transparent 0%, rgba(30, 40, 60, 0.6) 100%)',
          borderRadius: '50% 50% 0 0 / 80% 80% 0 0',
          transform: 'scaleX(1.5)',
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: '22%',
          left: '-10%',
          right: 0,
          height: 100,
          background: 'linear-gradient(180deg, transparent 0%, rgba(35, 50, 55, 0.5) 100%)',
          borderRadius: '60% 40% 0 0 / 100% 100% 0 0',
          transform: 'scaleX(1.8)',
        }}
      />

      {/* 花园小径 */}
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 120,
          height: '30%',
          background: 'linear-gradient(180deg, rgba(180, 160, 130, 0.2) 0%, rgba(160, 140, 110, 0.15) 100%)',
          clipPath: 'polygon(35% 0%, 65% 0%, 85% 100%, 15% 100%)',
        }}
      />

      {/* 小径上的石子装饰 */}
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute pointer-events-none rounded-full"
          style={{
            bottom: `${3 + i * 4}%`,
            left: `${48 + Math.sin(i * 1.5) * 8}%`,
            width: 4 + Math.random() * 4,
            height: 3 + Math.random() * 3,
            background: 'rgba(180, 165, 135, 0.4)',
          }}
        />
      ))}

      {/* 两侧的花园植物剪影 */}
      {/* 左侧灌木 */}
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: '12%',
          left: '-5%',
          width: 140,
          height: 80,
          background: 'radial-gradient(ellipse at 40% 80%, rgba(50, 70, 55, 0.5) 0%, transparent 70%)',
          borderRadius: '50%',
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: '8%',
          left: '5%',
          width: 60,
          height: 60,
          background: 'radial-gradient(circle, rgba(55, 75, 58, 0.45) 0%, transparent 70%)',
          borderRadius: '50%',
        }}
      />
      {/* 右侧灌木 */}
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: '10%',
          right: '-8%',
          width: 160,
          height: 90,
          background: 'radial-gradient(ellipse at 60% 80%, rgba(48, 68, 52, 0.5) 0%, transparent 70%)',
          borderRadius: '50%',
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: '6%',
          right: '3%',
          width: 70,
          height: 65,
          background: 'radial-gradient(circle, rgba(52, 72, 55, 0.4) 0%, transparent 70%)',
          borderRadius: '50%',
        }}
      />

      {/* 萤火虫效果 */}
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="absolute pointer-events-none rounded-full"
          style={{
            bottom: `${5 + Math.random() * 25}%`,
            left: `${5 + Math.random() * 90}%`,
            width: 3,
            height: 3,
            background: 'rgba(200, 220, 100, 0.8)',
            boxShadow: '0 0 6px rgba(200, 220, 100, 0.6), 0 0 12px rgba(200, 220, 100, 0.3)',
            animation: `firefly-glow ${3 + Math.random() * 2}s ease-in-out infinite ${Math.random() * 3}s, firefly-float ${6 + Math.random() * 4}s ease-in-out infinite ${Math.random() * 2}s`,
          }}
        />
      ))}

      {/* 底部草地 */}
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: 0,
          left: 0,
          right: 0,
          height: '15%',
          background: 'linear-gradient(180deg, rgba(50, 70, 55, 0.35) 0%, rgba(40, 60, 45, 0.5) 100%)',
          borderRadius: '50% 50% 0 0 / 20% 20% 0 0',
        }}
      />
    </div>
  );
}

/* ═══════════════════ 主组件 ═══════════════════ */

export default function ChildRoom4() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>('travel');
  const [travelProgress, setTravelProgress] = useState(0);

  // Dialog sub-states
  const [showIntro, setShowIntro] = useState(false);
  const [showPart1, setShowPart1] = useState(false);
  const [showPart2, setShowPart2] = useState(false);
  const [showPart3, setShowPart3] = useState(false);
  const [showWishButton, setShowWishButton] = useState(false);
  const [showWishStars, setShowWishStars] = useState(false);
  const [showEnding, setShowEnding] = useState(false);
  const [wishPlanted, setWishPlanted] = useState(false);

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
        setPhase('garden');
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [phase]);

  // ── Garden click → dialog ──
  const handleGardenClick = useCallback(() => {
    if (phase === 'garden') {
      setPhase('dialog');
      setTimeout(() => setShowIntro(true), 500);
    }
  }, [phase]);

  // ── Intro typewriter complete → Part1 ──
  const handleIntroComplete = useCallback(() => {
    setTimeout(() => {
      setShowIntro(false);
      setTimeout(() => setShowPart1(true), 500);
    }, 1500);
  }, []);

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

  // ── Part3 → Wish button ──
  const handlePart3Complete = useCallback(() => {
    setTimeout(() => setShowWishButton(true), 1500);
  }, []);

  // ── Click wish → Wish stars ──
  const handlePlantWish = useCallback(() => {
    playPopSound();
    playSparkleSound();
    setPhase('wish');
    setShowWishButton(false);
    setShowPart3(false);
    setWishPlanted(true);
    setTimeout(() => {
      setShowWishStars(true);
    }, 100);
  }, []);

  // ── Wish stars complete → Ending ──
  useEffect(() => {
    if (!showWishStars) return;
    const timer = setTimeout(() => {
      setShowEnding(true);
      setPhase('ending');
    }, 2000);
    return () => clearTimeout(timer);
  }, [showWishStars]);

  /* ═══════════════════ RENDER ═══════════════════ */

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ background: '#0a0e27' }}>
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
                    border: '2px solid rgba(212, 165, 116, 0.4)',
                    animation: `spin ${2 + i * 0.5}s linear infinite ${i % 2 === 0 ? '' : 'reverse'}`,
                    opacity: 1 - travelProgress * 0.5,
                    boxShadow: '0 0 20px rgba(212, 165, 116, 0.2), inset 0 0 20px rgba(244, 162, 97, 0.1)',
                  }}
                />
              ))}
              <div
                className="absolute rounded-full"
                style={{
                  width: 100 + travelProgress * 200,
                  height: 100 + travelProgress * 200,
                  background: `radial-gradient(circle, rgba(212,165,116,${0.3 + travelProgress * 0.4}) 0%, rgba(244,162,97,${travelProgress * 0.2}) 40%, transparent 70%)`,
                }}
              />
            </div>
            <motion.p
              className="absolute font-display text-[18px] z-10"
              style={{ color: '#E9C46A' }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              穿越星空...
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== GARDEN + DIALOG + WISH + ENDING ===== */}
      <AnimatePresence>
        {phase !== 'travel' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0"
            onClick={handleGardenClick}
          >
            {/* Garden Background */}
            <GardenBackground />

            {/* White overlay for dialog phases */}
            <AnimatePresence>
              {(phase === 'dialog' || phase === 'wish' || phase === 'ending') && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.2 }}
                  className="absolute inset-0 z-20"
                  style={{ background: 'rgba(10, 14, 39, 0.55)' }}
                />
              )}
            </AnimatePresence>

            {/* ═══ DIALOG CONTENT ═══ */}
            <AnimatePresence>
              {phase === 'dialog' && (
                <div
                  className="absolute inset-0 z-30 flex flex-col items-center justify-start px-6 py-10 gap-6"
                  style={{ paddingTop: '30%' }}
                >
                  {/* Intro typewriter */}
                  <AnimatePresence>
                    {showIntro && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                      >
                        <div className="flex items-center justify-center" style={{ minHeight: 100 }}>
                          <TypewriterText
                            text={DIALOG_INTRO}
                            speed={80}
                            onComplete={handleIntroComplete}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Glassmorphism card */}
                  <div
                    className="relative w-full max-w-[360px] rounded-3xl px-7 py-8 text-center overflow-hidden"
                    style={{
                      background: 'rgba(255, 253, 248, 0.45)',
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)',
                      borderRadius: 24,
                      boxShadow: '0 8px 32px rgba(212, 165, 116, 0.08), inset 0 1px 0 rgba(255,255,255,0.6)',
                      minHeight: 200,
                      opacity: (showPart1 || showPart2 || showPart3) ? 1 : 0,
                      transition: 'opacity 0.8s ease',
                    }}
                  >
                    {/* Warm breathing glow */}
                    <div
                      className="absolute inset-0 rounded-3xl pointer-events-none"
                      style={{
                        background: 'radial-gradient(ellipse at 50% 30%, rgba(233, 196, 106, 0.15) 0%, transparent 70%)',
                        animation: 'breathe 4s ease-in-out infinite',
                      }}
                    />

                    {/* Text container */}
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

                  {/* Wish button */}
                  <div style={{ minHeight: 52 }}>
                    <AnimatePresence>
                      {showWishButton && (
                        <motion.button
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 1 }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="relative px-7 py-3.5 rounded-full font-body text-[15px] font-bold overflow-hidden"
                          style={{
                            color: '#5A4A3A',
                            background: 'linear-gradient(135deg, rgba(233, 196, 106, 0.8) 0%, rgba(244, 162, 97, 0.7) 100%)',
                            backdropFilter: 'blur(8px)',
                            boxShadow: '0 2px 16px rgba(212, 165, 116, 0.3), 0 0 40px rgba(233, 196, 106, 0.15), inset 0 1px 0 rgba(255,255,255,0.6)',
                            border: '1px solid rgba(255,255,255,0.5)',
                            textShadow: '0 1px 2px rgba(255,255,255,0.8)',
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePlantWish();
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
                          <span className="relative z-10">🌟 种下愿望 🌟</span>
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )}
            </AnimatePresence>

            {/* ── WISH PHASE: Stars ── */}
            <AnimatePresence>
              {(phase === 'wish' || phase === 'ending') && (
                <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
                  {/* Central wish star */}
                  <AnimatePresence>
                    {wishPlanted && (
                      <motion.div
                        initial={{ scale: 0, rotate: -30 }}
                        animate={{ scale: [0, 1.5, 1], rotate: [0, 15, 0] }}
                        transition={{
                          duration: 1,
                          ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
                        }}
                        className="relative"
                        style={{ fontSize: 80, filter: 'drop-shadow(0 4px 20px rgba(244, 162, 97, 0.5))' }}
                      >
                        🌟
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Scattering wish stars */}
                  {showWishStars &&
                    WISH_STARS.map((s, i) => {
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
                            y: y - 60, // 向上飘的效果
                            opacity: [1, 1, 0.6],
                          }}
                          transition={{
                            duration: 1.2,
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

                  {/* 向上飘的金色粒子 */}
                  {showWishStars &&
                    [...Array(12)].map((_, i) => (
                      <motion.div
                        key={`particle-${i}`}
                        initial={{
                          scale: 0,
                          x: 0,
                          y: 20,
                          opacity: 1,
                        }}
                        animate={{
                          scale: [0, 1, 0.5],
                          x: (Math.random() - 0.5) * 150,
                          y: -180 - Math.random() * 120,
                          opacity: [1, 0.8, 0],
                        }}
                        transition={{
                          duration: 2 + Math.random(),
                          delay: i * 0.08,
                          ease: 'easeOut',
                        }}
                        className="absolute pointer-events-none rounded-full"
                        style={{
                          width: 3 + Math.random() * 4,
                          height: 3 + Math.random() * 4,
                          background: i % 3 === 0 ? '#E9C46A' : i % 3 === 1 ? '#F4A261' : '#D4A574',
                          boxShadow: `0 0 8px ${i % 3 === 0 ? 'rgba(233,196,106,0.8)' : i % 3 === 1 ? 'rgba(244,162,97,0.8)' : 'rgba(212,165,116,0.8)'}`,
                          zIndex: 45,
                        }}
                      />
                    ))}
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
                  {/* Glassmorphism ending card */}
                  <div
                    className="rounded-2xl px-8 py-6 text-center"
                    style={{
                      background: 'rgba(255, 253, 248, 0.5)',
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1), 0 0 60px rgba(212, 165, 116, 0.15), inset 0 1px 0 rgba(255,255,255,0.6)',
                      maxWidth: 320,
                      width: '100%',
                    }}
                  >
                    <motion.p
                      className="font-display text-[22px] leading-[1.6] font-bold"
                      style={{ color: '#B8860B' }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8, duration: 1 }}
                    >
                      愿所有美好如期而至 ✨
                    </motion.p>
                    <motion.p
                      className="font-body text-[14px] leading-[1.8] mt-3"
                      style={{ color: '#6B5B3E' }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.5, duration: 1 }}
                    >
                      你的愿望已被种在星空下
                    </motion.p>
                  </div>

                  {/* Back button */}
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2.5, duration: 0.8 }}
                    className="mt-6 px-6 py-3 rounded-full font-body text-[15px] font-bold text-white"
                    style={{
                      background: 'linear-gradient(135deg, #D4A574 0%, #E9C46A 100%)',
                      boxShadow: '0 4px 12px rgba(212, 165, 116, 0.4), 0 0 20px rgba(233, 196, 106, 0.2)',
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

            {/* 点击提示（仅在garden阶段显示） */}
            <AnimatePresence>
              {phase === 'garden' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: 1, duration: 1 }}
                  className="absolute bottom-[12%] inset-x-0 z-10 flex justify-center"
                >
                  <motion.p
                    className="font-body text-[14px]"
                    style={{ color: 'rgba(244, 224, 170, 0.7)', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}
                    animate={{ opacity: [0.4, 0.9, 0.4] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    轻触屏幕，打开来自未来的信 💫
                  </motion.p>
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
        @keyframes star-twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes moon-glow {
          0%, 100% { opacity: 0.8; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        @keyframes firefly-glow {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 1; }
        }
        @keyframes firefly-float {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(10px, -8px); }
          50% { transform: translate(-5px, -15px); }
          75% { transform: translate(-12px, -5px); }
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
