import { asset } from '@/lib/assets';

interface GallerySceneProps {
  onPhotoClick: (id: number) => void;
  viewBoxW: number;
  cameraOffset: number;
}

type FrameStyle = 'grooved' | 'lined' | 'clean' | 'dotted' | 'textured';

interface Slot {
  id: number;
  x: number;
  y: number;
  w: number;
  h: number;
  style: FrameStyle;
  photoId?: number; // override photo file, defaults to id
}

/* Grid: A–AJ (36 columns) × 31 rows, same CW as before */
const CW = 400 / 17;
const RH = 800 / 31;
const Y_OFF = 1.5 * RH;
const GROW = 4;

/* Unified coordinate system – all frames in absolute positions */
const ALL_SLOTS: Slot[] = [
  // ── Left wall (columns A–Q, indices 0–16) ──
  { id: 1,  x: 1 * CW,  y: 1 * RH + Y_OFF,  w: 2 * CW, h: 3 * RH,  style: 'grooved' },
  { id: 2,  x: 4 * CW,  y: 2 * RH + Y_OFF,  w: 6 * CW, h: 3 * RH,  style: 'lined' },
  { id: 3,  x: 11 * CW, y: 1 * RH + Y_OFF,  w: 5 * CW, h: 3 * RH,  style: 'clean' },
  { id: 4,  x: 1 * CW,  y: 6 * RH + Y_OFF,  w: 5 * CW, h: 4 * RH,  style: 'dotted' },
  { id: 5,  x: 7 * CW,  y: 6 * RH + Y_OFF,  w: 3 * CW, h: 4 * RH,  style: 'textured' },
  { id: 6,  x: 11 * CW, y: 6 * RH + Y_OFF,  w: 3 * CW, h: 5 * RH,  style: 'grooved' },
  { id: 7,  x: 14.5 * CW, y: 6 * RH + Y_OFF,  w: 3 * CW, h: 5 * RH,  style: 'clean' },
  { id: 9,  x: 1 * CW,  y: 11 * RH + Y_OFF, w: 2 * CW, h: 3 * RH,  style: 'textured' },
  { id: 10, x: 1 * CW,  y: 15 * RH + Y_OFF, w: 2 * CW, h: 3 * RH,  style: 'dotted' },
  { id: 11, x: 4 * CW,  y: 11 * RH + Y_OFF, w: 5 * CW, h: 8 * RH,  style: 'grooved' },
  { id: 12, x: 10 * CW, y: 12 * RH + Y_OFF, w: 2 * CW, h: 3 * RH,  style: 'lined' },
  { id: 13, x: 10 * CW, y: 16 * RH + Y_OFF, w: 2 * CW, h: 3 * RH,  style: 'clean' },
  { id: 14, x: 13 * CW, y: 12 * RH + Y_OFF, w: 3 * CW, h: 5 * RH,  style: 'dotted' },
  { id: 15, x: 1 * CW,  y: 20 * RH + Y_OFF, w: 4 * CW, h: 3 * RH,  style: 'textured' },
  { id: 17, x: 6 * CW,  y: 20 * RH + Y_OFF, w: 3 * CW, h: 3 * RH,  style: 'lined' },
  { id: 18, x: 10 * CW, y: 20 * RH + Y_OFF, w: 2 * CW, h: 2 * RH,  style: 'clean' },
  { id: 20, x: 13 * CW, y: 18 * RH + Y_OFF, w: 4 * CW, h: 4 * RH,  style: 'textured' },
  // ── Right wall (columns R–AJ, indices 17–35) ──
  { id: 16, x: 17 * CW, y: 1 * RH + Y_OFF,  w: 3 * CW, h: 3 * RH,  style: 'grooved' },
  { id: 19, x: 21 * CW, y: 1 * RH + Y_OFF,  w: 3 * CW, h: 2 * RH,  style: 'lined' },
  { id: 21, x: 17 * CW, y: 15 * RH + Y_OFF, w: 2 * CW, h: 2 * RH,  style: 'clean' },
  { id: 22, x: 18.5 * CW, y: 4.5 * RH + Y_OFF,  w: 4.5 * CW, h: 6.5 * RH,  style: 'dotted', photoId: 8 },
  { id: 23, x: 21 * CW, y: 12 * RH + Y_OFF, w: 4 * CW, h: 5 * RH,  style: 'textured' },
  { id: 24, x: 17 * CW, y: 12 * RH + Y_OFF, w: 2 * CW, h: 2 * RH,  style: 'grooved' },
  { id: 25, x: 18 * CW, y: 18 * RH + Y_OFF, w: 4 * CW, h: 5 * RH,  style: 'lined' },
  { id: 26, x: 25 * CW, y: 1 * RH + Y_OFF,  w: 3 * CW, h: 5 * RH,  style: 'clean' },
  { id: 27, x: 29 * CW, y: 1 * RH + Y_OFF,  w: 7 * CW, h: 5 * RH,  style: 'dotted' },
  { id: 28, x: 24 * CW, y: 7 * RH + Y_OFF,  w: 7 * CW, h: 4 * RH,  style: 'textured' },
  { id: 29, x: 32 * CW, y: 7 * RH + Y_OFF,  w: 3 * CW, h: 3 * RH,  style: 'grooved' },
  { id: 30, x: 26 * CW, y: 12 * RH + Y_OFF, w: 5 * CW, h: 7 * RH,  style: 'lined' },
  { id: 31, x: 32 * CW, y: 11 * RH + Y_OFF, w: 3 * CW, h: 3 * RH,  style: 'clean' },
  { id: 32, x: 32 * CW, y: 15 * RH + Y_OFF, w: 3 * CW, h: 4 * RH,  style: 'dotted' },
  { id: 33, x: 24 * CW, y: 20 * RH + Y_OFF, w: 4 * CW, h: 3 * RH,  style: 'textured' },
  { id: 34, x: 29 * CW, y: 20 * RH + Y_OFF, w: 3 * CW, h: 3 * RH,  style: 'grooved' },
  { id: 35, x: 33 * CW, y: 20 * RH + Y_OFF, w: 3 * CW, h: 3 * RH,  style: 'lined' },
];

