import { preloadDayAssets, preloadNextDay } from '@/lib/preload';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router';

/* ═══════════════════════════════════════════
   ChildRoom 8 Page - 档案柜
   流程：档案柜 → 点击标签翻开 → 结尾
   ═══════════════════════════════════════════ */

type Phase = 'drawer' | 'ending';

/* ── 8 条事件 ── */
const FOLDERS = [
  { label: '事件一', lines: ['说到电子产品和AI的时候，', '你的眼睛会突然亮起来。'] },
  { label: '事件二', lines: ['很喜欢分享。', '遇到觉得好的东西，', '总会想推荐给别人。'] },
  { label: '事件三', lines: ['行动力很强。', '当别人还停留在"想一想"的阶段，', '你已经开始做了。'] },
  { label: '事件四', lines: ['出去玩的时候，', '会认真帮大家拍很多照片。', '而且真的很会拍。'] },
  { label: '事件五', lines: ['对很多东西都很好奇。', '一旦感兴趣，', '就会认真去研究和探索。'] },
  { label: '事件六', lines: ['很会注意到别人的情绪。', '朋友来找你的时候，', '你好像总能接住她们。'] },
  { label: '事件七', lines: ['明明自己已经很累了，', '还是会尽量照顾别人。'] },
  { label: '事件八', lines: ['喜欢小猫，很会抱猫。'] },
];

/* ── 标签颜色（低饱和暖色）── */
const TAB_COLORS = [
  '#E8C8A0', '#D4A890', '#C8A0A8', '#A8C4A0',
  '#90B0C0', '#B0A0C0', '#C0B890', '#A0B8B0',
];

/* ── 标签位置：左/中/右交替 ── */
const TAB_ALIGNS: React.CSSProperties['justifyContent'][] = [
  'flex-start', 'center', 'flex-end',
  'flex-start', 'center', 'flex-end',
  'flex-start', 'center',
];

/* ── 结尾文字 ── */
const ENDING_LINES = [
  ['这些都是', '我偷偷记下的', '关于你的心动瞬间。'],
  ['每一个', '都会好好珍藏～'],
];

const LINE_GAP = 2.0;

/* ═══════════════════ 主组件 ═══════════════════ */

export default function ChildRoom8() {
  const navigate = useNavigate();
  useEffect(() => { preloadDayAssets(8); preloadNextDay(9); }, []);
  const [phase, setPhase] = useState<Phase>('drawer');
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [read, setRead] = useState<Set<number>>(new Set());

  const handleClick = useCallback((i: number) => {
    setActiveIdx(prev => prev === i ? null : i);
    setRead(prev => new Set(prev).add(i));
  }, []);

  /* ── 全部读完 → 点击外部跳转 ── */
  const allRead = read.size >= FOLDERS.length;

  const handleBgTap = useCallback(() => {
    if (allRead && phase === 'drawer') {
      setPhase('ending');
    }
  }, [allRead, phase]);

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ background: '#0F0F14' }}>
      <AnimatePresence mode="wait">
        {phase === 'drawer' && (
          <motion.div
            key="drawer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 flex flex-col items-center justify-center px-5 py-6"
            onClick={handleBgTap}
          >
            <Cabinet
              activeIdx={activeIdx}
              read={read}
              onTabClick={handleClick}
              readCount={read.size}
            />
          </motion.div>
        )}

        {phase === 'ending' && (
          <EndingView key="ending" onBack={() => navigate('/', { state: { buildingOpen: true } })} />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════ 档案柜 ═══════════════════ */

function Cabinet({ activeIdx, read, onTabClick, readCount }: {
  activeIdx: number | null;
  read: Set<number>;
  onTabClick: (i: number) => void;
  readCount: number;
}) {
  return (
    <>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: '100%', maxWidth: 400,
        maxHeight: '88vh',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* 柜顶 */}
        <div style={{
          height: 8,
          background: 'linear-gradient(180deg, #6A5240, #4A3628)',
          borderRadius: '10px 10px 0 0',
          boxShadow: '0 -2px 6px rgba(0,0,0,0.3)',
        }} />

        {/* 柜体 */}
        <div style={{
          flex: 1,
          background: 'linear-gradient(180deg, #3D2B1F 0%, #342418 100%)',
          padding: '14px 16px',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
        }}>
          {/* 抽屉内部 */}
          <div style={{
            background: 'linear-gradient(180deg, #C8A878 0%, #B89868 100%)',
            borderRadius: 6,
            padding: '12px 10px 8px',
            boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.15)',
          }}>
            {FOLDERS.map((folder, i) => (
              <FolderSlot
                key={i}
                folder={folder}
                color={TAB_COLORS[i]}
                tabAlign={TAB_ALIGNS[i]}
                isOpen={activeIdx === i}
                isRead={read.has(i)}
                onClick={() => onTabClick(i)}
              />
            ))}
          </div>
        </div>

        {/* 柜底 */}
        <div style={{
          height: 6,
          background: '#2A1E14',
          borderRadius: '0 0 4px 4px',
          boxShadow: '0 6px 24px rgba(0,0,0,0.5)',
        }} />
      </div>

      {/* 进度 */}
      <p style={{
        marginTop: 18,
        fontFamily: 'Quicksand, sans-serif',
        fontSize: 12,
        color: 'rgba(255,255,255,0.3)',
      }}>
        {readCount} / {FOLDERS.length} 已阅读
      </p>
    </>
  );
}

