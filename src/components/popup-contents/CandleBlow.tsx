import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { DayContent } from '@/data/dayContents';
import { triggerConfetti } from '@/lib/confetti';

interface CandleBlowProps {
  content: DayContent;
}

interface CandleState {
  id: number;
  lit: boolean;
  blowing: boolean;
}

// ─── Flame Component ───
const Flame = ({ lit, x }: { lit: boolean; x: number }) => {
  return (
    <AnimatePresence>
      {lit && (
        <motion.g
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{ transformOrigin: `${x}px 75px` }}
        >
          {/* Outer glow */}
          <motion.ellipse
            cx={x}
            cy={68}
            rx={10}
            ry={16}
            fill="url(#flameGlow)"
            opacity={0.4}
            animate={{ rx: [10, 12, 9, 11], ry: [16, 18, 14, 17] }}
            transition={{ duration: 0.15, repeat: Infinity }}
          />
          {/* Main flame body */}
          <motion.ellipse
            cx={x}
            cy={70}
            rx={5}
            ry={10}
            fill="url(#flameBody)"
            animate={{
              ry: [10, 11.5, 9.5, 10.5],
              rx: [5, 5.5, 4.5, 5.2],
              opacity: [0.95, 1, 0.85, 0.95],
            }}
            transition={{ duration: 0.12, repeat: Infinity }}
          />
          {/* Inner bright core */}
          <motion.ellipse
            cx={x}
            cy={73}
            rx={2.5}
            ry={5}
            fill="#FFF9F0"
            opacity={0.9}
            animate={{
              ry: [5, 5.5, 4.5, 5],
              opacity: [0.9, 1, 0.85, 0.95],
            }}
            transition={{ duration: 0.1, repeat: Infinity }}
          />
        </motion.g>
      )}
    </AnimatePresence>
  );
};

// ─── Smoke Wisp Component ───
const SmokeWisp = ({ x }: { x: number }) => {
  return (
    <motion.path
      d={`M${x} 80 Q${x - 5} 65 ${x} 50 T${x} 20`}
      fill="none"
      stroke="#8899AA"
      strokeWidth="1.5"
      strokeLinecap="round"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: [0, 0.5, 0], y: -10 }}
      transition={{ duration: 1.5, ease: 'easeOut' }}
    />
  );
};