/* ═══════════════════ Frame border width per style ═══════════════════ */

function getBW(style: FrameStyle) {
  switch (style) {
    case 'grooved': return 5;
    case 'lined': return 4;
    case 'clean': return 4;
    case 'dotted': return 5;
    case 'textured': return 5;
  }
}

/* ═══════════════════ Frame renderers (colorful: gold / pink / green / blue / yellow) ═══════════════════ */

interface FP {
  x: number;
  y: number;
  w: number;
  h: number;
  uid: string;
  children: React.ReactNode;
}

/* ── 金色雕花款：多层金色渐变 + 凹槽线 + 四角圆饰 ── */
function FrameGrooved({ x, y, w, h, uid, children }: FP) {
  const bw = 5;
  return (
    <g>
      <rect x={x + 3} y={y + 4} width={w} height={h} rx="1" fill="rgba(0,0,0,0.18)" />
      <rect x={x} y={y} width={w} height={h} rx="1" fill="#E8E4DE" />
      <rect x={x + 1} y={y + 1} width={w - 2} height={h - 2} rx="0.5" fill="#F0ECE6" />
      <rect x={x + 2} y={y + 2} width={w - 4} height={h - 4} rx="0.5" fill="#F5F2ED" />
      <rect x={x + 3} y={y + 3} width={w - 6} height={h - 6} rx="0.5" fill="#FAFAF8" />
      <rect x={x + 3.5} y={y + 3.5} width={w - 7} height={h - 7} rx="0.5" fill="none" stroke="#D8D4CE" strokeWidth="0.8" />
      <clipPath id={`clip-${uid}`}>
        <rect x={x + bw} y={y + bw} width={w - bw * 2} height={h - bw * 2} />
      </clipPath>
      <g clipPath={`url(#clip-${uid})`}>{children}</g>
      <rect x={x} y={y} width={w} height={2} fill="rgba(255,255,255,0.5)" />
      <rect x={x} y={y} width={2} height={h} fill="rgba(255,255,255,0.2)" />
      <rect x={x} y={y + h - 2} width={w} height={2} fill="rgba(0,0,0,0.06)" />
      <rect x={x + w - 2} y={y} width={2} height={h} fill="rgba(0,0,0,0.04)" />
      <circle cx={x + 4} cy={y + 4} r={2.5} fill="#E0DCD6" opacity="0.7" />
      <circle cx={x + w - 4} cy={y + 4} r={2.5} fill="#E0DCD6" opacity="0.7" />
      <circle cx={x + 4} cy={y + h - 4} r={2.5} fill="#E0DCD6" opacity="0.5" />
      <circle cx={x + w - 4} cy={y + h - 4} r={2.5} fill="#E0DCD6" opacity="0.5" />
    </g>
  );
}

