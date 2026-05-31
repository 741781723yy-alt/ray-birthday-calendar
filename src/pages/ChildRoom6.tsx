import { asset } from "@/lib/assets";
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router';
import FlipBook from '../components/FlipBook';

/* ═══════════════════════════════════════════
   ChildRoom 6 Page - 办公室（36岁）
   流程：时光穿梭 → 办公室 → 打字机 → 毛玻璃卡片 → 结尾
   ═══════════════════════════════════════════ */

type Phase = 'travel' | 'office' | 'dialog' | 'dialog2' | 'cards' | 'sketchbook' | 'ending';

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

/* ── 毛玻璃卡片对话 ── */
const DIALOG_CARDS = [
  ['那时候的我们', '好像每天都待在一起。'],
  ['只要一抬头', '就能看到', '坐在我斜前方的你。'],
];

/* ── 结尾文字 ──
   每段是一个字符串数组，段内每行依次出现 */
const ENDING_LINES = [
  ['原来我们已经', '一起经历了这么多呀。'],
  ['所以现在想想', '能遇见你', '真的是一件很好的事情。'],
];

/* 段内每行之间的间隔（秒） */
const LINE_GAP = 2.0;

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
    <span className="font-display text-[28px] leading-[1.8]" style={{ color: '#8B4513' }}>
      {displayed}
      <span style={{ opacity: cursorVisible ? 1 : 0, transition: 'opacity 0.2s', color: '#D4883A' }}>|</span>
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
            boxShadow: '0 8px 32px rgba(233, 164, 74, 0.08), inset 0 1px 0 rgba(255,255,255,0.6)',
            padding: '24px 28px',
            maxWidth: 340,
            width: '100%',
            minHeight: 120,
          }}
        >
          <div
            className="absolute inset-0 rounded-3xl pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at 50% 30%, rgba(233,164,74,0.15) 0%, transparent 70%)',
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
              transition={{ duration: 0.6, delay: i * LINE_GAP }}
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

