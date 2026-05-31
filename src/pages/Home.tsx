import { asset } from "@/lib/assets";
import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router';
import Layout from '../components/Layout';
import DayPopup from '../components/DayPopup';
import { triggerConfetti } from '../lib/confetti';

type BuildingState = 'closed' | 'opening' | 'opened' | 'closing';

/* ────────────────────────── stars ────────────────────────── */

interface StarData {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
}

const generateStars = (): StarData[] =>
  Array.from({ length: 18 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 60,
    size: 8 + Math.random() * 8,
    delay: Math.random() * 4,
    duration: 1.5 + Math.random() * 1.5,
  }));

/* ────────────────────────── cloud ────────────────────────── */

function Cloud({
  top,
  width,
  delay,
  durationClass,
  opacity = 0.6,
}: {
  top: string;
  width: string;
  delay: string;
  durationClass: string;
  opacity?: number;
}) {
  return (
    <div
      className={`absolute ${durationClass}`}
      style={{
        top,
        left: '-150px',
        width,
        opacity,
        animationDelay: delay,
        willChange: 'transform',
      }}
    >
      <svg viewBox="0 0 120 60" fill="#D6EBF5" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="30" cy="40" rx="25" ry="18" />
        <ellipse cx="60" cy="32" rx="35" ry="22" />
        <ellipse cx="85" cy="40" rx="28" ry="18" />
        <ellipse cx="50" cy="48" rx="30" ry="12" />
      </svg>
    </div>
  );
}

/* ────────────────────────── streamer ────────────────────────── */

function Streamer({ side }: { side: 'left' | 'right' }) {
  const baseTransform = side === 'left' ? 'scaleX(1)' : 'scaleX(-1)';
  return (
    <div
      className="absolute top-0 z-[5] animate-streamer-sway pointer-events-none"
      style={{
        [side]: '0px',
        transform: baseTransform,
        transformOrigin: side === 'left' ? 'top left' : 'top right',
        width: '120px',
      }}
    >
      <svg viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 0 C20 10, 40 30, 60 40 C80 50, 100 45, 120 55" stroke="#E9C46A" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M0 15 C25 20, 45 40, 70 45 C90 50, 110 60, 120 65" stroke="#F8C8DC" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M0 30 C15 35, 35 50, 55 55 C75 60, 95 65, 120 75" stroke="#E9C46A" strokeWidth="2" fill="none" strokeLinecap="round" />
        <circle cx="60" cy="40" r="4" fill="#F4A261" opacity="0.6" />
        <circle cx="90" cy="52" r="3" fill="#E9C46A" opacity="0.5" />
      </svg>
    </div>
  );
}

/* ────────────────────────── window ────────────────────────── */

function CalendarWindow({
  day,
  onTap,
  index,
  isVisible,
}: {
  day: number;
  onTap: (d: number) => void;
  index: number;
  isVisible: boolean;
}) {
  return (
    <motion.button
      initial={false}
      animate={
        isVisible
          ? { scale: 1, opacity: 1 }
          : { scale: 0.8, opacity: 0 }
      }
      transition={{
        type: 'spring',
        damping: 20,
        stiffness: 300,
        delay: isVisible ? 0.4 + index * 0.05 : 0,
      }}
      onClick={() => onTap(day)}
      className="relative flex items-center justify-center rounded-2xl border-[2.5px] border-blue-dark cursor-pointer transition-shadow duration-300 hover:shadow-glow active:scale-95"
      style={{
        width: 88,
        height: 88,
        background: 'linear-gradient(180deg, #B8D4E8 0%, #D6EBF5 100%)',
        borderTopLeftRadius: '24px',
        borderTopRightRadius: '24px',
        borderBottomLeftRadius: '16px',
        borderBottomRightRadius: '16px',
        willChange: 'transform',
      }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Arch top decoration */}
      <div
        className="absolute inset-x-0 top-0 h-[35%] rounded-t-[22px]"
        style={{
          background: 'linear-gradient(180deg, rgba(184,212,232,0.5) 0%, transparent 100%)',
        }}
      />
      {/* Day number */}
      <span
        className="font-number text-[28px] relative z-10"
        style={{ color: '#405B7A' }}
      >
        {day}
      </span>
    </motion.button>
  );
}

