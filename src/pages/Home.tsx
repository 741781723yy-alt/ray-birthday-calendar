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
                  src="/building-closed.png"
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
                      src="/building-left-half.png"
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
                      src="/building-right-half.png"
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
            <img src="/cat-sitting.png" alt="Cat" className="w-14 h-14 object-contain" draggable={false} />
          </motion.div>

          {/* ── Decorative: Balloons ── */}
          {buildingState !== 'opened' && (
            <motion.div
              className="absolute -left-10 top-[25%] z-20 pointer-events-none"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <img src="/balloon-cluster.png" alt="Balloons" className="w-16 h-20 object-contain" draggable={false} />
            </motion.div>
          )}

          {/* ── Decorative: Gift Box at doorstep ── */}
          {buildingState !== 'opened' && (
            <motion.div
              className="absolute bottom-2 left-10 z-20 pointer-events-none"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
            >
              <img src="/gift-box.png" alt="Gift" className="w-12 h-12 object-contain" draggable={false} />
            </motion.div>
          )}

          {/* ── Decorative: Birthday Cake ── */}
          {buildingState !== 'opened' && (
            <motion.div
              className="absolute bottom-2 right-10 z-20 pointer-events-none"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            >
              <img src="/birthday-cake.png" alt="Cake" className="w-12 h-12 object-contain" draggable={false} />
            </motion.div>
          )}
        </div>
      </div>

      {/* ===== Walking Character ===== */}
      <div className="fixed bottom-0 left-0 right-0 h-[70px] z-[5] overflow-visible pointer-events-none">
        <div className="absolute bottom-1 animate-character-walk" style={{ willChange: 'transform' }}>
          <div className="animate-bob">
            <img
              src="/character-walk.png"
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
      <DayPopup day={selectedDay} onClose={handleClosePopup} />
    </Layout>
  );
}
