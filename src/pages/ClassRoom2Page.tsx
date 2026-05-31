import { asset } from "@/lib/assets";
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router';

/* ═══════════════════════════════════════════
   ClassRoom 2 Page - 教室 + iPod 音乐播放器
   ═══════════════════════════════════════════ */

type Phase = 'travel' | 'classroom' | 'dialog' | 'dialog-cards' | 'ipod';

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

/* ── 歌曲数据 ── */
interface Song {
  id: number;
  title: string;
  artist: string;
  duration: string;
  cover: string;
  src: string;
}

const SONGS: Song[] = [
  { id: 1, title: '下一站天后', artist: '杨玥', duration: '1:15', cover: asset('/album-cover-1.webp'), src: asset('/song-1.m4a') },
  { id: 2, title: '月牙湾', artist: '杨玥', duration: '1:23', cover: asset('/album-cover-2.webp'), src: asset('/song-2.m4a') },
];

/* ── 对话文案 ── */
const DIALOG_CARDS: string[][] = [
  ['听说你很喜欢听歌，', '也很会唱歌。'],
  ['所以我偷偷练习了几首歌'],
  ['不许嫌弃我跑调哦！'],
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
    <span className="font-display text-[28px] leading-[1.8]" style={{ color: '#2c5282' }}>
      {displayed}
      <span style={{ opacity: cursorVisible ? 1 : 0, transition: 'opacity 0.2s', color: '#6B9AC4' }}>|</span>
    </span>
  );
}

/* ═══════════════════ 逐句淡入段落 ═══════════════════ */

