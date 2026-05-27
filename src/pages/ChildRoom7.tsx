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

/* ═══════════════════ 两个女生 SVG ═══════════════════ */

function GirlsSilhouette({ screenX }: { screenX: number }) {
  return (
    <svg
      viewBox="0 0 260 380"
      style={{
        width: '55%',
        maxWidth: 280,
        position: 'absolute',
        bottom: 0,
        left: `${screenX}px`,
        transform: 'translateX(-50%)',
        zIndex: 30,
        pointerEvents: 'none',
      }}
    >
      <defs>
        <linearGradient id="pinkHairGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E8A0B8" />
          <stop offset="50%" stopColor="#D888A0" />
          <stop offset="100%" stopColor="#C87890" />
        </linearGradient>
        <linearGradient id="shortHairGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4A3828" />
          <stop offset="100%" stopColor="#3A2818" />
        </linearGradient>
        <linearGradient id="vestGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8BAF7A" />
          <stop offset="100%" stopColor="#7A9E6A" />
        </linearGradient>
        <linearGradient id="backpackGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7A9E6A" />
          <stop offset="100%" stopColor="#6A8E5A" />
        </linearGradient>
        <linearGradient id="brownHairGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7A5838" />
          <stop offset="50%" stopColor="#6A4828" />
          <stop offset="100%" stopColor="#5A3A1E" />
        </linearGradient>
        <linearGradient id="blackVestGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3A3A3A" />
          <stop offset="100%" stopColor="#2A2A2A" />
        </linearGradient>
      </defs>

      {/* ────────────────────────────────
          女生 1: 粉色齐肩波浪发女生（左侧，较矮）
          白色衬衫 + 绿色户外背心 + 双肩包
          ──────────────────────────────── */}
      <g transform="translate(20, 22)">
        {/* 后脑勺 */}
        <ellipse cx="50" cy="30" rx="20" ry="22" fill="#E8C8A8" />

        {/* 头发 - 粉色齐肩波浪发（以头部中心 x=50 对齐） */}
        <path
          d="M32 24 C28 28 24 40 22 52 C21 60 22 68 26 74 L30 78 C28 70 26 58 28 48 C30 38 38 28 50 24 C62 28 70 38 72 48 C74 58 72 70 70 78 L74 74 C78 68 79 60 78 52 C76 40 72 28 68 24Z"
          fill="url(#pinkHairGrad)"
        />
        {/* 头发顶部 */}
        <path d="M32 34 C30 18 38 8 50 6 C62 8 70 18 68 34 C66 22 34 22 32 34Z" fill="#D888A0" />
        {/* 中分线 */}
        <path d="M40 12 C44 8 52 8 56 12" stroke="#C87890" strokeWidth="0.8" fill="none" opacity="0.4" />
        {/* 发丝纹 */}
        <path d="M36 28 C34 42 35 58 38 72" stroke="#C87890" strokeWidth="0.6" fill="none" opacity="0.4" />
        <path d="M44 24 C43 40 43 58 42 74" stroke="#C87890" strokeWidth="0.5" fill="none" opacity="0.3" />
        <path d="M52 24 C53 40 53 58 54 74" stroke="#C87890" strokeWidth="0.5" fill="none" opacity="0.3" />
        <path d="M60 28 C62 42 61 58 58 72" stroke="#C87890" strokeWidth="0.6" fill="none" opacity="0.4" />
        {/* 波浪发尾 */}
        <path d="M24 70 C22 74 20 78 22 82 C24 86 28 84 30 80" stroke="#D888A0" strokeWidth="2" fill="none" opacity="0.5" />
        <path d="M76 70 C78 74 80 78 78 82 C76 86 72 84 70 80" stroke="#D888A0" strokeWidth="2" fill="none" opacity="0.5" />
        {/* 耳朵露出 */}
        <ellipse cx="30" cy="36" rx="4" ry="6" fill="#E8C8A8" />
        <ellipse cx="70" cy="36" rx="4" ry="6" fill="#E8C8A8" />

        {/* 脖子 */}
        <path d="M42 50 L42 58 C42 61 58 61 58 58 L58 50Z" fill="#E8C8A8" />

        {/* 白色长袖衬衫 */}
        <path
          d="M26 58 C20 62 14 70 12 80 L10 155 C10 160 14 163 20 163 L80 163 C86 163 90 160 90 155 L88 80 C86 70 80 62 74 58 C69 56 55 54 50 54 C45 54 31 56 26 58Z"
          fill="#F0EDE8"
        />

        {/* 衬衫褶皱 */}
        <path d="M35 75 C36 100 35 130 34 155" stroke="#DDD8D0" strokeWidth="0.8" fill="none" opacity="0.5" />
        <path d="M65 75 C64 100 65 130 66 155" stroke="#DDD8D0" strokeWidth="0.8" fill="none" opacity="0.5" />

        {/* 绿色户外背心 */}
        <path
          d="M30 60 C24 64 20 72 18 82 L16 152 C16 156 18 158 24 158 L76 158 C82 158 84 156 84 152 L82 82 C80 72 76 64 70 60 C66 58 55 57 50 57 C45 57 34 58 30 60Z"
          fill="url(#vestGrad)"
        />
        {/* 背心肩带 */}
        <path d="M30 60 L34 58 L38 60 L36 68 L32 66Z" fill="#7A9E6A" />
        <path d="M70 60 L66 58 L62 60 L64 68 L68 66Z" fill="#7A9E6A" />
        {/* 背心侧边调节带 */}
        <rect x="20" y="100" width="3" height="20" rx="1" fill="#6A8E5A" opacity="0.5" />
        <rect x="79" y="100" width="3" height="20" rx="1" fill="#6A8E5A" opacity="0.5" />
        {/* 背心口袋 */}
        <rect x="36" y="90" width="28" height="18" rx="2" fill="#6A8E5A" opacity="0.3" />

        {/* 双肩包 */}
        <rect x="34" y="65" width="32" height="55" rx="5" fill="url(#backpackGrad)" />
        <rect x="36" y="67" width="28" height="25" rx="3" fill="#6A8E5A" opacity="0.3" />
        {/* 包带 */}
        <path d="M34 70 C30 65 28 62 30 58" stroke="#5A7E4A" strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d="M66 70 C70 65 72 62 70 58" stroke="#5A7E4A" strokeWidth="3" strokeLinecap="round" fill="none" />
        {/* 包底反光条 */}
        <rect x="36" y="112" width="28" height="3" rx="1" fill="#E8D848" opacity="0.5" />
        {/* 侧面水瓶 */}
        <ellipse cx="30" cy="100" rx="5" ry="10" fill="#88B8D8" opacity="0.5" />

        {/* 左手臂 */}
        <path d="M12 80 C6 95 4 115 8 138" stroke="#F0EDE8" strokeWidth="15" strokeLinecap="round" fill="none" />
        <path d="M8 120 C6 128 6 135 8 142" stroke="#E8C8A8" strokeWidth="10" strokeLinecap="round" fill="none" />
        <ellipse cx="8" cy="144" rx="6" ry="7" fill="#E8C8A8" />

        {/* 右手臂 */}
        <path d="M88 80 C94 95 96 115 92 138" stroke="#F0EDE8" strokeWidth="15" strokeLinecap="round" fill="none" />
        <path d="M92 120 C94 128 94 135 92 142" stroke="#E8C8A8" strokeWidth="10" strokeLinecap="round" fill="none" />
        <ellipse cx="92" cy="144" rx="6" ry="7" fill="#E8C8A8" />

        {/* 裤子 */}
        <path d="M18 158 C16 185 12 220 8 260 L42 260 C40 220 38 185 36 158Z" fill="#3A3A42" />
        <path d="M64 158 C66 185 68 220 72 260 L92 260 C90 220 88 185 84 158Z" fill="#3A3A42" />
        <path d="M28 165 C26 200 22 240 18 258" stroke="#2E2E38" strokeWidth="0.6" fill="none" opacity="0.3" />
        <path d="M74 165 C76 200 80 240 82 258" stroke="#2E2E38" strokeWidth="0.6" fill="none" opacity="0.3" />

        {/* 鞋子 */}
        <path d="M4 256 C2 256 -1 262 2 268 C5 274 38 274 40 268 C42 262 40 256 38 256Z" fill="#686870" />
        <path d="M4 256 L38 256" stroke="#585860" strokeWidth="1" />
        <path d="M6 262 L36 262" stroke="#787880" strokeWidth="0.6" opacity="0.4" />
        <path d="M68 256 C66 256 63 262 66 268 C69 274 96 274 98 268 C100 262 98 256 96 256Z" fill="#686870" />
        <path d="M68 256 L96 256" stroke="#585860" strokeWidth="1" />
        <path d="M70 262 L94 262" stroke="#787880" strokeWidth="0.6" opacity="0.4" />
      </g>

      {/* ────────────────────────────────
          女生 2: 短发女生（右侧，较高）
          橄榄绿T恤 + 黑色马甲
          ──────────────────────────────── */}
      <g transform="translate(130, 5)">
        {/* 后脑勺 */}
        <ellipse cx="42" cy="32" rx="18" ry="20" fill="#F0D0B0" />

        {/* 头发 - 棕色单马尾（从背后看） */}
        {/* 头顶及两侧收紧的头发 */}
        <path
          d="M26 28 C22 24 20 16 22 10 C24 4 32 2 42 2 C52 2 60 4 62 10 C64 16 62 24 58 28 C56 34 52 38 48 40 L36 40 C32 38 28 34 26 28Z"
          fill="url(#brownHairGrad)"
        />
        {/* 左侧鬓角 */}
        <path d="M26 28 C24 34 24 40 26 44 C28 46 30 44 30 42 L28 36 C27 32 26 30 26 28Z" fill="#6A4828" />
        {/* 右侧鬓角 */}
        <path d="M58 28 C60 34 60 40 58 44 C56 46 54 44 54 42 L56 36 C57 32 58 30 58 28Z" fill="#6A4828" />
        {/* 马尾 - 从后脑勺中部垂下 */}
        <path
          d="M34 24 C30 28 28 36 28 48 C28 62 30 78 32 95 C33 105 34 115 32 125 C31 130 28 132 26 130 C24 128 24 125 26 122 C28 118 30 110 30 98 C30 82 30 64 32 48 C33 38 36 30 40 26Z"
          fill="url(#brownHairGrad)"
        />
        <path
          d="M50 24 C54 28 56 36 56 48 C56 62 54 78 52 95 C51 105 50 115 52 125 C53 130 56 132 58 130 C60 128 60 125 58 122 C56 118 54 110 54 98 C54 82 54 64 52 48 C51 38 48 30 44 26Z"
          fill="url(#brownHairGrad)"
        />
        {/* 马尾中心填充 */}
        <path d="M36 26 C38 28 40 30 42 30 C44 30 46 28 48 26 C48 40 48 60 46 80 C45 95 44 110 42 125 C40 110 39 95 38 80 C36 60 36 40 36 26Z" fill="#6A4828" />
        {/* 马尾发丝纹 */}
        <path d="M36 40 C36 60 38 80 40 100 C40 110 40 120 38 128" stroke="#5A3A1E" strokeWidth="0.6" fill="none" opacity="0.4" />
        <path d="M48 40 C48 60 46 80 44 100 C44 110 44 120 46 128" stroke="#5A3A1E" strokeWidth="0.6" fill="none" opacity="0.4" />
        <path d="M42 30 C42 50 42 70 42 90 C42 110 42 120 42 130" stroke="#5A3A1E" strokeWidth="0.5" fill="none" opacity="0.3" />
        {/* 马尾末端 - 微微收拢 */}
        <path d="M28 125 C26 128 24 132 26 136 C28 138 32 136 34 132" stroke="#6A4828" strokeWidth="2" fill="none" opacity="0.5" />
        <path d="M56 125 C58 128 60 132 58 136 C56 138 52 136 50 132" stroke="#6A4828" strokeWidth="2" fill="none" opacity="0.5" />
        {/* 发圈 */}
        <ellipse cx="42" cy="26" rx="10" ry="4" fill="#8B5E3C" />
        <ellipse cx="42" cy="26" rx="10" ry="4" fill="none" stroke="#6A4828" strokeWidth="1" />
        {/* 发丝纹理 */}
        <path d="M30 14 C34 10 38 8 42 8 C46 8 50 10 54 14" stroke="#5A3A1E" strokeWidth="0.5" fill="none" opacity="0.3" />
        {/* 耳朵露出 */}
        <ellipse cx="24" cy="38" rx="4" ry="6" fill="#F0D0B0" />
        <ellipse cx="60" cy="38" rx="4" ry="6" fill="#F0D0B0" />

        {/* 脖子 */}
        <path d="M36 50 L36 58 C36 61 48 61 48 58 L48 50Z" fill="#F0D0B0" />

        {/* 橄榄绿T恤 */}
        <path
          d="M24 58 C18 62 12 70 10 80 L8 148 C8 153 12 156 18 156 L66 156 C72 156 76 153 76 148 L74 80 C72 70 66 62 60 58 C55 56 47 54 42 54 C37 54 29 56 24 58Z"
          fill="#7A8860"
        />
        {/* T恤领口 */}
        <path d="M34 58 L42 68 L50 58" stroke="#6A7850" strokeWidth="1.2" fill="none" />
        {/* 领口内肤色 */}
        <path d="M34 58 L42 65 L50 58 L48 54 L36 54Z" fill="#F0D0B0" />
        {/* T恤褶皱 */}
        <path d="M30 80 C30 105 28 130 26 148" stroke="#6A7850" strokeWidth="0.6" fill="none" opacity="0.4" />
        <path d="M54 80 C54 105 56 130 58 148" stroke="#6A7850" strokeWidth="0.6" fill="none" opacity="0.4" />

        {/* 黑色马甲（背面视角） */}
        <path
          d="M28 62 C22 66 18 74 16 84 L14 146 C14 150 16 152 22 152 L62 152 C68 152 70 150 70 146 L68 84 C66 74 62 66 56 62 C52 60 47 59 42 59 C37 59 32 60 28 62Z"
          fill="url(#blackVestGrad)"
        />
        {/* 马甲背面圆领 */}
        <path d="M28 62 C32 58 36 56 42 56 C48 56 52 58 56 62" stroke="#4A4A4A" strokeWidth="0.8" fill="none" />
        {/* 背面中缝 */}
        <line x1="42" y1="58" x2="42" y2="148" stroke="#333" strokeWidth="0.6" opacity="0.3" />
        {/* 背面横向接缝线 */}
        <line x1="18" y1="95" x2="66" y2="95" stroke="#333" strokeWidth="0.5" opacity="0.25" />
        <line x1="16" y1="130" x2="68" y2="130" stroke="#333" strokeWidth="0.5" opacity="0.25" />
        {/* 背面底部调节扣 */}
        <rect x="30" y="135" width="24" height="8" rx="2" fill="#444" opacity="0.5" />
        {/* 肩部接缝 */}
        <path d="M28 62 L16 72" stroke="#333" strokeWidth="0.5" opacity="0.2" />
        <path d="M56 62 L68 72" stroke="#333" strokeWidth="0.5" opacity="0.2" />

        {/* 左手臂 */}
        <path d="M10 78 C5 92 3 110 6 128" stroke="#7A8860" strokeWidth="14" strokeLinecap="round" fill="none" />
        <ellipse cx="6" cy="130" rx="5.5" ry="6" fill="#F0D0B0" />

        {/* 右手臂 */}
        <path d="M74 78 C79 92 81 110 78 128" stroke="#7A8860" strokeWidth="14" strokeLinecap="round" fill="none" />
        <ellipse cx="78" cy="130" rx="5.5" ry="6" fill="#F0D0B0" />

        {/* 裤子 */}
        <path d="M12 153 C10 180 6 215 4 255 L38 255 C36 215 34 180 32 153Z" fill="#3A3A42" />
        <path d="M52 153 C54 180 56 215 58 255 L78 255 C76 215 74 180 72 153Z" fill="#3A3A42" />

        {/* 鞋子 */}
        <path d="M0 251 C-2 251 -5 257 -2 263 C1 269 34 269 36 263 C38 257 36 251 34 251Z" fill="#5A5A60" />
        <path d="M0 251 L34 251" stroke="#4A4A50" strokeWidth="1" />
        <path d="M46 251 C44 251 41 257 44 263 C47 269 80 269 82 263 C84 257 82 251 80 251Z" fill="#5A5A60" />
        <path d="M46 251 L80 251" stroke="#4A4A50" strokeWidth="1" />
      </g>
    </svg>
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
            <GirlsSilhouette screenX={girlScreenPx} />

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
                src={`/photos/day7/photo-${selectedPhoto}.jpg`}
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