// ─── Main Component ───
export default function CandleBlow({ content }: CandleBlowProps) {
  const candleCount = content.candleCount || 5;
  const [candles, setCandles] = useState<CandleState[]>(
    Array.from({ length: candleCount }, (_, i) => ({ id: i, lit: true, blowing: false }))
  );
  const [micAccess, setMicAccess] = useState<'pending' | 'granted' | 'denied'>('pending');
  const [blowStrength, setBlowStrength] = useState(0);
  const [allBlown, setAllBlown] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const blowStartRef = useRef<number | null>(null);
  const lastBlownIndex = useRef(0);

  const litCandles = candles.filter((c) => c.lit).length;
  const allOut = litCandles === 0;

  // Play cheerful tone
  const playCelebrationTone = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.value = freq;
        osc.type = 'sine';
        gain.gain.value = 0.15;
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5 + i * 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.12);
        osc.stop(ctx.currentTime + 0.5 + i * 0.15);
      });
    } catch {
      // Audio play failed, ignore
    }
  }, []);

  // All candles blown celebration
  useEffect(() => {
    if (allOut && !allBlown) {
      setAllBlown(true);
      // Stop mic
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }

      setTimeout(() => {
        triggerConfetti();
        setShowSuccess(true);
        playCelebrationTone();
      }, 500);
    }
  }, [allOut, allBlown, playCelebrationTone]);

  // Blow detection loop
  const detectBlow = useCallback(() => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    // Calculate average volume
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i];
    }
    const average = sum / dataArray.length;
    setBlowStrength(Math.min(100, average * 2));

    // Threshold for blow detection
    if (average > 30) {
      if (blowStartRef.current === null) {
        blowStartRef.current = Date.now();
      } else if (Date.now() - blowStartRef.current > 400) {
        // Sustained blow detected - extinguish one candle
        const remaining = candles.filter((c) => c.lit);
        if (remaining.length > 0) {
          const toBlow = remaining[0];
          setCandles((prev) =>
            prev.map((c) => (c.id === toBlow.id ? { ...c, lit: false } : c))
          );
          lastBlownIndex.current = toBlow.id;
        }
        blowStartRef.current = null;
      }
    } else {
      blowStartRef.current = null;
    }

    rafRef.current = requestAnimationFrame(detectBlow);
  }, [candles]);

  // Request microphone
  const requestMic = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioContext = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      audioContextRef.current = audioContext;

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      setMicAccess('granted');
      rafRef.current = requestAnimationFrame(detectBlow);
    } catch {
      setMicAccess('denied');
    }
  }, [detectBlow]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Manual extinguish
  const handleManualExtinguish = useCallback(() => {
    const remaining = candles.filter((c) => c.lit);
    if (remaining.length > 0) {
      setCandles((prev) =>
        prev.map((c) => (c.id === remaining[0].id ? { ...c, lit: false } : c))
      );
    }
  }, [candles]);

  // Reset
  const handleReset = useCallback(() => {
    setCandles(Array.from({ length: candleCount }, (_, i) => ({ id: i, lit: true, blowing: false })));
    setAllBlown(false);
    setShowSuccess(false);
    setBlowStrength(0);
    setMicAccess('pending');
    lastBlownIndex.current = 0;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
  }, [candleCount]);

  // Candle positions
  const candleXPositions = [65, 95, 125, 155, 185].slice(0, candleCount);

  return (
    <div className="flex flex-col items-center px-1 py-2">
      {/* Title */}
      <motion.h3
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] }}
        className="font-display text-[24px] tracking-[0.03em] mb-1"
        style={{ color: '#405B7A' }}
      >
        {content.title}
      </motion.h3>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] }}
        className="font-body text-[14px] mb-5"
        style={{ color: '#8899AA' }}
      >
        {allOut ? '愿望一定会实现的~' : content.subtitle}
      </motion.p>

      {/* Birthday Cake SVG */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] }}
        className="relative w-[250px] h-[160px] mb-5"
      >
        <svg viewBox="0 0 250 160" width="250" height="160" xmlns="http://www.w3.org/2000/svg">
          <defs>
            {/* Flame gradient */}
            <radialGradient id="flameGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#F4A261" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#F4A261" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="flameBody" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#E76F51" />
              <stop offset="40%" stopColor="#F4A261" />
              <stop offset="100%" stopColor="#E9C46A" />
            </linearGradient>
            {/* Cake gradients */}
            <linearGradient id="cakeBody" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#8AB4D6" />
              <stop offset="100%" stopColor="#6B9AC4" />
            </linearGradient>
            <linearGradient id="frosting" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#F4A261" />
              <stop offset="100%" stopColor="#E9C46A" />
            </linearGradient>
          </defs>

          {/* Cake plate */}
          <ellipse cx="125" cy="150" rx="90" ry="8" fill="#D6EBF5" opacity="0.5" />
          <ellipse cx="125" cy="147" rx="80" ry="6" fill="#B8D4E8" opacity="0.3" />

          {/* Cake body - bottom tier */}
          <rect x="55" y="100" width="140" height="45" rx="8" fill="url(#cakeBody)" />
          {/* Cake body - top tier */}
          <rect x="75" y="65" width="100" height="40" rx="6" fill="url(#cakeBody)" />

          {/* Frosting drip - bottom */}
          <rect x="52" y="95" width="146" height="12" rx="6" fill="url(#frosting)" />
          <circle cx="65" cy="106" r="5" fill="url(#frosting)" />
          <circle cx="85" cy="108" r="6" fill="url(#frosting)" />
          <circle cx="110" cy="107" r="5.5" fill="url(#frosting)" />
          <circle cx="140" cy="108" r="6" fill="url(#frosting)" />
          <circle cx="165" cy="106" r="5" fill="url(#frosting)" />
          <circle cx="185" cy="105" r="4.5" fill="url(#frosting)" />

          {/* Frosting top */}
          <rect x="72" y="60" width="106" height="10" rx="5" fill="url(#frosting)" />

          {/* Decorative dots on cake */}
          {[90, 115, 140, 165].map((dx, i) => (
            <circle key={i} cx={dx} cy={120} r="3" fill="#E9C46A" opacity="0.6" />
          ))}

          {/* Candles */}
          {candleXPositions.map((cx, i) => (
            <g key={i}>
              {/* Candle body */}
              <rect x={cx - 3} y={45} width="6" height="18" rx="2" fill={candles[i]?.lit ? '#F8C8DC' : '#D6EBF5'} />
              {/* Candle wick */}
              <line x1={cx} y1={45} x2={cx} y2={42} stroke="#405B7A" strokeWidth="1" />
              {/* Flame */}
              <Flame lit={candles[i]?.lit ?? false} x={cx} />
              {/* Smoke when extinguished */}
              {!candles[i]?.lit && <SmokeWisp x={cx} />}
            </g>
          ))}
        </svg>
      </motion.div>

      {/* Blow strength indicator */}
      {micAccess === 'granted' && !allOut && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-[200px] mb-4"
        >
          <p className="font-body text-[12px] text-center mb-1" style={{ color: '#8899AA' }}>
            吹气力度
          </p>
          <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'rgba(184, 212, 232, 0.3)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: '#F4A261' }}
              animate={{ width: `${blowStrength}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
        </motion.div>
      )}

      {/* Lit candle counter */}
      {!allOut && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="font-body text-[13px] mb-4"
          style={{ color: '#6B9AC4' }}
        >
          还剩 {litCandles} 支蜡烛
        </motion.p>
      )}

      {/* Action buttons */}
      <AnimatePresence mode="wait">
        {micAccess === 'pending' && !allOut && (
          <motion.div
            key="mic-prompt"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col items-center gap-3"
          >
            <button
              onClick={requestMic}
              className="flex items-center gap-2 px-6 py-3 rounded-full font-body text-[14px] font-bold text-white shadow-soft transition-transform duration-200 active:scale-95 hover:scale-105"
              style={{ background: '#6B9AC4' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
              开启麦克风
            </button>
            <button
              onClick={handleManualExtinguish}
              className="font-body text-[13px] transition-colors duration-200 hover:underline"
              style={{ color: '#8899AA' }}
            >
              手动熄灭蜡烛
            </button>
          </motion.div>
        )}

        {micAccess === 'denied' && !allOut && (
          <motion.div
            key="mic-denied"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col items-center gap-3"
          >
            <p className="font-body text-[13px] text-center" style={{ color: '#8899AA' }}>
              无法访问麦克风，可以手动点击熄灭蜡烛哦~
            </p>
            <button
              onClick={handleManualExtinguish}
              className="flex items-center gap-2 px-6 py-3 rounded-full font-body text-[14px] font-bold text-white shadow-soft transition-transform duration-200 active:scale-95 hover:scale-105"
              style={{ background: '#F4A261' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <line x1="19" y1="10" x2="17" y2="10" />
                <line x1="22" y1="13" x2="20" y2="13" />
              </svg>
              手动熄灭
            </button>
          </motion.div>
        )}

        {micAccess === 'granted' && !allOut && (
          <motion.p
            key="blow-hint"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="font-body text-[12px] text-center"
            style={{ color: '#8899AA' }}
          >
            对着手机吹气，吹灭蜡烛！
          </motion.p>
        )}
      </AnimatePresence>

      {/* Success state */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: [0.5, 1.2, 1] }}
            transition={{
              duration: 0.6,
              ease: [0.68, -0.55, 0.265, 1.55] as [number, number, number, number],
            }}
            className="flex flex-col items-center gap-3 mt-2"
          >
            <h2
              className="font-display text-[28px] tracking-[0.03em]"
              style={{ color: '#405B7A' }}
            >
              {'生日快乐！🎂'}
            </h2>
            <p className="font-body text-[14px]" style={{ color: '#6B9AC4' }}>
              愿望一定会实现的~
            </p>
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              onClick={handleReset}
              className="flex items-center gap-2 px-6 py-3 rounded-full font-body text-[14px] font-bold text-white shadow-soft transition-transform duration-200 active:scale-95 hover:scale-105 mt-2"
              style={{ background: '#6B9AC4' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="1 4 1 10 7 10" />
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
              </svg>
              再吹一次
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
