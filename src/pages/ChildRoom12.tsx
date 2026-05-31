import { asset } from "@/lib/assets";
import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router';
import { triggerConfetti } from '../lib/confetti';

/* ═══════════════════════════════════════════
   ChildRoom 12 - 生日快乐！
   背景图 → 生日歌视频 → 三层蛋糕吹蜡烛
   ═══════════════════════════════════════════ */

type Phase = 'background' | 'video' | 'cake' | 'blow' | 'blessing' | 'ending';

interface CandleState {
  id: number;
  lit: boolean;
}

/* ─── SVG 火苗（随风晃动）─── */
function Flame({ lit, x, baseY, wind = 0 }: {
  lit: boolean; x: number; baseY: number; wind?: number; // wind: 0~1 音量强度
}) {
  // wind 越大，火苗晃动幅度越大
  const w = Math.min(1, wind);
  const tilt = w * 12;       // 最大倾斜 12px
  const squeeze = 1 - w * 0.3; // 最大压缩 30%

  return (
    <AnimatePresence>
      {lit && (
        <motion.g
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{ transformOrigin: `${x}px ${baseY}px` }}
        >
          {/* 外发光 - 随风晃动 */}
          <motion.ellipse
            cx={x + tilt * 0.6} cy={baseY - 7}
            rx={10 * squeeze} ry={16 - w * 4}
            fill="url(#bdFlameGlow)"
            opacity={0.4 + w * 0.2}
            animate={{
              cx: [x + tilt * 0.4, x + tilt * 0.8, x + tilt * 0.3, x + tilt * 0.6],
              rx: [10 * squeeze, 12 * squeeze, 9 * squeeze, 11 * squeeze],
              ry: [16 - w * 4, 18 - w * 3, 14 - w * 5, 17 - w * 4],
            }}
            transition={{ duration: 0.12 + (1 - w) * 0.05, repeat: Infinity }}
          />
          {/* 主体 - 随风偏移+压缩 */}
          <motion.ellipse
            cx={x + tilt * 0.5} cy={baseY - 5 + w * 2}
            rx={5 * squeeze} ry={10 - w * 2}
            fill="url(#bdFlameBody)"
            animate={{
              cx: [x + tilt * 0.3, x + tilt * 0.7, x + tilt * 0.2, x + tilt * 0.5],
              ry: [10 - w * 2, 11.5 - w * 3, 9.5 - w * 1, 10.5 - w * 2],
              rx: [5 * squeeze, 5.5 * squeeze, 4.5 * squeeze, 5.2 * squeeze],
              opacity: [0.95, 1 - w * 0.1, 0.85, 0.95],
            }}
            transition={{ duration: 0.1 + (1 - w) * 0.03, repeat: Infinity }}
          />
          {/* 内核 */}
          <motion.ellipse
            cx={x + tilt * 0.3} cy={baseY - 2 + w * 1.5}
            rx={2.5 * squeeze} ry={5 - w * 1}
            fill="#FFF9F0" opacity={0.9}
            animate={{
              cx: [x + tilt * 0.2, x + tilt * 0.4, x + tilt * 0.1, x + tilt * 0.3],
              ry: [5 - w, 5.5 - w * 1.5, 4.5 - w * 0.5, 5 - w],
              opacity: [0.9, 1 - w * 0.15, 0.85, 0.95],
            }}
            transition={{ duration: 0.08 + (1 - w) * 0.02, repeat: Infinity }}
          />
        </motion.g>
      )}
    </AnimatePresence>
  );
}

/* ─── 烟雾飘散 ─── */
function SmokeWisp({ x, baseY }: { x: number; baseY: number }) {
  return (
    <motion.path
      d={`M${x} ${baseY} Q${x - 5} ${baseY - 15} ${x} ${baseY - 30} T${x} ${baseY - 60}`}
      fill="none" stroke="#8899AA" strokeWidth="1.5" strokeLinecap="round"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: [0, 0.5, 0], y: -10 }}
      transition={{ duration: 1.5, ease: 'easeOut' }}
    />
  );
}

/* ─── 庆祝音效 ─── */
function playCelebrationTone() {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const notes = [523.25, 659.25, 783.99, 1046.5];
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
  } catch { /* ignore */ }
}

/* ═══════════════════ 主页面 ═══════════════════ */