/* ── 白色竖纹款：白底 + 浅灰竖向细纹 ── */
function FrameLined({ x, y, w, h, uid, children }: FP) {
  const bw = 4;
  return (
    <g>
      <rect x={x + 3} y={y + 4} width={w} height={h} rx="1" fill="rgba(0,0,0,0.18)" />
      <rect x={x} y={y} width={w} height={h} rx="1" fill="#EAE6E0" />
      <rect x={x + 1} y={y + 1} width={w - 2} height={h - 2} rx="0.5" fill="#F2EEE8" />
      <rect x={x + 2} y={y + 2} width={w - 4} height={h - 4} rx="0.5" fill="#FAFAF8" />
      {[0.5, 1.8].map((off, i) => (
        <line key={`v${i}`} x1={x + off} y1={y + 2} x2={x + off} y2={y + h - 2} stroke="rgba(200,195,188,0.4)" strokeWidth="0.5" />
      ))}
      <clipPath id={`clip-${uid}`}>
        <rect x={x + bw} y={y + bw} width={w - bw * 2} height={h - bw * 2} />
      </clipPath>
      <g clipPath={`url(#clip-${uid})`}>{children}</g>
      <rect x={x} y={y} width={w} height={1.5} fill="rgba(255,255,255,0.4)" />
      <rect x={x} y={y + h - 1.5} width={w} height={1.5} fill="rgba(0,0,0,0.06)" />
    </g>
  );
}

/* ── 白色简约款：纯净白 + 亮色细线 + 圆角 ── */
function FrameClean({ x, y, w, h, uid, children }: FP) {
  const bw = 4;
  return (
    <g>
      <rect x={x + 3} y={y + 4} width={w} height={h} rx="2" fill="rgba(0,0,0,0.12)" />
      <rect x={x} y={y} width={w} height={h} rx="2" fill="#EDEAE4" />
      <rect x={x + 1} y={y + 1} width={w - 2} height={h - 2} rx="1.5" fill="#F5F2ED" />
      <rect x={x + 2} y={y + 2} width={w - 4} height={h - 4} rx="1" fill="#FEFEFE" />
      <rect x={x + bw - 1} y={y + bw - 1} width={w - bw * 2 + 2} height={h - bw * 2 + 2} rx="0.5" fill="none" stroke="#DDD8D2" strokeWidth="0.8" />
      <clipPath id={`clip-${uid}`}>
        <rect x={x + bw} y={y + bw} width={w - bw * 2} height={h - bw * 2} />
      </clipPath>
      <g clipPath={`url(#clip-${uid})`}>{children}</g>
      <rect x={x} y={y} width={w} height={1} fill="rgba(255,255,255,0.4)" />
      <rect x={x} y={y} width={1} height={h} fill="rgba(255,255,255,0.15)" />
    </g>
  );
}