/* ────────────────────────── tap hint ────────────────────────── */

function TapHint({ visible, onDismiss }: { visible: boolean; onDismiss: () => void }) {
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(onDismiss, 8000);
    return () => clearTimeout(timer);
  }, [visible, onDismiss]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 z-[15] flex flex-col items-center justify-center pointer-events-none"
        >
          <div className="animate-hint-pulse flex flex-col items-center">
            {/* Finger icon */}
            <svg width="48" height="48" viewBox="0 0 24 24" fill="#405B7A">
              <path d="M9 11.24V7.5C9 6.12 10.12 5 11.5 5S14 6.12 14 7.5v3.74c1.21-.81 2-2.18 2-3.74C16 5.01 13.99 3 11.5 3S7 5.01 7 7.5c0 1.56.79 2.93 2 3.74z" />
              <path d="M17.99 11.29c-.71-1.11-1.86-1.9-3.19-2.17V7.5c0-1.38-1.12-2.5-2.5-2.5S9.8 6.12 9.8 7.5v5.68l-1.87-1.28a2.503 2.503 0 00-3.45 3.45l4.33 6.66c.82 1.27 2.23 2.03 3.75 2.03h3.1c2.17 0 4.08-1.41 4.71-3.49l.71-2.37c.38-1.27-.03-2.67-1.09-3.39z" />
            </svg>
            <p
              className="font-body text-[14px] font-bold mt-2"
              style={{ color: '#405B7A' }}
            >
              点击打开礼盒
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ══════════════════════════ HOME ══════════════════════════ */

