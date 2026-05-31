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

/* ─── SVG 火苗（从 CandleBlow 复用，ID 加前缀避免冲突）─── */
function Flame({ lit, x, baseY }: { lit: boolean; x: number; baseY: number }) {
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
          {/* 外发光 */}
          <motion.ellipse
            cx={x} cy={baseY - 7} rx={10} ry={16}
            fill="url(#bdFlameGlow)"
            opacity={0.4}
            animate={{ rx: [10, 12, 9, 11], ry: [16, 18, 14, 17] }}
            transition={{ duration: 0.15, repeat: Infinity }}
          />
          {/* 主体 */}
          <motion.ellipse
            cx={x} cy={baseY - 5} rx={5} ry={10}
            fill="url(#bdFlameBody)"
            animate={{
              ry: [10, 11.5, 9.5, 10.5],
              rx: [5, 5.5, 4.5, 5.2],
              opacity: [0.95, 1, 0.85, 0.95],
            }}
            transition={{ duration: 0.12, repeat: Infinity }}
          />
          {/* 内核 */}
          <motion.ellipse
            cx={x} cy={baseY - 2} rx={2.5} ry={5}
            fill="#FFF9F0" opacity={0.9}
            animate={{ ry: [5, 5.5, 4.5, 5], opacity: [0.9, 1, 0.85, 0.95] }}
            transition={{ duration: 0.1, repeat: Infinity }}
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
  const [micAccess, setMicAccess] = useState<'pending' | 'pre-granted' | 'granted' | 'denied'>('pending');
  const [musicPlaying, setMusicPlaying] = useState(false);

  const bgMusicRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const blowStartRef = useRef<number | null>(null);
  const silentCountRef = useRef(0);

  /* ─── 视频播放结束 ─── */
  const handleVideoEnded = useCallback(() => {
    setVideoFading(true);
    setTimeout(() => setPhase('cake'), 1200);
  }, []);

  /* ─── 背景音乐：在用户首次点击时预加载并"解锁" ─── */
  const initBgMusic = useCallback(() => {
    if (bgMusicRef.current) return;
    const audio = new Audio(asset('/birthday-music.mp3'));
    audio.loop = true;
    audio.volume = 0.01;       // 非0音量播放，确保浏览器认为是"真正播放"
    bgMusicRef.current = audio;
    // 在用户手势中播放，"解锁"音频
    audio.play()
      .then(() => setMusicPlaying(true))
      .catch(() => {});
  }, []);

  /* ─── 手动播放/切换背景音乐（用户手势中调用） ─── */
  const toggleMusic = useCallback(async () => {
    const audio = bgMusicRef.current;
    if (!audio) {
      // 还没创建就新建一个
      const a = new Audio(asset('/birthday-music.mp3'));
      a.loop = true;
      a.volume = 0.5;
      bgMusicRef.current = a;
      try {
        await a.play();
        setMusicPlaying(true);
      } catch { /* ignore */ }
      return;
    }
    if (musicPlaying) {
      audio.pause();
      setMusicPlaying(false);
    } else {
      audio.volume = 0.5;
      try {
        await audio.play();
        setMusicPlaying(true);
      } catch { /* ignore */ }
    }
  }, [musicPlaying]);

  /* ─── cake 阶段渐入背景音乐 ─── */
  useEffect(() => {
    if (phase === 'cake' && bgMusicRef.current) {
      const audio = bgMusicRef.current;
      // 尝试继续播放（可能被视频暂停了）
      const tryPlay = audio.play();
      if (tryPlay) {
        tryPlay.then(() => {
          setMusicPlaying(true);
          // 渐入到 0.5
          const fadeIn = setInterval(() => {
            if (audio.volume < 0.45) {
              audio.volume = Math.min(0.5, audio.volume + 0.05);
            } else {
              audio.volume = 0.5;
              clearInterval(fadeIn);
            }
          }, 100);
        }).catch(() => {
          // 自动播放被拒 → 不设 musicPlaying，让浮动按钮显示
          setMusicPlaying(false);
        });
      }
    }
  }, [phase]);

  /* ─── 音乐渐弱 ─── */
  useEffect(() => {
    if (phase === 'blessing' && bgMusicRef.current) {
      const audio = bgMusicRef.current;
      const fade = setInterval(() => {
        if (audio.volume > 0.05) {
          audio.volume = Math.max(0, audio.volume - 0.05);
        } else {
          audio.pause();
          clearInterval(fade);
        }
      }, 100);
    }
  }, [phase]);

  /* ─── cake 阶段 1.5s 后进入 blow ─── */
  useEffect(() => {
    if (phase === 'cake') {
      const timer = setTimeout(() => setPhase('blow'), 1500);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  /* ─── 辅助：创建 AudioContext（兼容 Safari） ─── */
  const createAudioContext = useCallback(() => {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    return new Ctor();
  }, []);

  /* ─── 辅助：配置 AnalyserNode ─── */
  const setupAnalyser = useCallback((ctx: AudioContext, stream: MediaStream) => {
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 512;
    analyser.smoothingTimeConstant = 0.3;
    analyser.minDecibels = -90;
    analyser.maxDecibels = -10;
    ctx.createMediaStreamSource(stream).connect(analyser);
    return analyser;
  }, []);

  /* ─── 预请求麦克风（在第一次用户点击时调用，提前获取权限） ─── */
  const preRequestMic = useCallback(async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) return; // 非 HTTPS 或不支持
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      // 在用户手势中创建 AudioContext + 立即 resume（iOS Safari 必须）
      const audioContext = createAudioContext();
      audioContextRef.current = audioContext;
      // iOS Safari 始终以 suspended 状态创建，必须 resume
      if (audioContext.state === 'suspended') {
        audioContext.resume().catch(() => {});
      }
      const analyser = setupAnalyser(audioContext, stream);
      analyserRef.current = analyser;
      setMicAccess('pre-granted');
    } catch (e) {
      console.warn('麦克风预请求失败:', e);
    }
  }, [createAudioContext, setupAnalyser]);

  /* ─── 吹蜡烛检测（RMS 时域，比频率域更可靠） ─── */
  const startBlowDetection = useCallback(() => {
    if (pollTimerRef.current) return; // 已在运行

    const BLOW_RMS_THRESHOLD = 0.12;  // RMS 阈值（0~1 范围）
    const BLOW_DURATION_MS = 400;      // 需要持续吹气的时长

    pollTimerRef.current = setInterval(() => {
      const analyser = analyserRef.current;
      if (!analyser) return;

      // 读取时域数据
      const bufferLength = analyser.fftSize;
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteTimeDomainData(dataArray);

      // 计算 RMS（均方根）
      let sumSquares = 0;
      let allSilent = true;
      for (let i = 0; i < bufferLength; i++) {
        const normalized = (dataArray[i] - 128) / 128; // 归一化到 -1~1
        sumSquares += normalized * normalized;
        if (dataArray[i] !== 128) allSilent = false;
      }
      const rms = Math.sqrt(sumSquares / bufferLength);

      // iOS Safari 已知 bug：流突然返回全静音（全是 128）
      // 连续 20 次 → 重建管道
      if (allSilent) {
        silentCountRef.current++;
        if (silentCountRef.current > 20) {
          silentCountRef.current = 0;
          console.warn('检测到静音流，尝试重建音频管道...');
          rebuildPipeline();
          return;
        }
      } else {
        silentCountRef.current = 0;
      }

      if (rms > BLOW_RMS_THRESHOLD) {
        if (blowStartRef.current === null) {
          blowStartRef.current = Date.now();
        } else if (Date.now() - blowStartRef.current > BLOW_DURATION_MS) {
          // 持续吹气达标 → 熄灭一根
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
    }, 50); // 50ms 轮询，比 rAF 在移动端更稳定
  }, []);

  /* ─── 停止吹气检测 ─── */
  const stopBlowDetection = useCallback(() => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  /* ─── 重建音频管道（iOS Safari 流恢复） ─── */
  const rebuildPipeline = useCallback(async () => {
    stopBlowDetection();
    try {
      // 关闭旧的
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
      if (audioContextRef.current) audioContextRef.current.close().catch(() => {});

      // 重建
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const ctx = createAudioContext();
      audioContextRef.current = ctx;
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});
      analyserRef.current = setupAnalyser(ctx, stream);
      startBlowDetection();
    } catch (e) {
      console.warn('重建音频管道失败:', e);
      setMicAccess('denied');
    }
  }, [createAudioContext, setupAnalyser, startBlowDetection, stopBlowDetection]);

  const requestMic = useCallback(async () => {
    try {
      // 如果预请求已经成功，直接复用
      if (streamRef.current && analyserRef.current) {
        // 检查 stream 是否还活着
        const trackAlive = streamRef.current.getTracks().some((t) => t.readyState === 'live');
        if (trackAlive) {
          // 确保 AudioContext 不是 suspended
          const ctx = audioContextRef.current;
          if (ctx && ctx.state === 'suspended') {
            await ctx.resume();
          }
          setMicAccess('granted');
          startBlowDetection();
          return;
        }
        // stream 已死，需要重建
      }

      // 全新请求
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const ctx = createAudioContext();
      audioContextRef.current = ctx;
      if (ctx.state === 'suspended') await ctx.resume();
      analyserRef.current = setupAnalyser(ctx, stream);
      setMicAccess('granted');
      startBlowDetection();
    } catch (e) {
      console.warn('麦克风请求失败:', e);
      setMicAccess('denied');
    }
  }, [createAudioContext, setupAnalyser, startBlowDetection]);

  /* ─── blow 阶段自动启动吹气检测（权限已在第一次点击时预获取） ─── */
  useEffect(() => {
    if (phase === 'blow' && (micAccess === 'pre-granted' || micAccess === 'pending')) {
      requestMic();
    }
  }, [phase, micAccess, requestMic]);

  /* ─── 全部熄灭 → 祝福视频 ─── */
  useEffect(() => {
    if (phase === 'blow' && candles.every((c) => !c.lit)) {
      stopBlowDetection();
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
      setTimeout(() => {
        triggerConfetti();
        playCelebrationTone();
        setPhase('blessing');
      }, 800);
    }
  }, [candles, phase, stopBlowDetection]);

  /* ─── 手动熄灭（无麦克风时） ─── */
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

  /* ─── 蛋糕蜡烛X坐标（居中于顶层） ─── */
  const candleXs = [130, 150, 170];

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ background: '#000' }}>
      {/* ═══ 背景图（始终显示）═══ */}
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
              preRequestMic(); // 在用户手势中提前获取麦克风权限
              initBgMusic();   // 在用户手势中初始化并"解锁"背景音乐
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

      {/* ═══ Phase 3-4: 蛋糕 + 吹蜡烛（吹灭后淡出）═══ */}
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
            {/* 60% 黑色遮罩 */}
            <div
              className="absolute inset-0"
              style={{ background: 'rgba(0,0,0,0.6)' }}
            />

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
                    {/* 火苗渐变 */}
                    <radialGradient id="bdFlameGlow">
                      <stop offset="0%" stopColor="#F4A261" />
                      <stop offset="100%" stopColor="#E76F51" stopOpacity="0" />
                    </radialGradient>
                    <linearGradient id="bdFlameBody" x1="0" y1="1" x2="0" y2="0">
                      <stop offset="0%" stopColor="#E76F51" />
                      <stop offset="50%" stopColor="#F4A261" />
                      <stop offset="100%" stopColor="#E9C46A" />
                    </linearGradient>
                    {/* 蛋糕体渐变 */}
                    <linearGradient id="bdCakeBody" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#F8D0DC" />
                      <stop offset="100%" stopColor="#E8A8BC" />
                    </linearGradient>
                    {/* 糖霜渐变 */}
                    <linearGradient id="bdFrosting" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#F4A261" />
                      <stop offset="100%" stopColor="#E9C46A" />
                    </linearGradient>
                  </defs>

                  {/* 底盘 */}
                  <ellipse cx={150} cy={248} rx={110} ry={10} fill="#D6EBF5" />
                  <ellipse cx={150} cy={248} rx={100} ry={7} fill="#B8D4E8" />

                  {/* 底层蛋糕 */}
                  <rect x={40} y={185} width={220} height={60} rx={10} fill="url(#bdCakeBody)" />
                  {/* 底层糖霜 */}
                  <rect x={37} y={180} width={226} height={12} rx={6} fill="url(#bdFrosting)" />
                  <circle cx={55} cy={190} r={5} fill="url(#bdFrosting)" />
                  <circle cx={85} cy={192} r={4} fill="url(#bdFrosting)" />
                  <circle cx={120} cy={191} r={5} fill="url(#bdFrosting)" />
                  <circle cx={180} cy={190} r={4} fill="url(#bdFrosting)" />
                  <circle cx={215} cy={192} r={5} fill="url(#bdFrosting)" />
                  <circle cx={245} cy={191} r={4} fill="url(#bdFrosting)" />
                  {/* 底层装饰 */}
                  <circle cx={80} cy={215} r={4} fill="#E9C46A" opacity={0.6} />
                  <circle cx={130} cy={210} r={3} fill="#E9C46A" opacity={0.5} />
                  <circle cx={170} cy={218} r={4} fill="#E9C46A" opacity={0.6} />
                  <circle cx={220} cy={212} r={3} fill="#E9C46A" opacity={0.5} />

                  {/* 中层蛋糕 */}
                  <rect x={70} y={115} width={160} height={70} rx={8} fill="url(#bdCakeBody)" />
                  {/* 中层糖霜 */}
                  <rect x={67} y={110} width={166} height={10} rx={5} fill="url(#bdFrosting)" />
                  <circle cx={85} cy={118} r={4} fill="url(#bdFrosting)" />
                  <circle cx={115} cy={120} r={3.5} fill="url(#bdFrosting)" />
                  <circle cx={185} cy={119} r={4} fill="url(#bdFrosting)" />
                  <circle cx={215} cy={118} r={3.5} fill="url(#bdFrosting)" />
                  {/* 中层装饰 */}
                  <circle cx={100} cy={148} r={3} fill="#E9C46A" opacity={0.5} />
                  <circle cx={150} cy={145} r={4} fill="#E9C46A" opacity={0.6} />
                  <circle cx={200} cy={150} r={3} fill="#E9C46A" opacity={0.5} />

                  {/* 顶层蛋糕 */}
                  <rect x={100} y={60} width={100} height={58} rx={7} fill="url(#bdCakeBody)" />
                  {/* 顶层糖霜 */}
                  <rect x={97} y={55} width={106} height={8} rx={4} fill="url(#bdFrosting)" />
                  <circle cx={115} cy={62} r={3} fill="url(#bdFrosting)" />
                  <circle cx={150} cy={63} r={3.5} fill="url(#bdFrosting)" />
                  <circle cx={185} cy={62} r={3} fill="url(#bdFrosting)" />
                  {/* 顶层装饰 */}
                  <circle cx={125} cy={88} r={3} fill="#E9C46A" opacity={0.5} />
                  <circle cx={175} cy={85} r={3} fill="#E9C46A" opacity={0.5} />

                  {/* 蜡烛 */}
                  {candleXs.map((cx, i) => (
                    <g key={i}>
                      {/* 蜡烛体 */}
                      <rect
                        x={cx - 4} y={38} width={8} height={20} rx={2}
                        fill={candles[i].lit ? '#F8C8DC' : '#D6EBF5'}
                        style={{ cursor: candles[i].lit ? 'pointer' : 'default' }}
                        onClick={() => handleManualBlow(i)}
                      />
                      {/* 烛芯 */}
                      <line
                        x1={cx} y1={38} x2={cx} y2={33}
                        stroke="#405B7A" strokeWidth={1.5}
                      />
                      {/* 火苗 */}
                      <Flame lit={candles[i].lit} x={cx} baseY={30} />
                      {/* 烟雾 */}
                      {!candles[i].lit && <SmokeWisp x={cx} baseY={30} />}
                    </g>
                  ))}
                </svg>
              </motion.div>

              {/* 麦克风状态提示 */}
              {phase === 'blow' && micAccess === 'pending' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center gap-3"
                  style={{ marginTop: 20 }}
                >
                  <button
                    onClick={requestMic}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '10px 24px',
                      borderRadius: 20,
                      border: 'none',
                      background: '#6B9AC4',
                      color: '#fff',
                      fontSize: 14,
                      fontWeight: 600,
                      fontFamily: 'Quicksand, sans-serif',
                      cursor: 'pointer',
                      boxShadow: '0 4px 15px rgba(107,154,196,0.4)',
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                      <line x1="12" y1="19" x2="12" y2="23" />
                      <line x1="8" y1="23" x2="16" y2="23" />
                    </svg>
                    开启麦克风吹蜡烛
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
                      color: 'rgba(255,255,255,0.5)',
                      cursor: 'pointer',
                    }}
                  >
                    手动熄灭蜡烛
                  </button>
                </motion.div>
              )}
              {(phase === 'blow' && (micAccess === 'granted' || micAccess === 'pre-granted')) && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    marginTop: 20,
                    fontFamily: 'Quicksand, sans-serif',
                    fontSize: 14,
                    color: 'rgba(255,255,255,0.6)',
                  }}
                >
                  对着手机吹气，吹灭蜡烛！还剩 {candles.filter((c) => c.lit).length} 支
                </motion.p>
              )}
              {phase === 'blow' && micAccess === 'denied' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center gap-3"
                  style={{ marginTop: 20 }}
                >
                  <p style={{
                    fontFamily: 'Quicksand, sans-serif',
                    fontSize: 13,
                    color: 'rgba(255,255,255,0.5)',
                  }}>
                    点击蜡烛手动熄灭哦～
                  </p>
                </motion.div>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ 浮动音乐按钮（cake/blow 阶段） ═══ */}
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

/* ═══════════════════ 视频播放组件（确保从头播放）═══════════════════ */

function BirthdayVideoPlayer({ fading, onEnded }: { fading: boolean; onEnded: () => void }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.currentTime = 0;
    // 先尝试有声音播放，被浏览器阻止则静音重试
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
        playsInline
        onEnded={onEnded}
        style={{ maxWidth: '120%', maxHeight: '120%', objectFit: 'contain', position: 'relative', zIndex: 1 }}
      />
    </motion.div>
  );
}
