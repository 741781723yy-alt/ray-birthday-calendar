import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router';

/* ═══════════════════════════════════════════
   Child Room 10 Page - 十天倒计时回顾
   秋日森林 · 回忆 · 感恩 · 温暖
   ═══════════════════════════════════════════ */

type Phase = 'travel' | 'forest' | 'dialog' | 'collect' | 'ending';

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

function playChimeSound() {
  try {
    const ctx = getAudioCtx();
    // 柔和的三音阶铃声
    const notes = [523, 659, 784]; // C5, E5, G5
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.15);
      gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.15);
      gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + i * 0.15 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.15 + 0.8);
      osc.start(ctx.currentTime + i * 0.15);
      osc.stop(ctx.currentTime + i * 0.15 + 0.8);
    });
  } catch { /* ignore */ }
}

/* ── 心形叶子飘落的初始数据 ── */
const HEART_LEAVES = [
  { emoji: '🍃', angle: -70, dist: 90, delay: 0, size: 26 },
  { emoji: '🍂', angle: -40, dist: 120, delay: 0.08, size: 28 },
  { emoji: '💚', angle: -10, dist: 100, delay: 0.03, size: 24 },
  { emoji: '🍁', angle: 20, dist: 110, delay: 0.12, size: 30 },
  { emoji: '🍃', angle: 50, dist: 85, delay: 0.06, size: 22 },
  { emoji: '💚', angle: 80, dist: 95, delay: 0.15, size: 26 },
  { emoji: '🍂', angle: 110, dist: 105, delay: 0.09, size: 24 },
  { emoji: '🍁', angle: 140, dist: 80, delay: 0.05, size: 28 },
  { emoji: '💚', angle: 170, dist: 115, delay: 0.11, size: 22 },
  { emoji: '🍃', angle: -100, dist: 88, delay: 0.07, size: 26 },
  { emoji: '🍂', angle: -130, dist: 98, delay: 0.14, size: 24 },
  { emoji: '🍁', angle: -160, dist: 75, delay: 0.02, size: 28 },
];