export default function ChildRoom12() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>('background');
  const [videoFading, setVideoFading] = useState(false);
  const [candles, setCandles] = useState<CandleState[]>(
    Array.from({ length: 3 }, (_, i) => ({ id: i, lit: true }))
  );
  const [micState, setMicState] = useState<'idle' | 'calibrating' | 'ready' | 'denied'>('idle');
  const [volumeLevel, setVolumeLevel] = useState(0); // 0-1 实时音量
  const [musicPlaying, setMusicPlaying] = useState(false);

  const bgMusicRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const blowStartRef = useRef<number | null>(null);
  const thresholdRef = useRef(0.05); // 动态阈值，校准后更新

  /* ─── 视频播放结束 ─── */
  const handleVideoEnded = useCallback(() => {
    setVideoFading(true);
    setTimeout(() => setPhase('cake'), 1200);
  }, []);

  /* ─── 背景音乐 ─── */
  const initBgMusic = useCallback(() => {
    if (bgMusicRef.current) return;
    const audio = new Audio(asset('/birthday-music.mp3'));
    audio.loop = true;
    audio.volume = 0.01;
    bgMusicRef.current = audio;
    audio.play()
      .then(() => setMusicPlaying(true))
      .catch(() => {});
  }, []);

  const toggleMusic = useCallback(async () => {
    const audio = bgMusicRef.current;
    if (!audio) {
      const a = new Audio(asset('/birthday-music.mp3'));
      a.loop = true;
      a.volume = 0.5;
      bgMusicRef.current = a;
      try { await a.play(); setMusicPlaying(true); } catch { /* ignore */ }
      return;
    }
    if (musicPlaying) {
      audio.pause();
      setMusicPlaying(false);
    } else {
      audio.volume = 0.5;
      try { await audio.play(); setMusicPlaying(true); } catch { /* ignore */ }
    }
  }, [musicPlaying]);

  /* ─── cake 阶段渐入背景音乐 ─── */
  useEffect(() => {
    if (phase === 'cake' && bgMusicRef.current) {
      const audio = bgMusicRef.current;
      const tryPlay = audio.play();
      if (tryPlay) {
        tryPlay.then(() => {
          setMusicPlaying(true);
          const fadeIn = setInterval(() => {
            if (audio.volume < 0.45) {
              audio.volume = Math.min(0.5, audio.volume + 0.05);
            } else {
              audio.volume = 0.5;
              clearInterval(fadeIn);
            }
          }, 100);
        }).catch(() => { setMusicPlaying(false); });
      }
    }
  }, [phase]);

  /* ─── 蜡烛全部吹灭时立即停止BGM ─── */
  useEffect(() => {
    if (phase === 'blow' && candles.every((c) => !c.lit) && bgMusicRef.current) {
      bgMusicRef.current.pause();
      setMusicPlaying(false);
    }
  }, [candles, phase]);

  /* ─── cake 阶段 1.5s 后进入 blow ─── */
  useEffect(() => {
    if (phase === 'cake') {
      const timer = setTimeout(() => setPhase('blow'), 1500);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  /* ─── 停止吹气检测 ─── */
  const stopBlowDetection = useCallback(() => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  /* ─── 核心：启动麦克风 + 校准 + 吹气检测（全部在一个用户手势中完成）─── */
  const startMicAndBlow = useCallback(async () => {
    try {
      // 1. 获取麦克风（必须在用户手势中）
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        }
      });
      streamRef.current = stream;

      // 2. 创建 AudioContext 并立即 resume（iOS Safari 必须）
      const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioContext = new Ctor();
      audioContextRef.current = audioContext;
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      // 3. 配置 AnalyserNode
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.3;
      analyser.minDecibels = -90;
      analyser.maxDecibels = -10;
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      analyserRef.current = analyser;

      // 4. 校准阶段：采样 1 秒环境噪声
      setMicState('calibrating');
      const CALIBRATE_MS = 1000;
      const calibrateSamples: number[] = [];
      const calibrateStart = Date.now();

      await new Promise<void>((resolve) => {
        const calibratePoll = setInterval(() => {
          const buf = new Uint8Array(analyser.fftSize);
          analyser.getByteTimeDomainData(buf);
          let sumSq = 0;
          for (let i = 0; i < buf.length; i++) {
            const norm = (buf[i] - 128) / 128;
            sumSq += norm * norm;
          }
          calibrateSamples.push(Math.sqrt(sumSq / buf.length));

          if (Date.now() - calibrateStart >= CALIBRATE_MS) {
            clearInterval(calibratePoll);
            resolve();
          }
        }, 50);
      });

      // 5. 计算阈值 = 环境噪声平均值 × 3（至少 0.03）
      const avgNoise = calibrateSamples.reduce((a, b) => a + b, 0) / calibrateSamples.length;
      const threshold = Math.max(0.03, avgNoise * 3);
      thresholdRef.current = threshold;
      console.log(`[吹蜡烛] 校准完成: 环境噪声=${avgNoise.toFixed(4)}, 阈值=${threshold.toFixed(4)}`);

      // 6. 开始吹气检测
      setMicState('ready');
      const BLOW_DURATION_MS = 300; // 持续吹气 300ms

      pollTimerRef.current = setInterval(() => {
        const buf = new Uint8Array(analyser.fftSize);
        analyser.getByteTimeDomainData(buf);
        let sumSq = 0;
        for (let i = 0; i < buf.length; i++) {
          const norm = (buf[i] - 128) / 128;
          sumSq += norm * norm;
        }
        const rms = Math.sqrt(sumSq / buf.length);

        // 更新实时音量显示 (映射到 0-1)
        const displayLevel = Math.min(1, rms / (threshold * 2));
        setVolumeLevel(displayLevel);

        if (rms > threshold) {
          if (blowStartRef.current === null) {
            blowStartRef.current = Date.now();
          } else if (Date.now() - blowStartRef.current > BLOW_DURATION_MS) {
            // 持续吹气达标 → 熄灭一根蜡烛
            setCandles((prev) => {
              const remaining = prev.filter((c) => c.lit);
              if (remaining.length > 0) {
                return prev.map((c) =>
                  c.id === remaining[0].id ? { ...c, lit: false } : c
                );
              }
              return prev;
            });
            blowStartRef.current = null;
          }
        } else {
          blowStartRef.current = null;
        }
      }, 50);

    } catch (e) {
      console.warn('[吹蜡烛] 麦克风失败:', e);
      setMicState('denied');
    }
  }, []);

  /* ─── 全部熄灭 → 祝福视频 ─── */
  useEffect(() => {
    if (phase === 'blow' && candles.every((c) => !c.lit)) {
      stopBlowDetection();
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
      setVolumeLevel(0);
      setTimeout(() => {
        triggerConfetti();
        playCelebrationTone();
        setPhase('blessing');
      }, 800);
    }
  }, [candles, phase, stopBlowDetection]);

  /* ─── 手动熄灭（fallback）─── */
  const handleManualBlow = useCallback((id: number) => {
    setCandles((prev) => prev.map((c) => (c.id === id && c.lit ? { ...c, lit: false } : c)));
  }, []);

  /* ─── 清理 ─── */
  useEffect(() => {
    return () => {
      stopBlowDetection();
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
      if (audioContextRef.current) audioContextRef.current.close();
      bgMusicRef.current?.pause();
    };
  }, [stopBlowDetection]);

  /* ─── 蛋糕蜡烛X坐标 ─── */
  const candleXs = [130, 150, 170];

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ background: '#000' }}>
      {/* ═══ 背景图 ═══ */}
      <img
        src={asset("/Geburtstag.webp")}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        style={{ zIndex: 0 }}
      />

      {/* ═══ Phase 1: 点击屏幕 ═══ */}
      <AnimatePresence>
        {phase === 'background' && (
          <motion.div
            key="bg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 z-10 flex items-center justify-center"
            style={{ cursor: 'pointer' }}
            onClick={() => {
              initBgMusic();
              setPhase('video');
            }}
          >
            <motion.p
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                position: 'absolute',
                bottom: '12%',
                width: '100%',
                textAlign: 'center',
                fontFamily: 'Quicksand, sans-serif',
                fontSize: 16,
                color: 'rgba(255,255,255,0.8)',
                letterSpacing: '0.1em',
              }}
            >
              点击屏幕
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ Phase 2: 生日歌视频 ═══ */}
      <AnimatePresence>
        {phase === 'video' && (
          <BirthdayVideoPlayer fading={videoFading} onEnded={handleVideoEnded} />
        )}
      </AnimatePresence>

      {/* ═══ Phase 3-4: 蛋糕 + 吹蜡烛 ═══ */}
      <AnimatePresence>
        {(phase === 'cake' || phase === 'blow') && (
          <motion.div
            key="cake-scene"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 z-30 flex flex-col items-center justify-center"
          >
            {/* 遮罩 */}
            <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.6)' }} />

            {/* 内容区 */}
            <div className="relative z-10 flex flex-col items-center">
              {/* 提示文字 */}
              {(phase === 'cake' || phase === 'blow') && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  style={{
                    fontFamily: 'Quicksand, sans-serif',
                    fontSize: 18,
                    color: 'rgba(255,255,255,0.9)',
                    textAlign: 'center',
                    lineHeight: 2,
                    marginBottom: 30,
                    textShadow: '0 2px 8px rgba(0,0,0,0.3)',
                  }}
                >
                  先许愿，{'\n'}再吹蜡烛哦～
                </motion.p>
              )}

              {/* ─── 三层蛋糕 SVG ─── */}
              <motion.div
                initial={{ opacity: 0, scale: 0.85, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <svg width="280" height="260" viewBox="0 0 300 260">
                  <defs>
                    <radialGradient id="bdFlameGlow">
                      <stop offset="0%" stopColor="#F4A261" />
                      <stop offset="100%" stopColor="#E76F51" stopOpacity="0" />
                    </radialGradient>
                    <linearGradient id="bdFlameBody" x1="0" y1="1" x2="0" y2="0">
                      <stop offset="0%" stopColor="#E76F51" />
                      <stop offset="50%" stopColor="#F4A261" />
                      <stop offset="100%" stopColor="#E9C46A" />
                    </linearGradient>
                    <linearGradient id="bdCakeBody" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#F8D0DC" />
                      <stop offset="100%" stopColor="#E8A8BC" />
                    </linearGradient>
                    <linearGradient id="bdFrosting" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#F4A261" />
                      <stop offset="100%" stopColor="#E9C46A" />
                    </linearGradient>
                  </defs>

                  <ellipse cx={150} cy={248} rx={110} ry={10} fill="#D6EBF5" />
                  <ellipse cx={150} cy={248} rx={100} ry={7} fill="#B8D4E8" />

                  <rect x={40} y={185} width={220} height={60} rx={10} fill="url(#bdCakeBody)" />
                  <rect x={37} y={180} width={226} height={12} rx={6} fill="url(#bdFrosting)" />
                  <circle cx={55} cy={190} r={5} fill="url(#bdFrosting)" />
                  <circle cx={85} cy={192} r={4} fill="url(#bdFrosting)" />
                  <circle cx={120} cy={191} r={5} fill="url(#bdFrosting)" />
                  <circle cx={180} cy={190} r={4} fill="url(#bdFrosting)" />
                  <circle cx={215} cy={192} r={5} fill="url(#bdFrosting)" />
                  <circle cx={245} cy={191} r={4} fill="url(#bdFrosting)" />
                  <circle cx={80} cy={215} r={4} fill="#E9C46A" opacity={0.6} />
                  <circle cx={130} cy={210} r={3} fill="#E9C46A" opacity={0.5} />
                  <circle cx={170} cy={218} r={4} fill="#E9C46A" opacity={0.6} />
                  <circle cx={220} cy={212} r={3} fill="#E9C46A" opacity={0.5} />

                  <rect x={70} y={115} width={160} height={70} rx={8} fill="url(#bdCakeBody)" />
                  <rect x={67} y={110} width={166} height={10} rx={5} fill="url(#bdFrosting)" />
                  <circle cx={85} cy={118} r={4} fill="url(#bdFrosting)" />
                  <circle cx={115} cy={120} r={3.5} fill="url(#bdFrosting)" />
                  <circle cx={185} cy={119} r={4} fill="url(#bdFrosting)" />
                  <circle cx={215} cy={118} r={3.5} fill="url(#bdFrosting)" />
                  <circle cx={100} cy={148} r={3} fill="#E9C46A" opacity={0.5} />
                  <circle cx={150} cy={145} r={4} fill="#E9C46A" opacity={0.6} />
                  <circle cx={200} cy={150} r={3} fill="#E9C46A" opacity={0.5} />

                  <rect x={100} y={60} width={100} height={58} rx={7} fill="url(#bdCakeBody)" />
                  <rect x={97} y={55} width={106} height={8} rx={4} fill="url(#bdFrosting)" />
                  <circle cx={115} cy={62} r={3} fill="url(#bdFrosting)" />
                  <circle cx={150} cy={63} r={3.5} fill="url(#bdFrosting)" />
                  <circle cx={185} cy={62} r={3} fill="url(#bdFrosting)" />
                  <circle cx={125} cy={88} r={3} fill="#E9C46A" opacity={0.5} />
                  <circle cx={175} cy={85} r={3} fill="#E9C46A" opacity={0.5} />

                  {candleXs.map((cx, i) => (
                    <g key={i}>
                      <rect
                        x={cx - 4} y={38} width={8} height={20} rx={2}
                        fill={candles[i].lit ? '#F8C8DC' : '#D6EBF5'}
                        style={{ cursor: candles[i].lit ? 'pointer' : 'default' }}
                        onClick={() => handleManualBlow(i)}
                      />
                      <line x1={cx} y1={38} x2={cx} y2={33} stroke="#405B7A" strokeWidth={1.5} />
                      <Flame lit={candles[i].lit} x={cx} baseY={30} wind={volumeLevel} />
                      {!candles[i].lit && <SmokeWisp x={cx} baseY={30} />}
                    </g>
                  ))}
                </svg>
              </motion.div>

              {/* ═══ 麦克风控制区 ═══ */}
              <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>

                {/* 还没开启麦克风 → 显示开始按钮 */}
                {phase === 'blow' && micState === 'idle' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center gap-3"
                  >
                    <button
                      onClick={startMicAndBlow}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '12px 28px',
                        borderRadius: 24,
                        border: 'none',
                        background: 'linear-gradient(135deg, #6B9AC4, #7BB3D4)',
                        color: '#fff',
                        fontSize: 16,
                        fontWeight: 600,
                        fontFamily: 'Quicksand, sans-serif',
                        cursor: 'pointer',
                        boxShadow: '0 4px 20px rgba(107,154,196,0.5)',
                      }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                        <line x1="12" y1="19" x2="12" y2="23" />
                        <line x1="8" y1="23" x2="16" y2="23" />
                      </svg>
                      点我开始吹蜡烛
                    </button>
                    <button
                      onClick={() => {
                        const remaining = candles.filter((c) => c.lit);
                        if (remaining.length > 0) {
                          setCandles((prev) =>
                            prev.map((c) =>
                              c.id === remaining[0].id ? { ...c, lit: false } : c
                            )
                          );
                        }
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        fontFamily: 'Quicksand, sans-serif',
                        fontSize: 13,
                        color: 'rgba(255,255,255,0.4)',
                        cursor: 'pointer',
                      }}
                    >
                      或点击蜡烛手动熄灭
                    </button>
                  </motion.div>
                )}

                {/* 校准中 */}
                {phase === 'blow' && micState === 'calibrating' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center gap-2"
                  >
                    <motion.div
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      style={{
                        fontFamily: 'Quicksand, sans-serif',
                        fontSize: 14,
                        color: 'rgba(255,255,255,0.7)',
                      }}
                    >
                      🎤 正在校准环境...
                    </motion.div>
                  </motion.div>
                )}

                {/* 就绪：显示实时音量 + 吹气提示 */}
                {phase === 'blow' && micState === 'ready' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center gap-3"
                  >
                    {/* 实时音量条 */}
                    <div style={{ width: 160, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                      <div style={{
                        width: '100%',
                        height: 6,
                        borderRadius: 3,
                        background: 'rgba(255,255,255,0.15)',
                        overflow: 'hidden',
                      }}>
                        <motion.div
                          style={{
                            height: '100%',
                            borderRadius: 3,
                            background: volumeLevel > 0.5
                              ? 'linear-gradient(90deg, #E9C46A, #F4A261)'
                              : 'linear-gradient(90deg, #6B9AC4, #B8D4E8)',
                            width: `${volumeLevel * 100}%`,
                            transition: 'width 0.05s linear',
                          }}
                        />
                      </div>
                      <p style={{
                        fontFamily: 'Quicksand, sans-serif',
                        fontSize: 13,
                        color: 'rgba(255,255,255,0.5)',
                        margin: 0,
                      }}>
                        对着手机吹气～还剩 {candles.filter((c) => c.lit).length} 支
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* 麦克风被拒绝 */}
                {phase === 'blow' && micState === 'denied' && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{
                      fontFamily: 'Quicksand, sans-serif',
                      fontSize: 13,
                      color: 'rgba(255,255,255,0.5)',
                    }}
                  >
                    点击蜡烛手动熄灭哦～
                  </motion.p>
                )}
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ 浮动音乐按钮 ═══ */}
      {(phase === 'cake' || phase === 'blow') && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          onClick={toggleMusic}
          style={{
            position: 'fixed',
            top: 16,
            right: 16,
            width: 40,
            height: 40,
            borderRadius: '50%',
            border: 'none',
            background: musicPlaying
              ? 'rgba(184,160,210,0.6)'
              : 'rgba(255,255,255,0.15)',
            color: '#fff',
            fontSize: 18,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 40,
            backdropFilter: 'blur(8px)',
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
          }}
          title={musicPlaying ? '暂停音乐' : '播放音乐'}
        >
          {musicPlaying ? '🎵' : '🔇'}
        </motion.button>
      )}

      {/* ═══ Phase 5: 祝福视频 ═══ */}
      <AnimatePresence>
        {phase === 'blessing' && (
          <BlessingVideoPlayer onEnded={() => setPhase('ending')} />
        )}
      </AnimatePresence>

      {/* ═══ Phase 6: 结束文字 ═══ */}
      <AnimatePresence>
        {phase === 'ending' && (
          <motion.div
            key="ending"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.7)' }}
          >
            <div className="flex flex-col items-center">
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                style={{
                  fontFamily: 'Quicksand, sans-serif',
                  fontSize: 20,
                  lineHeight: 2.2,
                  color: 'rgba(255,255,255,0.9)',
                  textAlign: 'center',
                  marginBottom: 16,
                }}
              >
                希望你可以一直从心所欲不逾矩。
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 2 }}
                style={{
                  fontFamily: 'Quicksand, sans-serif',
                  fontSize: 28,
                  fontWeight: 700,
                  color: '#E9C46A',
                  textShadow: '0 2px 12px rgba(233,196,106,0.4)',
                  marginBottom: 40,
                }}
              >
                生日快乐🎂
              </motion.p>
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 3.5, duration: 0.6 }}
                onClick={() => navigate('/', { state: { buildingOpen: true } })}
                style={{
                  padding: '10px 28px',
                  borderRadius: 20,
                  border: '1px solid rgba(255,255,255,0.2)',
                  background: 'rgba(255,255,255,0.12)',
                  color: 'rgba(255,255,255,0.8)',
                  fontSize: 14,
                  fontWeight: 600,
                  fontFamily: 'Quicksand, sans-serif',
                  cursor: 'pointer',
                  backdropFilter: 'blur(6px)',
                }}
              >
                回到日历
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════ 视频播放组件 ══════════════════ */