export default function Home() {
  const location = useLocation();
  const [buildingState, setBuildingState] = useState<BuildingState>('closed');
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [hintVisible, setHintVisible] = useState(true);
  const [soundOn, setSoundOn] = useState(false);
  const buildingRef = useRef<HTMLDivElement>(null);

  const stars = useRef<StarData[]>(generateStars()).current;

  // If navigated from child-room with buildingOpen flag, show opened state
  useEffect(() => {
    if (location.state?.buildingOpen) {
      setBuildingState('opened');
      setHintVisible(false);
    }
  }, [location.state]);

  /* ───── handlers ───── */

  const handleBuildingTap = useCallback(() => {
    if (buildingState !== 'closed') return;
    setHintVisible(false);
    setBuildingState('opening');

    // Confetti at 200ms - early burst as building starts opening
    setTimeout(() => {
      triggerConfetti();
    }, 200);

    // Transition to opened - date page fades in right after confetti
    setTimeout(() => {
      setBuildingState('opened');
    }, 1000);
  }, [buildingState]);

  const handleCloseBuilding = useCallback(() => {
    if (buildingState !== 'opened') return;
    setBuildingState('closing');
    setTimeout(() => {
      setBuildingState('closed');
    }, 500);
  }, [buildingState]);

  const handleWindowTap = useCallback((day: number) => {
    setSelectedDay(day);
  }, []);

  const handleClosePopup = useCallback(() => {
    setSelectedDay(null);
  }, []);

  const dismissHint = useCallback(() => {
    setHintVisible(false);
  }, []);

  /* ───── derived state ───── */

  const showCloseButton = buildingState === 'opened';
  const showHintButton = buildingState === 'closed';
  const isLeftRightVisible = buildingState !== 'closed';

  /* ───── animation classes ───── */

  const leftHalfTransform =
    buildingState === 'opening'
      ? 'rotateY(-78deg) translateX(-30px)'
      : buildingState === 'opened'
        ? 'rotateY(-78deg) translateX(-30px)'
        : 'rotateY(0deg) translateX(0)';

  const rightHalfTransform =
    buildingState === 'opening'
      ? 'rotateY(78deg) translateX(30px)'
      : buildingState === 'opened'
        ? 'rotateY(78deg) translateX(30px)'
        : 'rotateY(0deg) translateX(0)';

  const halfTransition =
    buildingState === 'opening'
      ? 'transform 1.2s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
      : buildingState === 'closing'
        ? 'transform 0.5s cubic-bezier(0.25, 0.1, 0.25, 1)'
        : 'transform 0.6s cubic-bezier(0.25, 0.1, 0.25, 1)';

  /* ═══════════════════════ render ═══════════════════════ */

  return (
    <Layout>
      {/* ===== Background Layer ===== */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Clouds */}
        <Cloud top="5%" width="100px" delay="0s" durationClass="animate-cloud-drift-1" />
        <Cloud top="15%" width="80px" delay="-8s" durationClass="animate-cloud-drift-2" />
        <Cloud top="8%" width="120px" delay="-15s" durationClass="animate-cloud-drift-3" />
        <Cloud top="22%" width="70px" delay="-5s" durationClass="animate-cloud-drift-4" />

        {/* Stars */}
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute animate-twinkle"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              animationDelay: `${star.delay}s`,
              animationDuration: `${star.duration}s`,
            }}
          >
            <svg width={star.size} height={star.size} viewBox="0 0 16 16" fill="#E9C46A">
              <path d="M8 0L9.5 6.5L16 8L9.5 9.5L8 16L6.5 9.5L0 8L6.5 6.5Z" />
            </svg>
          </div>
        ))}
      </div>

      {/* Streamers */}
      <Streamer side="left" />
      <Streamer side="right" />

      {/* ===== Title Banner ===== */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] }}
        className="relative z-10 text-center pt-10 pb-2"
      >
        <h1
          className="font-display text-[32px] tracking-[0.05em] leading-[1.3]"
          style={{
            color: '#405B7A',
            textShadow: '2px 2px 0px #B8D4E8',
          }}
        >
          RAY的生日倒计时
        </h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="font-body text-[14px] font-bold mt-2 tracking-[0.1em]"
          style={{ color: '#6B9AC4' }}
        >
          6月1日 — 6月12日
        </motion.p>
      </motion.div>

      {/* ===== Building Container ===== */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-[35px]">
        <div
          ref={buildingRef}
          className="relative"
          style={{ width: 360, height: 520 }}
        >
          {/* Tap hint */}
          <TapHint visible={buildingState === 'closed' && hintVisible} onDismiss={dismissHint} />

          {/* ── Closed State: full building image ── */}
          <AnimatePresence>
            {buildingState === 'closed' && (
              <motion.div
                initial={{ opacity: 0, scale: 1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="absolute inset-0 cursor-pointer"
                onClick={handleBuildingTap}
              >
                <img
                  src={asset("/building-closed.png")}
                  alt="Closed building"
                  className="w-full h-full object-contain"
                  draggable={false}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Split Animation State: left/right halves ── */}
          <AnimatePresence>
            {isLeftRightVisible && (
              <motion.div
                className="absolute inset-0 perspective-1200"
                initial={false}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.1 }}
                style={{ pointerEvents: 'none' }}
              >
                <div className="relative w-full h-full preserve-3d">
                  {/* Left half */}
                  <div
                    className="absolute left-0 top-0 w-1/2 h-full overflow-visible"
                    style={{
                      transformOrigin: 'left center',
                      transform: leftHalfTransform,
                      transition: halfTransition,
                      willChange: 'transform',
                    }}
                  >
                    <img
                      src={asset("/building-left-half.png")}
                      alt="Building left half"
                      className="w-full h-full object-contain object-right"
                      draggable={false}
                    />
                  </div>

                  {/* Right half */}
                  <div
                    className="absolute right-0 top-0 w-1/2 h-full overflow-visible"
                    style={{
                      transformOrigin: 'right center',
                      transform: rightHalfTransform,
                      transition: halfTransition,
                      willChange: 'transform',
                    }}
                  >
                    <img
                      src={asset("/building-right-half.png")}
                      alt="Building right half"
                      className="w-full h-full object-contain object-left"
                      draggable={false}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Opened State: window grid ── */}
          <AnimatePresence>
            {(buildingState === 'opened' || buildingState === 'opening') && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  duration: 0.6,
                  delay: 0.3,
                }}
                className="absolute inset-0 flex flex-col items-center justify-center"
              >
                {/* Interior background */}
                <div
                  className="absolute inset-[20px] rounded-3xl"
                  style={{
                    background: 'linear-gradient(180deg, rgba(184,212,232,0.4) 0%, rgba(214,235,245,0.3) 100%)',
                    border: '2px solid #8AB4D6',
                  }}
                />

                {/* Window grid: 4 rows x 3 columns */}
                <div className="relative z-10 grid grid-cols-3 gap-2 p-6">
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((day, index) => (
                    <CalendarWindow
                      key={day}
                      day={day}
                      index={index}
                      onTap={handleWindowTap}
                      isVisible={buildingState === 'opening' || buildingState === 'opened'}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Decorative: Cat (positioned over building) ── */}
          <motion.div
            className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <img src={asset("/cat-sitting.png")} alt="Cat" className="w-14 h-14 object-contain" draggable={false} />
          </motion.div>

          {/* ── Decorative: Balloons ── */}
          {buildingState !== 'opened' && (
            <motion.div
              className="absolute -left-10 top-[25%] z-20 pointer-events-none"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <img src={asset("/balloon-cluster.png")} alt="Balloons" className="w-16 h-20 object-contain" draggable={false} />
            </motion.div>
          )}

          {/* ── Decorative: Gift Box at doorstep ── */}
          {buildingState !== 'opened' && (
            <motion.div
              className="absolute bottom-2 left-10 z-20 pointer-events-none"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
            >
              <img src={asset("/gift-box.png")} alt="Gift" className="w-12 h-12 object-contain" draggable={false} />
            </motion.div>
          )}

          {/* ── Decorative: Birthday Cake ── */}
          {buildingState !== 'opened' && (
            <motion.div
              className="absolute bottom-2 right-10 z-20 pointer-events-none"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            >
              <img src={asset("/birthday-cake.png")} alt="Cake" className="w-12 h-12 object-contain" draggable={false} />
            </motion.div>
          )}
        </div>
      </div>

      {/* ===== Walking Character ===== */}
      <div className="fixed bottom-0 left-0 right-0 h-[70px] z-[5] overflow-visible pointer-events-none">
        <div className="absolute bottom-1 animate-character-walk" style={{ willChange: 'transform' }}>
          <div className="animate-bob">
            <img
              src={asset("/character-walk.png")}
              alt="Walking character"
              className="w-[50px] h-[70px] object-contain"
              draggable={false}
            />
          </div>
        </div>
        {/* Ground line */}
        <div
          className="absolute bottom-0 left-0 right-0"
          style={{
            height: '2px',
            background: 'rgba(64, 91, 122, 0.3)',
            borderRadius: '1px',
          }}
        />
      </div>

      {/* ===== Controls Bar ===== */}
      <div className="fixed bottom-4 left-0 right-0 z-20 flex items-center justify-between px-4 pointer-events-auto">
        {/* Sound toggle */}
        <button
          onClick={() => setSoundOn((prev) => !prev)}
          className="w-11 h-11 rounded-full flex items-center justify-center shadow-soft transition-transform duration-200 active:scale-90"
          style={{ background: '#6B9AC4' }}
        >
          {soundOn ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </svg>
          )}
        </button>

        {/* Close building button (visible only when opened) */}
        <AnimatePresence>
          {showCloseButton && (
            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              onClick={handleCloseBuilding}
              className="h-12 px-6 rounded-full shadow-medium flex items-center gap-2 transition-transform duration-200 active:scale-95"
              style={{ background: '#6B9AC4' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              <span className="font-body text-[14px] font-bold text-white">合上建筑</span>
            </motion.button>
          )}
        </AnimatePresence>

        {/* Hint button (visible only when closed) */}
        <AnimatePresence>
          {showHintButton && (
            <motion.button
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={() => setHintVisible(true)}
              className="w-11 h-11 rounded-full flex items-center justify-center shadow-soft transition-transform duration-200 active:scale-90"
              style={{ background: '#E9C46A' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* ===== Popup ===== */}
      {selectedDay === 11 ? (
        <Day11Envelope onClose={handleClosePopup} />
      ) : (
        <DayPopup day={selectedDay} onClose={handleClosePopup} />
      )}
    </Layout>
  );
}

/* ═══════════════════ Day 11 信封全屏 ═══════════════════ */

/* 漂浮的小装饰元素 */
const FLOATING_DECO = [
  { x: 12, y: 18, size: 6, type: 'star', delay: 0 },
  { x: 88, y: 25, size: 5, type: 'star', delay: 1.2 },
  { x: 22, y: 72, size: 4, type: 'sparkle', delay: 0.6 },
  { x: 78, y: 68, size: 5, type: 'star', delay: 2.0 },
  { x: 35, y: 10, size: 3, type: 'sparkle', delay: 1.5 },
  { x: 65, y: 82, size: 4, type: 'star', delay: 0.8 },
  { x: 8, y: 55, size: 3, type: 'sparkle', delay: 1.8 },
  { x: 92, y: 48, size: 4, type: 'star', delay: 0.3 },
];

function FloatingDecor() {
  return (
    <>
      {FLOATING_DECO.map((d, i) => (
        <motion.div
          key={i}
          animate={{
            opacity: [0.15, 0.5, 0.15],
            y: [0, -6, 0],
          }}
          transition={{
            duration: 3 + i * 0.3,
            delay: d.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            position: 'absolute',
            left: `${d.x}%`,
            top: `${d.y}%`,
          }}
        >
          {d.type === 'star' ? (
            <svg width={d.size * 3} height={d.size * 3} viewBox="0 0 20 20">
              <path
                d="M10 2 L12 8 L18 8 L13 12 L15 18 L10 14 L5 18 L7 12 L2 8 L8 8 Z"
                fill="#E9D88C"
                opacity="0.6"
              />
            </svg>
          ) : (
            <svg width={d.size * 2} height={d.size * 2} viewBox="0 0 12 12">
              <path d="M6 0 L7 5 L12 6 L7 7 L6 12 L5 7 L0 6 L5 5 Z" fill="#E9D88C" opacity="0.5" />
            </svg>
          )}
        </motion.div>
      ))}
    </>
  );
}

function Day11Envelope({ onClose }: { onClose: () => void }) {
  const [stage, setStage] = useState<'closed' | 'open' | 'letter'>('closed');

  const handleOpen = () => {
    if (stage !== 'closed') return;
    // 流程：点击 → 淡化到图2（打开信封）→ 短暂停留 → 转场跳到信纸
    setStage('open');
    // 图2展示2秒后转场到信纸
    setTimeout(() => {
      setStage('letter');
    }, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{
        background: 'linear-gradient(170deg, #fffdf8 0%, #fef9f2 40%, #fdf5ec 100%)',
      }}
    >
      {/* 漂浮装饰 */}
      <FloatingDecor />

      {/* 月亮 */}
      <motion.div
        animate={{ opacity: [0.12, 0.2, 0.12] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        style={{ position: 'absolute', top: '6%', right: '10%' }}
      >
        <svg width="48" height="48" viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="18" fill="#F5E6C8" opacity="0.5" />
          <circle cx="30" cy="20" r="16" fill="#fffdf8" opacity="0.8" />
        </svg>
      </motion.div>

      {/* ═══ 内容叠加层：图1、图2、信纸全在同一位置，叠画切换 ═══ */}
      <div style={{ position: 'relative', width: 310, minHeight: 310, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

        {/* 图1 关闭信封 */}
        <motion.img
          src={asset("/assets/envelope-closed.png")}
          alt="关闭的信封"
          initial={{ opacity: 1 }}
          animate={{ opacity: stage === 'closed' ? 1 : 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          onClick={handleOpen}
          style={{
            position: 'absolute',
            width: 280,
            height: 280,
            objectFit: 'contain',
            cursor: stage === 'closed' ? 'pointer' : 'default',
            zIndex: stage === 'closed' ? 2 : 0,
          }}
        />

        {/* 图2 打开信封 */}
        <motion.img
          src={asset("/assets/envelope-open.png")}
          alt="打开的信封"
          initial={{ opacity: 0 }}
          animate={{ opacity: stage === 'open' ? 1 : 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            width: 280,
            height: 280,
            objectFit: 'contain',
            pointerEvents: stage === 'open' ? 'auto' : 'none',
            zIndex: stage === 'open' ? 2 : 0,
          }}
        />

        {/* 点击提示 */}
        {stage === 'closed' && (
          <motion.div
            animate={{ opacity: [0.25, 0.6, 0.25] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              position: 'absolute',
              bottom: -30,
              width: '100%',
              textAlign: 'center',
              fontFamily: 'Quicksand, sans-serif',
              fontSize: 14,
              color: '#c8b8a8',
              letterSpacing: '0.05em',
              zIndex: 3,
            }}
          >
            轻轻打开 ✨
          </motion.div>
        )}

        {/* 信纸 - 和信封图叠画切换 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: stage === 'letter' ? 1 : 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          style={{
            width: '100%',
            position: 'relative',
            borderRadius: 18,
            background: 'linear-gradient(175deg, #fffef9 0%, #fef9f2 50%, #fdf5ec 100%)',
            padding: '40px 30px 32px',
            boxShadow: '0 16px 48px rgba(200,180,160,0.18), 0 2px 8px rgba(200,180,160,0.1), inset 0 1px 0 rgba(255,255,255,0.9)',
            overflow: 'hidden',
            pointerEvents: stage === 'letter' ? 'auto' : 'none',
          }}
        >
          {/* 信纸纹理 */}
          <div style={{
            position: 'absolute', inset: 0,
            background: `repeating-linear-gradient(0deg, transparent, transparent 26px, rgba(210,195,175,0.1) 26px, rgba(210,195,175,0.1) 27px)`,
            pointerEvents: 'none',
          }} />

          {/* 角落花朵装饰 */}
          <svg style={{ position: 'absolute', top: 8, right: 12, opacity: 0.12 }} width="28" height="28" viewBox="0 0 28 28">
            <circle cx="14" cy="10" r="4" fill="#e8a8a8" />
            <circle cx="10" cy="16" r="4" fill="#e8a8a8" />
            <circle cx="18" cy="16" r="4" fill="#e8a8a8" />
            <circle cx="14" cy="14" r="2.5" fill="#f0c0c0" />
          </svg>
          <svg style={{ position: 'absolute', bottom: 12, left: 10, opacity: 0.1 }} width="22" height="22" viewBox="0 0 22 22">
            <path d="M11 2 Q15 8 11 14 Q7 8 11 2" fill="#c8b8a8" />
            <path d="M5 11 Q11 7 17 11 Q11 15 5 11" fill="#c8b8a8" />
          </svg>

          <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
            {/* 小信封图标 */}
            <svg width="32" height="28" viewBox="0 0 32 28" style={{ margin: '0 auto 16px' }}>
              <rect x="2" y="4" width="28" height="20" rx="3" fill="none" stroke="#d4bea4" strokeWidth="1.5" />
              <path d="M2 7 L16 16 L30 7" fill="none" stroke="#d4bea4" strokeWidth="1.5" />
            </svg>

            <p style={{
              fontFamily: 'Quicksand, sans-serif',
              fontSize: 22,
              fontWeight: 700,
              color: '#8B6A50',
              marginBottom: 20,
              letterSpacing: '0.08em',
            }}>
              邀请函
            </p>
            <p style={{
              fontFamily: 'Quicksand, sans-serif',
              fontSize: 15,
              lineHeight: 2.2,
              color: '#6a5a4a',
              margin: 0,
              textAlign: 'left',
            }}>
              TO：世界上最可爱的RAY小姐<br /><br />
              明天就是你的生日啦～我想正式向你发出约会邀请：<br /><br />
              6月12日 晚上7点，如果你有空的话，邀请你来我家吃饭～<br />
              如果不方便，我们就换个时间。<br /><br />
              不着急回复～
            </p>
          </div>

          {/* 回到日历按钮 */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            onClick={onClose}
            style={{
              display: 'block',
              margin: '32px auto 0',
              padding: '10px 28px',
              borderRadius: 20,
              border: '1px solid rgba(180,160,140,0.2)',
              background: 'linear-gradient(135deg, #f7ece0, #f2e4d2)',
              color: '#8B6A50',
              fontSize: 14,
              fontWeight: 600,
              fontFamily: 'Quicksand, sans-serif',
              cursor: 'pointer',
              boxShadow: '0 2px 10px rgba(200,180,160,0.15)',
              letterSpacing: '0.03em',
            }}
          >
            回到日历
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
}