/* ═══════════════════ 文件夹 ═══════════════════ */

function FolderSlot({ folder, color, tabAlign, isOpen, isRead, onClick }: {
  folder: typeof FOLDERS[number];
  color: string;
  tabAlign: React.CSSProperties['justifyContent'];
  isOpen: boolean;
  isRead: boolean;
  onClick: () => void;
}) {
  return (
    <div style={{ marginBottom: 3, position: 'relative' }}>
      {/* 标签 */}
      <div style={{ display: 'flex', justifyContent: tabAlign }}>
        <motion.div
          onClick={onClick}
          whileTap={{ scale: 0.97 }}
          animate={{ y: isOpen ? -8 : 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          style={{
            cursor: 'pointer',
            padding: '5px 20px',
            borderRadius: '6px 6px 0 0',
            background: isOpen ? color : isRead ? `${color}BB` : color,
            boxShadow: isOpen
              ? '0 4px 12px rgba(0,0,0,0.2)'
              : '0 1px 3px rgba(0,0,0,0.12)',
            position: 'relative',
            zIndex: isOpen ? 5 : 1,
            transition: 'background 0.3s',
          }}
        >
          <span style={{
            fontFamily: 'Quicksand, sans-serif',
            fontSize: 13,
            fontWeight: 700,
            color: isOpen ? '#2D1F14' : '#4A3628',
            letterSpacing: 0.5,
          }}>
            {folder.label}
          </span>
        </motion.div>
      </div>

      {/* 内页 */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              background: '#FBF5EA',
              borderRadius: '0 4px 4px 4px',
              padding: '16px 20px',
              borderLeft: `3px solid ${color}`,
              minHeight: 64,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            }}>
              {folder.lines.map((line, li) => (
                <p
                  key={li}
                  style={{
                    fontFamily: 'Quicksand, sans-serif',
                    fontSize: 15,
                    lineHeight: 1.9,
                    color: '#3D2B1F',
                    margin: 0,
                  }}
                >
                  {line}
                </p>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════ 结尾 ═══════════════════ */

function EndingView({ onBack }: { onBack: () => void }) {
  const [ei, setEi] = useState(0);
  const [showLine, setShowLine] = useState(false);
  const [showBtn, setShowBtn] = useState(false);

  useEffect(() => {
    const ts: ReturnType<typeof setTimeout>[] = [];
    const next = (idx: number) => {
      if (idx >= ENDING_LINES.length) { setShowBtn(true); return; }
      setEi(idx);
      setShowLine(true);
      const lines = ENDING_LINES[idx];
      const isLast = idx === ENDING_LINES.length - 1;
      const dur = (lines.length * LINE_GAP + (idx === 0 ? 0.5 : 1)) * 1000;
      if (isLast) {
        ts.push(setTimeout(() => next(idx + 1), dur));
      } else {
        ts.push(setTimeout(() => {
          setShowLine(false);
          ts.push(setTimeout(() => next(idx + 1), 1600));
        }, dur));
      }
    };
    ts.push(setTimeout(() => next(0), 800));
    return () => ts.forEach(clearTimeout);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="absolute inset-0 z-50 flex items-center justify-center px-6"
    >
      <div className="relative" style={{ width: '100%', maxWidth: 400, height: 220 }}>
        <div className="absolute inset-x-0 top-0 flex items-start justify-center">
          {ei < ENDING_LINES.length && (
            <AnimatePresence>
              {showLine && (
                <motion.div
                  key={`e-${ei}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                  className="flex flex-col items-center text-center"
                >
                  {ENDING_LINES[ei].map((line, i) => (
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
          )}
        </div>

        <div className="absolute inset-x-0 bottom-0 flex items-center justify-center" style={{ height: 60 }}>
          <AnimatePresence>
            {showBtn && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
                className="px-8 py-3.5 rounded-full font-body text-[16px] font-bold text-white"
                style={{
                  background: 'linear-gradient(135deg, #D4A574 0%, #B8885C 100%)',
                  boxShadow: '0 4px 16px rgba(180, 130, 80, 0.4)',
                }}
                onClick={onBack}
              >
                回到日历
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