function BirthdayVideoPlayer({ fading, onEnded }: { fading: boolean; onEnded: () => void }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.currentTime = 0;
    v.play().catch(() => {
      v.muted = true;
      v.play().catch(() => {});
    });
  }, []);
  return (
    <motion.div
      className="absolute inset-0 z-20 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: fading ? 0 : 1 }}
      transition={{ duration: fading ? 1.2 : 0.8 }}
    >
      <img src={asset("/Geburtstag.webp")} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <video
        ref={ref}
        src={asset("/birthday-video.mp4")}
        preload="none"
        playsInline
        onEnded={onEnded}
        style={{ maxWidth: '120%', maxHeight: '120%', objectFit: 'contain', position: 'relative', zIndex: 1 }}
      />
    </motion.div>
  );
}

function BlessingVideoPlayer({ onEnded }: { onEnded: () => void }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.currentTime = 0;
    v.play().catch(() => {
      v.muted = true;
      v.play().catch(() => {});
    });
  }, []);
  return (
    <motion.div
      className="absolute inset-0 z-40 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
    >
      <img src={asset("/Geburtstag.webp")} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <video
        ref={ref}
        src={asset("/blessing-video.mp4")}
        preload="none"
        playsInline
        onEnded={onEnded}
        style={{ maxWidth: '120%', maxHeight: '120%', objectFit: 'contain', position: 'relative', zIndex: 1 }}
      />
    </motion.div>
  );
}