export default function ChildRoom6() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>('travel');
  const [travelProgress, setTravelProgress] = useState(0);

  // Dialog states
  const [showTypewriter1, setShowTypewriter1] = useState(false);
  const [showTypewriter2, setShowTypewriter2] = useState(false);

  // Card states
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
        setPhase('office');
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [phase]);

  // ── Office click → dialog ──
  const handleOfficeClick = useCallback(() => {
    if (phase === 'office') {
      setPhase('dialog');
      setTimeout(() => setShowTypewriter1(true), 500);
    }
  }, [phase]);

  // ── Typewriter 1 done → typewriter 2 ──
  const handleTypewriter1Done = useCallback(() => {
    setTimeout(() => {
      setShowTypewriter1(false);
      setPhase('dialog2');
      setTimeout(() => setShowTypewriter2(true), 300);
    }, 1500);
  }, []);

  // ── Typewriter 2 done → cards ──
  const handleTypewriter2Done = useCallback(() => {
    setTimeout(() => {
      setShowTypewriter2(false);
      setPhase('cards');
    }, 1500);
  }, []);

  // ── Cards auto-play → ending ──
  useEffect(() => {
    if (phase !== 'cards') return;

    const timeouts: ReturnType<typeof setTimeout>[] = [];

    const showNext = (index: number) => {
      if (index >= DIALOG_CARDS.length) {
        setShowCard(false);
        // 卡片结束 → 进入 sketchbook
        timeouts.push(setTimeout(() => {
          setPhase('sketchbook');
        }, 1200));
        return;
      }

      setCardIndex(index);
      setShowCard(true);

      timeouts.push(setTimeout(() => {
        setShowCard(false);
        timeouts.push(setTimeout(() => {
          showNext(index + 1);
        }, 800));
      }, 4000));
    };

    showNext(0);

    return () => timeouts.forEach(clearTimeout);
  }, [phase]);

  // ── Sketchbook complete → ending ──
  const handleSketchbookComplete = useCallback(() => {
    setPhase('ending');
  }, []);

  // ── Ending auto-play ──
  useEffect(() => {
    if (phase !== 'ending') return;

    const timeouts: ReturnType<typeof setTimeout>[] = [];

    const showNextEnding = (index: number) => {
      // 所有段落都显示完毕 → 显示按钮
      if (index >= ENDING_LINES.length) {
        setShowButton(true);
        return;
      }

      // 切换到当前段落
      setEndingIndex(index);
      setShowEndingLine(true);

      const lines = ENDING_LINES[index];
      const isLast = index === ENDING_LINES.length - 1;

      // 计算本段显示时长：所有行出现 + 观看时间
      const paragraphDuration = (lines.length * LINE_GAP + 1.0) * 1000;

      if (isLast) {
        // 最后一段：显示完直接进按钮
        timeouts.push(setTimeout(() => {
          showNextEnding(index + 1);
        }, paragraphDuration));
      } else {
        // 非最后一段：显示完 → 淡出 → 等淡出完成 → 下一段
        timeouts.push(setTimeout(() => {
          setShowEndingLine(false);
          timeouts.push(setTimeout(() => {
            showNextEnding(index + 1);
          }, 1600));
        }, paragraphDuration));
      }
    };

    // 开始第一段落
    timeouts.push(setTimeout(() => {
      showNextEnding(0);
    }, 500));

    return () => timeouts.forEach(clearTimeout);
  }, [phase]);

  /* ═══════════════════ RENDER ═══════════════════ */

  const isDark = phase === 'ending';

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ background: '#2a2018' }}>
      {/* ===== PHASE: TIME TRAVEL ===== */}
      <AnimatePresence>
        {phase === 'travel' && (
          <motion.div
            className="absolute inset-0 z-50 flex items-center justify-center"
            style={{ background: '#1a1008' }}
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
                    border: '2px solid rgba(233, 164, 74, 0.4)',
                    animation: `spin ${2 + i * 0.5}s linear infinite ${i % 2 === 0 ? '' : 'reverse'}`,
                    opacity: 1 - travelProgress * 0.5,
                    boxShadow: '0 0 20px rgba(233, 164, 74, 0.2)',
                  }}
                />
              ))}
              <div
                className="absolute rounded-full"
                style={{
                  width: 100 + travelProgress * 200,
                  height: 100 + travelProgress * 200,
                  background: `radial-gradient(circle, rgba(233,164,74,${0.3 + travelProgress * 0.4}) 0%, transparent 70%)`,
                }}
              />
            </div>
            <motion.p
              className="absolute font-display text-[18px] z-10"
              style={{ color: '#F0C080' }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              时光穿梭中...
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== OFFICE + DIALOG + CARDS + ENDING ===== */}
      <AnimatePresence>
        {phase !== 'travel' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0"
            onClick={phase === 'office' ? handleOfficeClick : undefined}
          >
            {/* Office Background */}
            <div className="absolute inset-0">
              <img
                src={asset("/office-scene.webp")}
                alt="办公室"
                className="w-full h-full object-cover"
                style={{
                  filter: isDark ? 'brightness(0.35) blur(2px)' : 'brightness(1)',
                  transition: 'filter 2s ease',
                }}
                draggable={false}
              />
            </div>

            {/* Dark overlay for ending */}
            <AnimatePresence>
              {isDark && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.6 }}
                  transition={{ duration: 2 }}
                  className="absolute inset-0 z-40"
                  style={{ background: '#000' }}
                />
              )}
            </AnimatePresence>

            {/* White overlay for dialog + cards phases */}
            <AnimatePresence>
              {(phase === 'dialog' || phase === 'dialog2' || phase === 'cards') && (
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

            {/* ═══ TYPEWRITER 1 ═══ */}
            <AnimatePresence>
              {phase === 'dialog' && showTypewriter1 && (
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
                      text="36岁的小陈蕊，你好呀～"
                      speed={85}
                      onComplete={handleTypewriter1Done}
                    />
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* ═══ TYPEWRITER 2 ═══ */}
            <AnimatePresence>
              {phase === 'dialog2' && showTypewriter2 && (
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
                      text="我终于认识你了！"
                      speed={85}
                      onComplete={handleTypewriter2Done}
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

            {/* ═══ SKETCHBOOK ═══ */}
            <AnimatePresence>
              {phase === 'sketchbook' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8 }}
                  className="absolute inset-0 z-30"
                >
                  {/* Dim background */}
                  <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.4)' }} />
                  <FlipBook
                    cover={asset("/scrapbook-cover.svg")}
                    spreads={Array.from({ length: 5 }, (_, i) =>
                      asset(`/photos/day6/spread-${i + 1}.webp`)
                    )}
                    onComplete={handleSketchbookComplete}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* ═══ ENDING TEXT ═══ */}
            <AnimatePresence>
              {phase === 'ending' && (
                <div className="absolute inset-0 z-50 flex items-center justify-center px-6">
                  <div className="relative" style={{ width: '100%', maxWidth: 400, height: 220 }}>
                    {/* Ending text lines */}
                    <div className="absolute inset-x-0 top-0 flex items-start justify-center">
                      {endingIndex < ENDING_LINES.length && (
                        <EndingText
                          key={`ending-${endingIndex}`}
                          lines={ENDING_LINES[endingIndex]}
                          visible={showEndingLine}
                        />
                      )}
                    </div>

                    {/* Back button */}
                    <div className="absolute inset-x-0 bottom-0 flex items-center justify-center" style={{ height: 60 }}>
                      <AnimatePresence>
                        {showButton && (
                          <motion.button
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
                            className="px-8 py-3.5 rounded-full font-body text-[16px] font-bold text-white"
                            style={{
                              background: 'linear-gradient(135deg, #E9A44A 0%, #D4883A 100%)',
                              boxShadow: '0 4px 16px rgba(233, 164, 74, 0.4)',
                            }}
                            onClick={() => navigate('/', { state: { buildingOpen: true } })}
                          >
                            回到日历
                          </motion.button>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
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
        @keyframes breathe {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
