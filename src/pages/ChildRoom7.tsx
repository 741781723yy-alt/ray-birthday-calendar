import { asset } from "@/lib/assets";
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router';
import GalleryScene, { WALL_W } from '../components/GalleryScene';

/* ═══════════════════════════════════════════
   ChildRoom 7 Page - Gallery（回到现在）
   流程：闪光 → 画廊 → 照片详情 → 结尾
   ═══════════════════════════════════════════ */

type Phase = 'flash' | 'gallery' | 'photo-detail' | 'ending';

/* ── 结尾文字 ── */
const ENDING_LINES = [
  ['每次出去玩，', '我的镜头都会忍不住对准你。'],
  ['所以以后', '也继续让我记录你吧～'],
];

const LINE_GAP = 2.0;

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

export default function ChildRoom7() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>('flash');

  // Photo detail
  const [selectedPhoto, setSelectedPhoto] = useState(0);

  // Ending
  const [endingIndex, setEndingIndex] = useState(0);
  const [showEndingLine, setShowEndingLine] = useState(false);
  const [showButton, setShowButton] = useState(false);

  /* ── Screen dimensions ── */
  const screenW = window.innerWidth;
  const screenH = window.innerHeight;

  /* ── Camera system ── */
  // viewBoxW: visible SVG width matching screen aspect
  const viewBoxW = 800 * (screenW / screenH);
  // Wall width from GalleryScene (37 columns)
  const wallW = WALL_W;
  // Max camera offset
  const maxCamera = wallW - viewBoxW;
  // Scale: pixels per SVG unit
  const scale = screenH / 800;
  // SVG units per pixel (for touch → SVG conversion)
  const svgPerPx = viewBoxW / screenW;

  // Girl starts at center of visible area
  const [girlWorldX, setGirlWorldX] = useState(viewBoxW / 2);

  // Camera follows girl, clamped to wall bounds
  const cameraOffset = Math.max(0, Math.min(maxCamera, girlWorldX - viewBoxW / 2));

  // Girl's screen position in pixels
  const girlScreenPx = (girlWorldX - cameraOffset) * scale;

  // Touch handling
  const touchRef = useRef({ startX: 0, startGirlX: 0, active: false });

  /* ── Flash → Gallery ── */
  useEffect(() => {
    if (phase !== 'flash') return;
    const timer = setTimeout(() => setPhase('gallery'), 1500);
    return () => clearTimeout(timer);
  }, [phase]);

  /* ── Touch handlers ── */
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (phase !== 'gallery') return;
    touchRef.current = {
      startX: e.touches[0].clientX,
      startGirlX: girlWorldX,
      active: true,
    };
  }, [phase, girlWorldX]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchRef.current.active || phase !== 'gallery') return;
    const pixelDx = e.touches[0].clientX - touchRef.current.startX;
    if (Math.abs(pixelDx) < 8) return;
    const svgDx = pixelDx * svgPerPx;
    let newX = touchRef.current.startGirlX + svgDx;
    newX = Math.max(0, newX);
    setGirlWorldX(newX);

    // Check ending: girl center past right edge of screen
    const co = Math.max(0, Math.min(maxCamera, newX - viewBoxW / 2));
    const gsx = (newX - co) * scale;
    if (gsx >= screenW) {
      touchRef.current.active = false;
      setPhase('ending');
    }
  }, [phase, svgPerPx, maxCamera, viewBoxW, scale, screenW]);

  const handleTouchEnd = useCallback(() => {
    touchRef.current.active = false;
  }, []);

  /* ── Photo click ── */
  const handlePhotoClick = useCallback((id: number) => {
    setSelectedPhoto(id);
    setPhase('photo-detail');
  }, []);

  /* ── Ending auto-play ── */
  useEffect(() => {
    if (phase !== 'ending') return;
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    const showNext = (index: number) => {
      if (index >= ENDING_LINES.length) { setShowButton(true); return; }
      setEndingIndex(index);
      setShowEndingLine(true);
      const lines = ENDING_LINES[index];
      const isLast = index === ENDING_LINES.length - 1;
      const dur = (lines.length * LINE_GAP + (index === 0 ? 0.5 : 1)) * 1000;
      if (isLast) {
        timeouts.push(setTimeout(() => showNext(index + 1), dur));
      } else {
        timeouts.push(setTimeout(() => {
          setShowEndingLine(false);
          timeouts.push(setTimeout(() => showNext(index + 1), 1600));
        }, dur));
      }
    };
    timeouts.push(setTimeout(() => showNext(0), 800));
    return () => timeouts.forEach(clearTimeout);
  }, [phase]);

  /* ═══════════════════ RENDER ═══════════════════ */

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ background: '#1a2a40' }}>
      {/* ===== FLASH ===== */}
      <AnimatePresence>
        {phase === 'flash' && (
          <motion.div
            className="absolute inset-0 z-50"
            style={{ background: '#fff' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.5, 0] }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>

      {/* ===== GALLERY ===== */}
      <AnimatePresence>
        {phase === 'gallery' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Unified wall with camera offset */}
            <GalleryScene
              onPhotoClick={handlePhotoClick}
              viewBoxW={viewBoxW}
              cameraOffset={cameraOffset}
            />

            {/* Girls overlay */}
            <img
              src={asset("/girls-illustration.webp")}
              alt="girls"
              draggable={false}
              style={{
                position: 'absolute',
                bottom: 0,
                left: `${girlScreenPx}px`,
                transform: 'translateX(-50%)',
                zIndex: 30,
                pointerEvents: 'none',
                height: '55%',
                maxHeight: 320,
              }}
            />

            {/* Drag hint */}
            {cameraOffset < 5 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.5, duration: 1 }}
                style={{
                  position: 'absolute', bottom: '2%', left: 0, right: 0,
                  textAlign: 'center', zIndex: 40,
                  color: 'rgba(80,100,130,0.5)', fontSize: '13px',
                  fontFamily: 'Quicksand, sans-serif',
                  pointerEvents: 'none',
                }}
              >
                ← 拖动人物探索 →
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== PHOTO DETAIL ===== */}
      <AnimatePresence>
        {phase === 'photo-detail' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 z-40 flex flex-col items-center justify-center px-6"
            style={{
              background: 'rgba(20, 35, 60, 0.85)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
              style={{
                width: '100%', maxWidth: 360,
                borderRadius: 12, overflow: 'hidden',
                background: '#fff',
                boxShadow: '0 12px 40px rgba(0,0,0,0.3)',
              }}
            >
              <img
                src={`/photos/day7/photo-${selectedPhoto}.webp`}
                alt={`Photo ${selectedPhoto}`}
                style={{
                  width: '100%', aspectRatio: '4/5',
                  objectFit: 'cover', background: '#E8E4E0',
                }}
                draggable={false}
              />
            </motion.div>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mt-8 px-6 py-3 rounded-full font-body text-[15px] font-bold text-white"
              style={{
                background: 'linear-gradient(135deg, #7BA7D9 0%, #5B8EC4 100%)',
                boxShadow: '0 4px 12px rgba(123, 167, 217, 0.4)',
              }}
              onClick={() => setPhase('gallery')}
            >
              返回画廊
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== ENDING ===== */}
      <AnimatePresence>
        {phase === 'ending' && (
          <div className="absolute inset-0 z-50 flex items-center justify-center px-6">
            <div className="relative" style={{ width: '100%', maxWidth: 400, height: 220 }}>
              <div className="absolute inset-x-0 top-0 flex items-start justify-center">
                {endingIndex < ENDING_LINES.length && (
                  <EndingText
                    key={`ending-${endingIndex}`}
                    lines={ENDING_LINES[endingIndex]}
                    visible={showEndingLine}
                  />
                )}
              </div>
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-center" style={{ height: 60 }}>
                <AnimatePresence>
                  {showButton && (
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
                      className="px-8 py-3.5 rounded-full font-body text-[16px] font-bold text-white"
                      style={{
                        background: 'linear-gradient(135deg, #7BA7D9 0%, #5B8EC4 100%)',
                        boxShadow: '0 4px 16px rgba(123, 167, 217, 0.4)',
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
    </div>
  );
}