/* ── 对话文案 ── */
const DIALOG_CARDS: string[][] = [
  ['这十天里，我们一起走过了时光的长廊。', '从5岁的童真到15岁的青春，', '每一段记忆都如此珍贵。'],
  ['感谢你的每一天，', '感谢你的每一次笑容。', '这个世界因为有你而变得更加美好。'],
  ['还有最后两天，', '最特别的惊喜正在等着你。', '生日快乐，亲爱的RAY！'],
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
    <span className="font-display text-[28px] leading-[1.8]" style={{ color: '#4A6741' }}>
      {displayed}
      <span style={{ opacity: cursorVisible ? 1 : 0, transition: 'opacity 0.2s', color: '#8FB883' }}>|</span>
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

/* ═══════════════════ 秋日森林背景 ═══════════════════ */

function AutumnForestBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* 秋日天空渐变 */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, #F5D0A9 0%, #F8E4C6 30%, #EDE4D3 60%, #D4E4C4 100%)',
        }}
      />

      {/* 温暖的太阳光晕 */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          top: '5%',
          right: '15%',
          width: 100,
          height: 100,
          background: 'radial-gradient(circle, rgba(255,220,150,0.5) 0%, rgba(255,200,120,0.2) 40%, transparent 70%)',
          animation: 'sun-glow 6s ease-in-out infinite',
        }}
      />

      {/* 远山轮廓 */}
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: '25%',
          left: 0,
          right: 0,
          height: '30%',
          background: 'linear-gradient(180deg, transparent 0%, rgba(176, 196, 160, 0.3) 50%, rgba(143, 184, 131, 0.4) 100%)',
          clipPath: 'polygon(0% 100%, 0% 60%, 15% 40%, 30% 55%, 45% 35%, 60% 50%, 75% 30%, 90% 45%, 100% 25%, 100% 100%)',
        }}
      />

      {/* 森林轮廓 - 三角形树木 */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{ height: '40%' }}>
        {/* 后排树木（较暗、较小） */}
        {[
          { left: '5%', bottom: '30%', size: 50, color: 'rgba(126, 168, 114, 0.6)' },
          { left: '18%', bottom: '25%', size: 65, color: 'rgba(107, 150, 95, 0.55)' },
          { left: '32%', bottom: '32%', size: 45, color: 'rgba(126, 168, 114, 0.5)' },
          { left: '48%', bottom: '28%', size: 70, color: 'rgba(100, 145, 88, 0.6)' },
          { left: '62%', bottom: '35%', size: 40, color: 'rgba(126, 168, 114, 0.5)' },
          { left: '75%', bottom: '22%', size: 60, color: 'rgba(107, 150, 95, 0.55)' },
          { left: '88%', bottom: '30%', size: 55, color: 'rgba(100, 145, 88, 0.5)' },
        ].map((tree, i) => (
          <div
            key={`back-${i}`}
            className="absolute"
            style={{
              left: tree.left,
              bottom: tree.bottom,
              width: 0,
              height: 0,
              borderLeft: `${tree.size / 2}px solid transparent`,
              borderRight: `${tree.size / 2}px solid transparent`,
              borderBottom: `${tree.size}px solid ${tree.color}`,
            }}
          />
        ))}

        {/* 前排树木（较大、较亮） */}
        {[
          { left: '-5%', bottom: '10%', size: 100, color: 'rgba(74, 103, 65, 0.7)' },
          { left: '12%', bottom: '5%', size: 130, color: 'rgba(84, 118, 73, 0.75)' },
          { left: '28%', bottom: '12%', size: 90, color: 'rgba(74, 103, 65, 0.65)' },
          { left: '42%', bottom: '0%', size: 150, color: 'rgba(64, 95, 56, 0.8)' },
          { left: '58%', bottom: '8%', size: 110, color: 'rgba(74, 103, 65, 0.7)' },
          { left: '72%', bottom: '15%', size: 85, color: 'rgba(84, 118, 73, 0.65)' },
          { left: '85%', bottom: '5%', size: 120, color: 'rgba(64, 95, 56, 0.75)' },
          { left: '95%', bottom: '10%', size: 100, color: 'rgba(74, 103, 65, 0.7)' },
        ].map((tree, i) => (
          <div
            key={`front-${i}`}
            className="absolute"
            style={{
              left: tree.left,
              bottom: tree.bottom,
              width: 0,
              height: 0,
              borderLeft: `${tree.size / 2}px solid transparent`,
              borderRight: `${tree.size / 2}px solid transparent`,
              borderBottom: `${tree.size}px solid ${tree.color}`,
            }}
          />
        ))}

        {/* 树干 */}
        {[
          { left: '47%', bottom: '0%', width: 10, height: 40, color: 'rgba(120, 95, 75, 0.6)' },
          { left: '17%', bottom: '0%', width: 8, height: 30, color: 'rgba(120, 95, 75, 0.5)' },
          { left: '90%', bottom: '0%', width: 9, height: 35, color: 'rgba(120, 95, 75, 0.55)' },
        ].map((trunk, i) => (
          <div
            key={`trunk-${i}`}
            className="absolute"
            style={{
              left: trunk.left,
              bottom: trunk.bottom,
              width: trunk.width,
              height: trunk.height,
              background: trunk.color,
              borderRadius: 2,
            }}
          />
        ))}
      </div>

      {/* 地面草地 */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{
          height: '12%',
          background: 'linear-gradient(180deg, rgba(143, 184, 131, 0.5) 0%, rgba(126, 168, 114, 0.7) 100%)',
        }}
      />

      {/* 飘落的树叶 */}
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute pointer-events-none"
          style={{
            width: 10 + i * 3,
            height: 10 + i * 3,
            borderRadius: i % 2 === 0 ? '50% 0 50% 0' : '0 50% 0 50%',
            background: i % 3 === 0
              ? `rgba(200, 140, 80, ${0.4 + i * 0.05})`
              : i % 3 === 1
                ? `rgba(180, 120, 60, ${0.35 + i * 0.05})`
                : `rgba(143, 184, 131, ${0.4 + i * 0.05})`,
            top: `${-10 - i * 12}%`,
            left: `${10 + i * 16}%`,
            animation: `leaf-fall ${6 + i * 1.5}s linear infinite`,
            animationDelay: `${i * 2}s`,
          }}
        />
      ))}

      {/* 微风中的草丛摇曳 */}
      {[...Array(8)].map((_, i) => (
        <div
          key={`grass-${i}`}
          className="absolute pointer-events-none"
          style={{
            bottom: `${3 + (i % 3) * 3}%`,
            left: `${5 + i * 12}%`,
            width: 3,
            height: 12 + (i % 4) * 4,
            background: `rgba(126, 168, 114, ${0.3 + (i % 3) * 0.1})`,
            borderRadius: '50% 50% 0 0',
            transformOrigin: 'bottom center',
            animation: `grass-sway ${3 + i * 0.5}s ease-in-out infinite`,
            animationDelay: `${i * 0.3}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ═══════════════════ 主组件 ═══════════════════ */

export default function ChildRoom10() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>('travel');
  const [travelProgress, setTravelProgress] = useState(0);

  // Dialog sub-states
  const [showTypewriter, setShowTypewriter] = useState(false);
  const [showCard0, setShowCard0] = useState(false);
  const [showCard1, setShowCard1] = useState(false);
  const [showCard2, setShowCard2] = useState(false);
  const [showCollectButton, setShowCollectButton] = useState(false);

  // Collect & ending states
  const [showHeartLeaves, setShowHeartLeaves] = useState(false);
  const [showEnding, setShowEnding] = useState(false);

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
        setPhase('forest');
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [phase]);

  // ── Forest click → dialog ──
  const handleForestClick = useCallback(() => {
    if (phase === 'forest') {
      setPhase('dialog');
      setTimeout(() => setShowTypewriter(true), 500);
    }
  }, [phase]);

  // ── Typewriter done → fade out → cards ──
  const handleTypewriterDone = useCallback(() => {
    setTimeout(() => {
      setShowTypewriter(false);
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
      setShowCollectButton(true);
    }, 1500);
  }, []);

  // ── Click collect → heart leaves → ending ──
  const handleCollectMemories = useCallback(() => {
    playChimeSound();
    setShowCollectButton(false);
    setShowCard2(false);
    setPhase('collect');
    setTimeout(() => {
      setShowHeartLeaves(true);
      setTimeout(() => setShowEnding(true), 1200);
    }, 100);
  }, []);

  /* ═══════════════════ RENDER ═══════════════════ */

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ background: '#1a1a2e' }}>
      {/* ===== PHASE: TIME TRAVEL ===== */}
      <AnimatePresence>
        {phase === 'travel' && (
          <motion.div
            className="absolute inset-0 z-50 flex items-center justify-center"
            style={{ background: '#0f1f0f' }}
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
                    boxShadow: '0 0 20px rgba(143, 184, 131, 0.2), inset 0 0 20px rgba(180, 220, 160, 0.1)',
                  }}
                />
              ))}
              <div
                className="absolute rounded-full"
                style={{
                  width: 100 + travelProgress * 200,
                  height: 100 + travelProgress * 200,
                  background: `radial-gradient(circle, rgba(143,184,131,${0.3 + travelProgress * 0.4}) 0%, rgba(200,160,100,${travelProgress * 0.2}) 40%, transparent 70%)`,
                }}
              />
            </div>
            <motion.p
              className="absolute font-display text-[18px] z-10"
              style={{ color: '#C8E0B8' }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              时光穿梭中...
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== PHASE: FOREST + DIALOG + COLLECT + ENDING ===== */}
      <AnimatePresence>
        {phase !== 'travel' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0"
            onClick={handleForestClick}
          >
            {/* 秋日森林背景 */}
            <AutumnForestBackground />

            {/* 白色遮罩层（对话阶段） */}
            <AnimatePresence>
              {(phase === 'dialog' || phase === 'collect') && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 z-20"
                  style={{ background: 'rgba(255, 252, 245, 0.55)' }}
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
                      text="倒计时已经第十天了～"
                      speed={80}
                      onComplete={handleTypewriterDone}
                    />
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* ═══ DIALOG: Glassmorphism Cards ═══ */}
            {phase === 'dialog' && (
              <div className="absolute inset-0 z-30 flex flex-col items-center justify-center px-6">
                {/* 毛玻璃卡片容器 */}
                <div
                  className="relative w-full max-w-[360px] rounded-3xl px-7 py-8 text-center overflow-hidden"
                  style={{
                    background: 'rgba(255, 253, 248, 0.45)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    borderRadius: 24,
                    boxShadow: '0 8px 32px rgba(143, 184, 131, 0.08), inset 0 1px 0 rgba(255,255,255,0.6)',
                    minHeight: 200,
                    opacity: (showCard0 || showCard1 || showCard2) ? 1 : 0,
                    transition: 'opacity 0.8s ease',
                  }}
                >
                  {/* 呼吸光晕 */}
                  <div
                    className="absolute inset-0 rounded-3xl pointer-events-none"
                    style={{
                      background: 'radial-gradient(ellipse at 50% 30%, rgba(180,220,160,0.15) 0%, transparent 70%)',
                      animation: 'breathe 4s ease-in-out infinite',
                    }}
                  />

                  {/* 文字容器 */}
                  <div className="relative z-10 flex flex-col items-center justify-center" style={{ minHeight: 160 }}>
                    {/* Card 1 */}
                    <FadeParagraph
                      lines={DIALOG_CARDS[0]}
                      visible={showCard0}
                      onComplete={handleCard0Done}
                    />

                    {/* Card 2 */}
                    <FadeParagraph
                      lines={DIALOG_CARDS[1]}
                      visible={showCard1}
                      onComplete={handleCard1Done}
                    />

                    {/* Card 3 */}
                    <FadeParagraph
                      lines={DIALOG_CARDS[2]}
                      visible={showCard2}
                      onComplete={handleCard2Done}
                    />
                  </div>
                </div>

                {/* 收集回忆按钮 */}
                <div style={{ minHeight: 52 }}>
                  <AnimatePresence>
                    {showCollectButton && (
                      <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="relative px-7 py-3.5 rounded-full font-body text-[15px] font-bold overflow-hidden"
                        style={{
                          color: '#FFFFFF',
                          background: 'linear-gradient(135deg, #8FB883 0%, #7EA872 50%, #4A6741 100%)',
                          backdropFilter: 'blur(8px)',
                          boxShadow: '0 4px 20px rgba(143, 184, 131, 0.4), 0 0 40px rgba(143, 184, 131, 0.15), inset 0 1px 0 rgba(255,255,255,0.3)',
                          border: '1px solid rgba(255,255,255,0.3)',
                          textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCollectMemories();
                        }}
                      >
                        {/* 按钮光晕脉动 */}
                        <span
                          className="absolute inset-0 rounded-full pointer-events-none"
                          style={{
                            background: 'radial-gradient(circle at 50% 50%, rgba(180,220,160,0.3) 0%, transparent 70%)',
                            animation: 'glow-pulse 3s ease-in-out infinite',
                          }}
                        />
                        <span className="relative z-10">收集回忆 🍃</span>
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* ── COLLECT PHASE: 心形叶子飘落 ── */}
            <AnimatePresence>
              {(phase === 'collect' || phase === 'ending') && (
                <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
                  {showHeartLeaves &&
                    HEART_LEAVES.map((leaf, i) => {
                      const rad = (leaf.angle * Math.PI) / 180;
                      const x = Math.cos(rad) * leaf.dist;
                      const y = Math.sin(rad) * leaf.dist;
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
                            delay: leaf.delay,
                            ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
                          }}
                          className="absolute"
                          style={{ fontSize: leaf.size, zIndex: 50 }}
                        >
                          {leaf.emoji}
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
                  {/* 白色卡片 */}
                  <div
                    className="rounded-2xl px-8 py-5 text-center"
                    style={{
                      background: 'rgba(255, 255, 255, 0.92)',
                      backdropFilter: 'blur(6px)',
                      boxShadow: '0 4px 20px rgba(74, 103, 65, 0.12)',
                      maxWidth: 320,
                      width: '100%',
                    }}
                  >
                    <p
                      className="font-display text-[22px] leading-[1.6] font-bold"
                      style={{ color: '#4A6741' }}
                    >
                      每一段旅程都有你相伴 💚
                    </p>
                    <p
                      className="font-body text-[15px] leading-[1.8] mt-3"
                      style={{ color: '#7EA872' }}
                    >
                      感谢这十天的美好回忆
                    </p>
                  </div>

                  {/* 回到日历按钮 */}
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2 }}
                    className="mt-6 px-6 py-3 rounded-full font-body text-[15px] font-bold text-white"
                    style={{
                      background: 'linear-gradient(135deg, #8FB883 0%, #4A6741 100%)',
                      boxShadow: '0 4px 12px rgba(143, 184, 131, 0.4)',
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
        @keyframes leaf-fall {
          0% { transform: translateY(-10vh) rotate(0deg) translateX(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 0.6; }
          100% { transform: translateY(100vh) rotate(360deg) translateX(50px); opacity: 0; }
        }
        @keyframes grass-sway {
          0%, 100% { transform: rotate(-3deg); }
          50% { transform: rotate(3deg); }
        }
        @keyframes sun-glow {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.1); }
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