function FadeParagraph({ lines, visible, delay = 0 }: { lines: string[]; visible: boolean; delay?: number }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center justify-center"
          style={{
            background: 'rgba(255, 253, 248, 0.45)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            borderRadius: 24,
            boxShadow: '0 8px 32px rgba(107, 154, 196, 0.08), inset 0 1px 0 rgba(255,255,255,0.6)',
            padding: '24px 28px',
            maxWidth: 340,
            width: '100%',
            minHeight: 120,
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
          <div className="relative z-10">
            {lines.map((line, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: delay + i * 1.8 }}
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

/* ═══════════════════ iPod 播放器 ═══════════════════ */

function IpodPlayer({ songs }: { songs: Song[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const currentSong = songs[currentIndex];
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 切歌时加载新音频
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    const audio = new Audio(currentSong.src);
    audioRef.current = audio;
    setProgress(0);

    audio.addEventListener('ended', () => {
      // 自动下一首
      setCurrentIndex((i) => (i + 1) % songs.length);
    });

    if (isPlaying) {
      audio.play().catch(() => {});
    }

    return () => {
      audio.pause();
      audio.removeEventListener('ended', () => {});
    };
  }, [currentIndex, currentSong.src, songs.length]);

  // 播放/暂停
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  // 进度条实时更新
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const update = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };
    audio.addEventListener('timeupdate', update);
    return () => audio.removeEventListener('timeupdate', update);
  }, [currentIndex]);

  const togglePlay = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsPlaying((p) => !p);
  }, []);
  const nextSong = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsPlaying(true);
    setCurrentIndex((i) => (i + 1) % songs.length);
    setProgress(0);
  }, [songs.length]);
  const prevSong = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsPlaying(true);
    setCurrentIndex((i) => (i - 1 + songs.length) % songs.length);
    setProgress(0);
  }, [songs.length]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] }}
      className="relative flex flex-col items-center"
    >
      {/* iPod image */}
      <div className="relative" style={{ width: 380, height: 560 }}>
        <img
          src={asset("/ipod-handdrawn.webp")}
          alt="iPod"
          className="w-full h-full object-contain"
          draggable={false}
          style={{ filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.15))' }}
        />

        {/* Song info overlay on screen area */}
        <div
          className="absolute flex flex-col items-center justify-center px-3 py-2"
          style={{
            top: '12%',
            left: '15%',
            right: '15%',
            height: '30%',
          }}
        >
          {/* Album cover */}
          <img
            src={currentSong.cover}
            alt={currentSong.title}
            className="w-24 h-24 rounded-lg mb-2 object-cover"
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
          />
          <p className="font-body text-[14px] font-bold truncate w-full text-center" style={{ color: '#2D3748' }}>
            {currentSong.title}
          </p>
          <p className="font-body text-[12px] truncate w-full text-center" style={{ color: '#6B7280' }}>
            {currentSong.artist} · {currentSong.duration}
          </p>

          {/* Progress bar */}
          <div className="w-full h-1 rounded-full mt-2" style={{ background: 'rgba(0,0,0,0.1)' }}>
            <div
              className="h-full rounded-full"
              style={{ width: `${Math.min(progress, 100)}%`, background: '#E091A3', transition: 'width 0.1s linear' }}
            />
          </div>
        </div>

        {/* ═══ Click Wheel Interaction Zones — aligned to hand-drawn wheel ═══ */}

        {/* Center gray circle: Play / Pause */}
        <div
          className="absolute rounded-full cursor-pointer flex items-center justify-center"
          style={{
            top: '50%',
            left: '39%',
            width: '22%',
            height: '20%',
          }}
          onClick={togglePlay}
        >
          <div className="pointer-events-none select-none">
            {isPlaying ? (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="rgba(80,80,80,0.6)">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="rgba(80,80,80,0.6)">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </div>
        </div>

        {/* Left of wheel: Previous song */}
        <div
          className="absolute cursor-pointer flex items-center justify-center"
          style={{
            top: '50%',
            left: '24%',
            width: '22%',
            height: '20%',
          }}
          onClick={prevSong}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(100,100,100,0.4)" strokeWidth="2.5" className="pointer-events-none select-none">
            <path d="M19 20L9 12l10-8v16zM5 19h2V5H5v14z" />
          </svg>
        </div>

        {/* Right of wheel: Next song */}
        <div
          className="absolute cursor-pointer flex items-center justify-center"
          style={{
            top: '50%',
            right: '24%',
            width: '22%',
            height: '20%',
          }}
          onClick={nextSong}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(100,100,100,0.4)" strokeWidth="2.5" className="pointer-events-none select-none">
            <path d="M5 4l10 8-10 8V4zM17 5h2v14h-2V5z" />
          </svg>
        </div>
      </div>

      {/* Song number indicator (e.g. 1/4) */}
      <div className="mt-1 font-body text-[12px]" style={{ color: 'rgba(255,255,255,0.6)' }}>
        {currentIndex + 1} / {songs.length}
      </div>
    </motion.div>
  );
}

/* ═══════════════════ 主组件 ═══════════════════ */