/* ── 白色圆点款：白底 + 浅灰边缘圆点 + 角饰 ── */
function FrameDotted({ x, y, w, h, uid, children }: FP) {
  const bw = 5;
  const dotCountH = Math.min(6, Math.max(1, Math.floor(w / 14)));
  const dotCountV = Math.min(6, Math.max(1, Math.floor(h / 14)));
  return (
    <g>
      <rect x={x + 3} y={y + 5} width={w} height={h} rx="1" fill="rgba(0,0,0,0.18)" />
      <rect x={x} y={y} width={w} height={h} rx="1" fill="#E8E4DE" />
      <rect x={x + 1} y={y + 1} width={w - 2} height={h - 2} rx="0.5" fill="#F0ECE6" />
      <rect x={x + 2} y={y + 2} width={w - 4} height={h - 4} rx="0.5" fill="#F5F2ED" />
      <rect x={x + 3} y={y + 3} width={w - 6} height={h - 6} rx="0.5" fill="#FAFAF8" />
      {Array.from({ length: dotCountH }).map((_, i) => {
        const cx = dotCountH === 1 ? x + w / 2 : x + 7 + i * ((w - 14) / (dotCountH - 1));
        return (
          <g key={`t${i}`}>
            <circle cx={cx} cy={y + 4} r={1.2} fill="#D8D4CE" opacity="0.6" />
            <circle cx={cx} cy={y + h - 4} r={1.2} fill="#D8D4CE" opacity="0.6" />
          </g>
        );
      })}
      {Array.from({ length: dotCountV }).map((_, i) => {
        const cy = dotCountV === 1 ? y + h / 2 : y + 7 + i * ((h - 14) / (dotCountV - 1));
        return (
          <g key={`l${i}`}>
            <circle cx={x + 4} cy={cy} r={1.2} fill="#D8D4CE" opacity="0.6" />
            <circle cx={x + w - 4} cy={cy} r={1.2} fill="#D8D4CE" opacity="0.6" />
          </g>
        );
      })}
      <rect x={x + 3.5} y={y + 3.5} width={w - 7} height={h - 7} rx="0.5" fill="none" stroke="#D0CCC6" strokeWidth="1" />
      <clipPath id={`clip-${uid}`}>
        <rect x={x + bw} y={y + bw} width={w - bw * 2} height={h - bw * 2} />
      </clipPath>
      <g clipPath={`url(#clip-${uid})`}>{children}</g>
      {[[x + 3.5, y + 3.5], [x + w - 3.5, y + 3.5], [x + 3.5, y + h - 3.5], [x + w - 3.5, y + h - 3.5]].map(([cx, cy], i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r={2} fill="#E0DCD6" />
          <circle cx={cx} cy={cy} r={1.2} fill="#F0ECE6" />
        </g>
      ))}
      <rect x={x} y={y} width={w} height={2} fill="rgba(255,255,255,0.4)" />
      <rect x={x} y={y + h - 2} width={w} height={2} fill="rgba(0,0,0,0.05)" />
    </g>
  );
}

/* ── 白色纹理款：白底 + 浅灰做旧纹理 ── */
function FrameTextured({ x, y, w, h, uid, children }: FP) {
  const bw = 5;
  return (
    <g>
      <rect x={x + 3} y={y + 5} width={w} height={h} rx="1" fill="rgba(0,0,0,0.15)" />
      <rect x={x} y={y} width={w} height={h} rx="1" fill="#E8E4DE" />
      <rect x={x + 1} y={y + 1} width={w - 2} height={h - 2} rx="0.5" fill="#F0ECE6" />
      <rect x={x + 2} y={y + 2} width={w - 4} height={h - 4} rx="0.5" fill="#F5F2ED" />
      <rect x={x + 3} y={y + 3} width={w - 6} height={h - 6} rx="0.5" fill="#FAFAF8" />
      {Array.from({ length: 5 }).map((_, i) => {
        const mx = x + 4 + ((i * 7 + 3) % Math.max(1, Math.round(w - 8)));
        const my = y + 4 + ((i * 11 + 5) % Math.max(1, Math.round(h - 8)));
        return (
          <rect key={i} x={mx} y={my} width={2 + (i % 3)} height={0.5} fill="rgba(200,195,188,0.3)" transform={`rotate(${(i * 30) % 45} ${mx} ${my})`} />
        );
      })}
      {[0.3, 0.6].map((ratio, i) => (
        <line key={i} x1={x + 3} y1={y + h * ratio} x2={x + w - 3} y2={y + h * ratio} stroke="rgba(190,185,178,0.2)" strokeWidth="0.6" />
      ))}
      <clipPath id={`clip-${uid}`}>
        <rect x={x + bw} y={y + bw} width={w - bw * 2} height={h - bw * 2} />
      </clipPath>
      <g clipPath={`url(#clip-${uid})`}>{children}</g>
      <rect x={x} y={y} width={w} height={1.5} fill="rgba(255,255,255,0.4)" />
      <rect x={x} y={y + h - 1.5} width={w} height={1.5} fill="rgba(0,0,0,0.05)" />
    </g>
  );
}

/* ═══════════════════ Frame dispatcher ═══════════════════ */

function renderFrame(slot: Slot, content: React.ReactNode) {
  const props: FP = { x: slot.x, y: slot.y, w: slot.w, h: slot.h, uid: `f${slot.id}`, children: content };
  switch (slot.style) {
    case 'grooved': return <FrameGrooved {...props} />;
    case 'lined': return <FrameLined {...props} />;
    case 'clean': return <FrameClean {...props} />;
    case 'dotted': return <FrameDotted {...props} />;
    case 'textured': return <FrameTextured {...props} />;
  }
}

/* ═══════════════════ Main component ═══════════════════ */

const WALL_W = 37 * CW; // 36 columns content + 1 column right margin

export { WALL_W };

export default function GalleryScene({ onPhotoClick, viewBoxW, cameraOffset }: GallerySceneProps) {
  const wallW = WALL_W;

  return (
    <svg
      viewBox={`0 0 ${viewBoxW} 800`}
      preserveAspectRatio="xMinYMin slice"
      style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
    >
      <defs>
        <linearGradient id="wallGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3A3E48" />
          <stop offset="50%" stopColor="#404450" />
          <stop offset="100%" stopColor="#353840" />
        </linearGradient>
        <pattern id="tilePat" width="26" height="26" patternUnits="userSpaceOnUse">
          <rect width="26" height="26" fill="#B8B8B8" />
          <rect x="0.6" y="0.6" width="24.8" height="24.8" fill="#E8E8E8" rx="0.3" />
        </pattern>
      </defs>

      <g transform={`translate(${-cameraOffset}, 0)`}>
        {/* Wall */}
        <rect x="0" y="0" width={wallW} height="662" fill="url(#wallGrad)" />
        {/* Baseboard */}
        <rect x="0" y="660" width={wallW} height="7" fill="#2A2D34" />
        <rect x="0" y="660" width={wallW} height="2" fill="#4A4D54" />
        {/* Floor shadow */}
        <rect x="0" y="666" width={wallW} height="12" fill="rgba(0,0,0,0.15)" />
        {/* Floor */}
        <rect x="0" y="666" width={wallW} height="134" fill="url(#tilePat)" />
        {/* Ceiling molding */}
        <rect x="0" y="0" width={wallW} height="8" fill="#2A2D34" />
        <rect x="0" y="8" width={wallW} height="3" fill="#22252A" />
        <rect x="0" y="11" width={wallW} height="2" fill="#4A4D54" />

        {/* Spotlights */}
        {Array.from({ length: Math.ceil(wallW / 80) }).map((_, i) => (
          <ellipse key={`spot-${i}`} cx={40 + i * 80} cy="2" rx="30" ry="180" fill={`rgba(255,245,230,${0.08 + (i % 2) * 0.04})`} />
        ))}

        {/* All photo frames */}
        {ALL_SLOTS.map((slot) => {
          const s = { ...slot, x: slot.x - GROW, y: slot.y - GROW, w: slot.w + GROW * 2, h: slot.h + GROW * 2 };
          const bw = getBW(s.style);
          const cx = s.x + bw;
          const cy = s.y + bw;
          const cw = s.w - bw * 2;
          const ch = s.h - bw * 2;

          return (
            <g key={s.id} onClick={() => onPhotoClick(s.photoId ?? s.id)} style={{ cursor: 'pointer' }}>
              {renderFrame(s, (
                <>
                  <image
                    href={asset(`/photos/day7/thumb/photo-${s.photoId ?? s.id}.webp`)}
                    x={cx}
                    y={cy}
                    width={cw}
                    height={ch}
                    preserveAspectRatio="xMidYMid slice"
                  />
                </>
              ))}
            </g>
          );
        })}

        {/* Spotlights over select frames */}
        {ALL_SLOTS.filter((_, i) => i % 3 === 0).map((slot) => (
          <ellipse
            key={`light-${slot.id}`}
            cx={slot.x - GROW + (slot.w + GROW * 2) / 2}
            cy={slot.y - GROW - 2}
            rx={slot.w * 0.5}
            ry={slot.h * 0.9}
            fill="rgba(255,245,220,0.08)"
          />
        ))}
      </g>
    </svg>
  );
}