export default function ClassRoom2Page() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>('travel');
  const [travelProgress, setTravelProgress] = useState(0);

  // Dialog sub-states
  const [showTypewriter, setShowTypewriter] = useState(false);
  const [showCard0, setShowCard0] = useState(false);
  const [showCard1, setShowCard1] = useState(false);
  const [showCard2, setShowCard2] = useState(false);
  const [bgDark, setBgDark] = useState(false);

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
        setPhase('classroom');
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [phase]);

  // ── Room click → dialog ──
  const handleRoomClick = useCallback(() => {
    if (phase === 'classroom') {
      setPhase('dialog');
      setTimeout(() => setShowTypewriter(true), 500);
    }
  }, [phase]);

  // ── Typewriter done → fade out → cards ──
  const handleTypewriterDone = useCallback(() => {
    setTimeout(() => {
      setShowTypewriter(false);
      setPhase('dialog-cards');
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
      setShowCard2(false);
      setBgDark(true);
      setTimeout(() => setPhase('ipod'), 1500);
    }, 500);
  }, []);

  // Auto-trigger card done callbacks with delays
  useEffect(() => {
    if (showCard0) {
      const t = setTimeout(handleCard0Done, 4500);
      return () => clearTimeout(t);
    }
  }, [showCard0, handleCard0Done]);

  useEffect(() => {
    if (showCard1) {
      const t = setTimeout(handleCard1Done, 3500);
      return () => clearTimeout(t);
    }
  }, [showCard1, handleCard1Done]);

  useEffect(() => {
    if (showCard2) {
      const t = setTimeout(handleCard2Done, 3500);
      return () => clearTimeout(t);
    }
  }, [showCard2, handleCard2Done]);

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

      {/* ===== PHASE: CLASSROOM + DIALOG + IPOD ===== */}
      <AnimatePresence>
        {phase !== 'travel' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0"
            onClick={handleRoomClick}
          >
            {/* Classroom Background */}
            <div className="absolute inset-0">
              <img
                src={asset("/classroom-day.webp")}
                alt="教室"
                className="w-full h-full object-cover"
                style={{
                  filter: bgDark ? 'brightness(0.5) blur(2px)' : 'brightness(1)',
                  transition: 'filter 2s ease',
                }}
                draggable={false}
              />
            </div>

            {/* Curtain sway animation */}
            <div
              className="absolute pointer-events-none"
              style={{
                top: '5%',
                left: '5%',
                width: '45%',
                height: '40%',
                background: 'linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 50%, transparent 100%)',
                transformOrigin: 'top left',
                animation: 'curtain-sway 6s ease-in-out infinite',
              }}
            />

            {/* Falling leaves */}
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="absolute pointer-events-none"
                style={{
                  width: 8 + i * 3,
                  height: 8 + i * 3,
                  borderRadius: '50% 0 50% 0',
                  background: `rgba(${100 + i * 30}, ${150 + i * 20}, 80, 0.5)`,
                  top: `${-10 - i * 15}%`,
                  left: `${20 + i * 15}%`,
                  animation: `leaf-fall ${5 + i * 2}s linear infinite`,
                  animationDelay: `${i * 1.5}s`,
                }}
              />
            ))}

            {/* White overlay for dialog phases */}
            <AnimatePresence>
              {(phase === 'dialog' || phase === 'dialog-cards') && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 z-20"
                  style={{ background: 'rgba(255, 255, 255, 0.6)' }}
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
                      text="15岁的小陈蕊，你好呀～"
                      speed={85}
                      onComplete={handleTypewriterDone}
                    />
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* ═══ DIALOG: Cards ═══ */}
            {phase === 'dialog-cards' && (
              <div className="absolute inset-0 z-30 flex flex-col items-center justify-center px-6 gap-6">
                <FadeParagraph lines={DIALOG_CARDS[0]} visible={showCard0} delay={0} />
                <FadeParagraph lines={DIALOG_CARDS[1]} visible={showCard1} delay={0} />
                <FadeParagraph lines={DIALOG_CARDS[2]} visible={showCard2} delay={0} />
              </div>
            )}

            {/* ═══ IPOD PHASE ═══ */}
            <AnimatePresence>
              {phase === 'ipod' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1 }}
                  className="absolute inset-0 z-30 flex flex-col items-center justify-center px-6"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* iPod Player */}
                  <IpodPlayer songs={SONGS} />

                  {/* Back button */}
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.5, duration: 0.8 }}
                    className="mt-6 px-6 py-3 rounded-full font-body text-[15px] font-bold text-white"
                    style={{
                      background: 'linear-gradient(135deg, #E091A3 0%, #D48496 100%)',
                      boxShadow: '0 4px 12px rgba(224, 145, 163, 0.35)',
                    }}
                    onClick={() => navigate('/', { state: { buildingOpen: true } })}
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
        @keyframes curtain-sway {
          0%, 100% { transform: skewX(-2deg) translateX(0); }
          50% { transform: skewX(2deg) translateX(5px); }
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
