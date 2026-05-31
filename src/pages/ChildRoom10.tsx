import { preloadDayAssets, preloadNextDay } from '@/lib/preload';
import { useState, useEffect, useCallback, useMemo, Component } from 'react';
import type { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router';
import { subscribeWishes, addWish, updateWish, deleteWish, type Wish } from '../lib/wishes';

/* ── Error Boundary ── */
interface EBState { hasError: boolean; error?: Error }
class ErrorBoundary extends Component<{ children: ReactNode }, EBState> {
  state: EBState = { hasError: false };
  static getDerivedStateFromError(error: Error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, color: '#fff', background: '#080c1a', minHeight: '100vh' }}>
          <p>加载出错了</p>
          <p style={{ fontSize: 12, opacity: 0.5 }}>{this.state.error?.message}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

/* ═══════════════════════════════════════════
   ChildRoom 10 - 星空许愿
   星空背景 + 愿望星星 + 写愿望 + Firebase 同步
   ═══════════════════════════════════════════ */

const LS_NAME = 'wish-author-name';
const LS_ID = 'wish-author-id';
const OWNER_ID = '__owner__';

/* ── 我（作者）的愿望，硬编码 ── */
const MY_WISHES: Wish[] = [
  { id: 'my-1', text: '还想一起去徒步，这次肯定不会摔跤了！', authorName: '杨玥', authorId: OWNER_ID, starX: 18, starY: 22, createdAt: 0 },
  { id: 'my-2', text: '天气好的时候，一起出门散步。下雨天，就呆在家里，窝在沙发上。', authorName: '杨玥', authorId: OWNER_ID, starX: 72, starY: 18, createdAt: 0 },
  { id: 'my-3', text: '海岛、草原、雨林、沙漠、冰川…想和你去环游世界，我们一起看更多风景，体验不一样的生活～', authorName: '杨玥', authorId: OWNER_ID, starX: 45, starY: 14, createdAt: 0 },
  { id: 'my-4', text: '想带你去体验一次芭蕾课。舞蹈的魅力，希望你也可以感受到。', authorName: '杨玥', authorId: OWNER_ID, starX: 30, starY: 40, createdAt: 0 },
  { id: 'my-5', text: '希望你每天都可以睡到自然醒，醒来以后看到第一个人就是我～', authorName: '杨玥', authorId: OWNER_ID, starX: 80, starY: 38, createdAt: 0 },
  { id: 'my-6', text: '一起去看一场烟花，一定会很浪漫。', authorName: '杨玥', authorId: OWNER_ID, starX: 55, starY: 35, createdAt: 0 },
  { id: 'my-7', text: '等你70岁的时候，我们还要抱着睡觉～', authorName: '杨玥', authorId: OWNER_ID, starX: 22, starY: 55, createdAt: 0 },
  { id: 'my-8', text: '想陪你过很多很多生日，多到数都数不过来了。不知道那时候，我还能给你准备什么惊喜呐哈哈哈', authorName: '杨玥', authorId: OWNER_ID, starX: 68, starY: 52, createdAt: 0 },
  { id: 'my-9', text: '想和你共用衣橱，买很多好看的衣服～每天都把你打扮成我喜欢的样子出门哈哈哈哈', authorName: '杨玥', authorId: OWNER_ID, starX: 50, starY: 48, createdAt: 0 },
  { id: 'my-10', text: '等我们老了以后，还要听你叫我小港都～我要做你一辈子的小港都咯～', authorName: '杨玥', authorId: OWNER_ID, starX: 38, starY: 60, createdAt: 0 },
];

/* ── 生成背景小星星 ── */
const STAR_COLORS = ['#fff', '#fff', '#fff', '#cce5ff', '#ffeedd', '#ffd6d6'];
function generateBgStars(count: number) {
  const stars: { x: number; y: number; size: number; delay: number; dur: number; color: string }[] = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1 + Math.random() * 2,
      delay: Math.random() * 5,
      dur: 2 + Math.random() * 3,
      color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
    });
  }
  return stars;
}

function generateBrightStars(count: number) {
  const stars: { x: number; y: number; size: number; delay: number; dur: number; color: string }[] = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random() * 100,
      y: Math.random() * 80,
      size: 2.5 + Math.random() * 2,
      delay: Math.random() * 4,
      dur: 3 + Math.random() * 4,
      color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
    });
  }
  return stars;
}

const BG_STARS = generateBgStars(120);
const BRIGHT_STARS = generateBrightStars(15);

/* ── 为新愿望生成不重叠的星星位置 ── */
function randomStarPos(existing: Wish[]): { x: number; y: number } {
  for (let attempt = 0; attempt < 30; attempt++) {
    const x = 10 + Math.random() * 80;
    const y = 12 + Math.random() * 55;
    const tooClose = existing.some(
      (w) => Math.hypot(w.starX - x, w.starY - y) < 10,
    );
    if (!tooClose) return { x, y };
  }
  return { x: 10 + Math.random() * 80, y: 12 + Math.random() * 55 };
}

/* ── 获取/创建本地身份 ── */
function makeId(): string {
  return 'xxxx-xxxx-xxxx'.replace(/x/g, () =>
    ((Math.random() * 16) | 0).toString(16),
  );
}
function getLocalId(): string {
  let id = localStorage.getItem(LS_ID);
  if (!id) {
    id = makeId();
    localStorage.setItem(LS_ID, id);
  }
  return id;
}

/* ═══════════════════ 主组件 ═══════════════════ */

export default function ChildRoom10() {
  return (
  useEffect(() => { preloadDayAssets(10); preloadNextDay(11); }, []);
    <ErrorBoundary>
      <StarryWishPage />
    </ErrorBoundary>
  );
}

function StarryWishPage() {
  const navigate = useNavigate();
  const [dbWishes, setDbWishes] = useState<Wish[]>([]);
  const [userName, setUserName] = useState(() => localStorage.getItem(LS_NAME) || '');
  const [showNameDialog, setShowNameDialog] = useState(() => !localStorage.getItem(LS_NAME));
  const [showIntro, setShowIntro] = useState(true);
  const [activeBubble, setActiveBubble] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [flyingWish, setFlyingWish] = useState<{ x: number; y: number; text: string } | null>(null);
  const localId = useMemo(() => getLocalId(), []);

  /* ── 合并：硬编码愿望 + Firestore 实时数据 ── */
  const wishes = useMemo(() => [...MY_WISHES, ...dbWishes], [dbWishes]);

  /* ── Firestore 实时监听（只监听别人许的愿望） ── */
  useEffect(() => {
    let unsub: (() => void) | undefined;
    try {
      unsub = subscribeWishes(setDbWishes);
    } catch (e) {
      console.error('Firestore 订阅失败:', e);
    }
    return () => unsub?.();
  }, []);

  /* ── 保存名字 ── */
  const handleSaveName = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    localStorage.setItem(LS_NAME, trimmed);
    setUserName(trimmed);
    setShowNameDialog(false);
  }, []);

  /* ── 提交愿望 ── */
  const handleSubmit = useCallback(async () => {
    const text = inputText.trim();
    if (!text || !userName) return;
    const pos = randomStarPos(wishes);
    setInputText('');
    setFlyingWish({ x: pos.x, y: pos.y, text });
    // 延迟写入，等动画播放
    setTimeout(async () => {
      try {
        await addWish(text, userName, localId, pos.x, pos.y);
      } catch (e) {
        console.error('写入愿望失败:', e);
      }
      setFlyingWish(null);
    }, 1700);
  }, [inputText, userName, localId, wishes]);

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ background: '#080c1a' }} onClick={() => setActiveBubble(null)}>
      {/* ── 星空背景 ── */}
      <StarryBackground />

      {/* ── 愿望星星 ── */}
      {wishes.map((wish) => (
        <WishStar
          key={wish.id}
          wish={wish}
          isOpen={activeBubble === wish.id}
          isFixed={wish.authorId === OWNER_ID}
          isOwn={wish.authorId === localId}
          onToggle={() =>
            setActiveBubble((prev) => (prev === wish.id ? null : wish.id))
          }
          onClose={() => setActiveBubble(null)}
        />
      ))}

      {/* ── 飞星动画 ── */}
      {flyingWish && <FlyingStar target={flyingWish} />}

      {/* ── 底部输入区 ── */}
      {!showNameDialog && (
        <WishInput
          value={inputText}
          onChange={setInputText}
          onSubmit={handleSubmit}
        />
      )}

      {/* ── 返回按钮 ── */}
      <button
        onClick={() => navigate('/ending')}
        style={{
          position: 'absolute',
          top: 12,
          right: 16,
          zIndex: 50,
          background: 'rgba(255,255,255,0.12)',
          border: 'none',
          borderRadius: 20,
          padding: '6px 14px',
          color: 'rgba(255,255,255,0.6)',
          fontSize: 13,
          fontFamily: 'Quicksand, sans-serif',
          cursor: 'pointer',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
        }}
      >
        继续
      </button>

      {/* ── 入场卡片 ── */}
      <AnimatePresence>
        {showIntro && !showNameDialog && (
          <IntroCard onClose={() => setShowIntro(false)} />
        )}
      </AnimatePresence>

      {/* ── 名字弹窗 ── */}
      <AnimatePresence>
        {showNameDialog && <NameDialog onSave={handleSaveName} />}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════ 星空背景 ═══════════════════ */

function StarryBackground() {
  return (
    <div className="absolute inset-0" style={{ overflow: 'hidden' }}>
      {/* 渐变天空 */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(180deg, #050816 0%, #0a1128 20%, #0f1a3a 40%, #162050 60%, #0d1530 80%, #080c1a 100%)',
        }}
      />
      {/* 银河带 */}
      <div
        style={{
          position: 'absolute',
          width: '130%',
          height: '30%',
          top: '5%',
          left: '-15%',
          background:
            'linear-gradient(90deg, transparent 0%, rgba(100,120,200,0.03) 20%, rgba(140,130,200,0.06) 40%, rgba(160,140,180,0.04) 60%, rgba(100,120,200,0.03) 80%, transparent 100%)',
          transform: 'rotate(-15deg)',
          filter: 'blur(30px)',
        }}
      />
      {/* 星云 */}
      <div
        style={{
          position: 'absolute',
          width: '50%',
          height: '35%',
          top: '8%',
          left: '10%',
          background:
            'radial-gradient(ellipse, rgba(80,100,200,0.1) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: '45%',
          height: '30%',
          top: '25%',
          right: '5%',
          background:
            'radial-gradient(ellipse, rgba(140,80,180,0.08) 0%, transparent 70%)',
          filter: 'blur(50px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: '35%',
          height: '25%',
          top: '15%',
          left: '40%',
          background:
            'radial-gradient(ellipse, rgba(60,120,180,0.06) 0%, transparent 70%)',
          filter: 'blur(35px)',
        }}
      />
      {/* 小星星 */}
      {BG_STARS.map((s, i) => (
        <div
          key={`s${i}`}
          style={{
            position: 'absolute',
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            borderRadius: '50%',
            background: s.color,
            opacity: 0.5,
            boxShadow: `0 0 ${s.size * 2}px ${s.color}40`,
            animation: `twinkle ${s.dur}s ease-in-out ${s.delay}s infinite alternate`,
          }}
        />
      ))}
      {/* 亮星（十字光芒） */}
      {BRIGHT_STARS.map((s, i) => (
        <div
          key={`b${i}`}
          style={{
            position: 'absolute',
            left: `${s.x}%`,
            top: `${s.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div
            style={{
              width: s.size,
              height: s.size,
              borderRadius: '50%',
              background: s.color,
              boxShadow: `0 0 ${s.size * 4}px ${s.color}, 0 0 ${s.size * 8}px ${s.color}50`,
              animation: `twinkle ${s.dur}s ease-in-out ${s.delay}s infinite alternate`,
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: s.size * 6,
              height: 1,
              background: `linear-gradient(90deg, transparent, ${s.color}80, transparent)`,
              animation: `twinkle ${s.dur}s ease-in-out ${s.delay}s infinite alternate`,
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 1,
              height: s.size * 6,
              background: `linear-gradient(180deg, transparent, ${s.color}80, transparent)`,
              animation: `twinkle ${s.dur}s ease-in-out ${s.delay}s infinite alternate`,
            }}
          />
        </div>
      ))}
      {/* 流星 */}
      <ShootingStars />
      <style>{`
        @keyframes twinkle {
          0% { opacity: 0.15; transform: scale(0.7); }
          100% { opacity: 1; transform: scale(1.15); }
        }
        @keyframes shooting {
          0% { opacity: 1; transform: rotate(-35deg) translateX(0); }
          70% { opacity: 1; }
          100% { opacity: 0; transform: rotate(-35deg) translateX(-300px); }
        }
      `}</style>
    </div>
  );
}

/* ── 流星组件 ── */
function ShootingStars() {
  const [meteors, setMeteors] = useState<{ id: number; x: number; y: number; dur: number; len: number; delay: number }[]>([]);

  useEffect(() => {
    let nextId = 0;
    const spawn = () => {
      const id = nextId++;
      const m = {
        id,
        x: 10 + Math.random() * 70,
        y: Math.random() * 40,
        dur: 0.8 + Math.random() * 0.6,
        len: 60 + Math.random() * 80,
        delay: 0,
      };
      setMeteors((prev) => [...prev, m]);
      setTimeout(() => {
        setMeteors((prev) => prev.filter((x) => x.id !== id));
      }, (m.dur + 0.1) * 1000);
    };
    // 第一颗延迟2秒出现
    const first = setTimeout(spawn, 2000);
    // 之后每3-8秒随机一颗
    const interval = setInterval(() => {
      spawn();
    }, 3000 + Math.random() * 5000);
    return () => { clearTimeout(first); clearInterval(interval); };
  }, []);

  return (
    <>
      {meteors.map((m) => (
        <div
          key={m.id}
          style={{
            position: 'absolute',
            left: `${m.x}%`,
            top: `${m.y}%`,
            width: m.len,
            height: 1.5,
            borderRadius: 1,
            background: 'linear-gradient(270deg, transparent, rgba(200,220,255,0.4), rgba(255,255,255,0.9))',
            boxShadow: '0 0 6px rgba(200,220,255,0.5)',
            animation: `shooting ${m.dur}s linear forwards`,
          }}
        />
      ))}
    </>
  );
}

/* ═══════════════════ 愿望星星 ═══════════════════ */

function WishStar({
  wish,
  isOpen,
  isFixed,
  isOwn,
  onToggle,
  onClose,
}: {
  wish: Wish;
  isOpen: boolean;
  isFixed: boolean;
  isOwn: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(wish.text);

  const [saveError, setSaveError] = useState(false);

  const handleSave = () => {
    const trimmed = editText.trim();
    if (!trimmed) return;
    setSaveError(false);
    setEditing(false);
    updateWish(wish.id, trimmed).catch((e) => {
      console.error('修改愿望失败:', e);
    });
  };

  const handleDelete = async () => {
    try {
      await deleteWish(wish.id);
      onClose();
    } catch (e) {
      console.error('删除愿望失败:', e);
    }
  };

  return (
    <>
      {/* 星星本体 */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        onClick={(e) => { e.stopPropagation(); onToggle(); }}
        style={{
          position: 'absolute',
          left: `${wish.starX}%`,
          top: `${wish.starY}%`,
          transform: 'translate(-50%, -50%)',
          zIndex: 20,
          cursor: 'pointer',
        }}
      >
        <div
          style={{
            width: isOpen ? 16 : 10,
            height: isOpen ? 16 : 10,
            borderRadius: '50%',
            background: 'radial-gradient(circle, #fff 0%, #E9D88C 40%, transparent 70%)',
            boxShadow: isOpen
              ? '0 0 20px 6px rgba(233,216,140,0.6), 0 0 40px 10px rgba(233,216,140,0.2)'
              : '0 0 12px 4px rgba(233,216,140,0.4), 0 0 24px 6px rgba(233,216,140,0.15)',
            animation: `star-pulse ${2.5 + (wish.starX % 3)}s ease-in-out infinite alternate`,
            transition: 'all 0.3s ease',
          }}
        />
      </motion.div>

      {/* 愿望气泡 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 4 }}
            transition={{ type: 'spring', damping: 22, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'absolute',
              left: wish.starX > 60 ? undefined : `${wish.starX}%`,
              right: wish.starX > 60 ? `${100 - wish.starX}%` : undefined,
              top: wish.starY > 45 ? undefined : `${wish.starY + 6}%`,
              bottom: wish.starY > 45 ? `${100 - wish.starY + 4}%` : undefined,
              transform: wish.starX > 60 ? undefined : 'translateX(-50%)',
              zIndex: 30,
              maxWidth: 240,
              minWidth: 140,
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              borderRadius: 16,
              padding: '14px 18px',
              border: '1px solid rgba(255,255,255,0.15)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            }}
          >
            {editing ? (
              <>
                <input
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  maxLength={100}
                  autoFocus
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(233,216,140,0.4)',
                    borderRadius: 8,
                    padding: '8px 10px',
                    color: '#fff',
                    fontSize: 14,
                    fontFamily: 'Quicksand, sans-serif',
                    outline: 'none',
                  }}
                />
                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  <button
                    onClick={handleSave}
                    disabled={!editText.trim()}
                    style={{
                      flex: 1,
                      padding: '6px 0',
                      borderRadius: 10,
                      border: 'none',
                      background: editText.trim()
                        ? 'linear-gradient(135deg, #E9D88C, #C8B060)'
                        : 'rgba(255,255,255,0.1)',
                      color: editText.trim() ? '#1a1a2e' : 'rgba(255,255,255,0.3)',
                      fontSize: 13,
                      fontWeight: 700,
                      fontFamily: 'Quicksand, sans-serif',
                      cursor: editText.trim() ? 'pointer' : 'default',
                    }}
                  >
                    保存
                  </button>
                  <button
                    onClick={() => { setEditing(false); setEditText(wish.text); }}
                    style={{
                      flex: 1,
                      padding: '6px 0',
                      borderRadius: 10,
                      border: '1px solid rgba(255,255,255,0.15)',
                      background: 'transparent',
                      color: 'rgba(255,255,255,0.5)',
                      fontSize: 13,
                      fontFamily: 'Quicksand, sans-serif',
                      cursor: 'pointer',
                    }}
                  >
                    取消
                  </button>
                </div>
                {saveError && (
                  <p style={{ color: 'rgba(255,120,120,0.9)', fontSize: 12, marginTop: 8, textAlign: 'center', fontFamily: 'Quicksand, sans-serif' }}>
                    保存失败，请重试
                  </p>
                )}
              </>
            ) : (
              <>
                <p
                  style={{
                    fontFamily: 'Quicksand, sans-serif',
                    fontSize: 15,
                    lineHeight: 1.7,
                    color: '#fff',
                    margin: 0,
                  }}
                >
                  {wish.text}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                  <p
                    style={{
                      fontFamily: 'Quicksand, sans-serif',
                      fontSize: 12,
                      color: 'rgba(255,255,255,0.45)',
                      margin: 0,
                    }}
                  >
                    — {wish.authorName}
                  </p>
                  {isOwn && !isFixed && (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        onClick={handleDelete}
                        style={{
                          background: 'rgba(255,80,80,0.2)',
                          border: 'none',
                          borderRadius: 6,
                          padding: '3px 8px',
                          color: 'rgba(255,120,120,0.8)',
                          fontSize: 12,
                          cursor: 'pointer',
                        }}
                      >
                        删除
                      </button>
                      <button
                        onClick={() => setEditing(true)}
                        style={{
                          background: 'rgba(233,216,140,0.15)',
                          border: 'none',
                          borderRadius: 6,
                          padding: '3px 8px',
                          color: 'rgba(233,216,140,0.8)',
                          fontSize: 12,
                          cursor: 'pointer',
                        }}
                      >
                        编辑
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ═══════════════════ 飞星动画 ═══════════════════ */

function FlyingStar({ target }: { target: { x: number; y: number; text: string } }) {
  return (
    <motion.div
      initial={{
        left: '50%',
        bottom: '14%',
        scale: 1,
        opacity: 1,
      }}
      animate={{
        left: `${target.x}%`,
        bottom: `${100 - target.y}%`,
        scale: 0.2,
        opacity: [1, 0.9, 0],
      }}
      transition={{ duration: 1.4, ease: [0.25, 0.1, 0.25, 1] }}
      style={{
        position: 'absolute',
        zIndex: 25,
        transform: 'translate(-50%, 50%)',
      }}
    >
      <div
        style={{
          padding: '8px 16px',
          borderRadius: 20,
          background: 'rgba(233,216,140,0.25)',
          border: '1px solid rgba(233,216,140,0.4)',
          color: '#fff',
          fontSize: 13,
          fontFamily: 'Quicksand, sans-serif',
          whiteSpace: 'nowrap',
          boxShadow: '0 0 20px rgba(233,216,140,0.3)',
        }}
      >
        {target.text}
      </div>
    </motion.div>
  );
}

/* ═══════════════════ 底部输入区 ═══════════════════ */

function WishInput({
  value,
  onChange,
  onSubmit,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
}) {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 40,
        padding: '12px 16px 20px',
        background: 'linear-gradient(transparent, rgba(8,12,26,0.9) 30%)',
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: 10,
          background: 'rgba(255,255,255,0.08)',
          borderRadius: 24,
          padding: '4px 4px 4px 16px',
          border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
      >
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
          placeholder="写下你的愿望..."
          maxLength={100}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: '#fff',
            fontSize: 15,
            fontFamily: 'Quicksand, sans-serif',
          }}
        />
        <button
          onClick={onSubmit}
          disabled={!value.trim()}
          style={{
            padding: '8px 18px',
            borderRadius: 20,
            border: 'none',
            background: value.trim()
              ? 'linear-gradient(135deg, #E9D88C, #C8B060)'
              : 'rgba(255,255,255,0.1)',
            color: value.trim() ? '#1a1a2e' : 'rgba(255,255,255,0.3)',
            fontSize: 14,
            fontWeight: 700,
            fontFamily: 'Quicksand, sans-serif',
            cursor: value.trim() ? 'pointer' : 'default',
            transition: 'all 0.3s',
          }}
        >
          许愿
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════ 名字弹窗 ═══════════════════ */

function NameDialog({ onSave }: { onSave: (name: string) => void }) {
  const [name, setName] = useState('');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 flex items-center justify-center px-6"
      style={{ background: 'rgba(8,12,26,0.7)' }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        style={{
          width: '100%',
          maxWidth: 300,
          background: 'rgba(255,255,255,0.08)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderRadius: 20,
          padding: '28px 24px',
          border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
        }}
      >
        <p
          style={{
            fontFamily: 'Quicksand, sans-serif',
            fontSize: 17,
            fontWeight: 700,
            color: '#fff',
            textAlign: 'center',
            marginBottom: 20,
          }}
        >
          你的名字是？
        </p>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSave(name)}
          placeholder="输入名字"
          maxLength={20}
          autoFocus
          style={{
            width: '100%',
            padding: '10px 16px',
            borderRadius: 12,
            border: '1px solid rgba(255,255,255,0.15)',
            background: 'rgba(255,255,255,0.06)',
            color: '#fff',
            fontSize: 16,
            fontFamily: 'Quicksand, sans-serif',
            outline: 'none',
            textAlign: 'center',
            boxSizing: 'border-box',
          }}
        />
        <button
          onClick={() => onSave(name)}
          disabled={!name.trim()}
          style={{
            width: '100%',
            marginTop: 16,
            padding: '10px',
            borderRadius: 12,
            border: 'none',
            background: name.trim()
              ? 'linear-gradient(135deg, #E9D88C, #C8B060)'
              : 'rgba(255,255,255,0.08)',
            color: name.trim() ? '#1a1a2e' : 'rgba(255,255,255,0.3)',
            fontSize: 15,
            fontWeight: 700,
            fontFamily: 'Quicksand, sans-serif',
            cursor: name.trim() ? 'pointer' : 'default',
            transition: 'all 0.3s',
          }}
        >
          开始许愿
        </button>
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════ 入场卡片 ═══════════════════ */

const INTRO_LINES = ['这是我们第一次看星星，', '记得许愿哦～'];

function IntroCard({ onClose }: { onClose: () => void }) {
  const [visible, setVisible] = useState(false);
  const lastLineDelay = (INTRO_LINES.length - 1) * 1.2;

  useEffect(() => {
    const showTimer = setTimeout(() => setVisible(true), 1000);
    return () => clearTimeout(showTimer);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 600);
    }, (lastLineDelay + 0.6 + 1.5) * 1000);
    return () => clearTimeout(timer);
  }, [visible, lastLineDelay, onClose]);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center px-6">
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center justify-center relative"
            style={{
              background: 'rgba(255, 253, 248, 0.45)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              borderRadius: 24,
              boxShadow: '0 8px 32px rgba(233,216,140,0.08), inset 0 1px 0 rgba(255,255,255,0.6)',
              padding: '24px 28px',
              maxWidth: 340,
              width: '100%',
              minHeight: 120,
            }}
          >
            <div
              className="absolute inset-0 rounded-3xl pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse at 50% 30%, rgba(233,216,140,0.15) 0%, transparent 70%)',
                animation: 'breathe 4s ease-in-out infinite',
              }}
            />
            <div className="relative z-10">
              {INTRO_LINES.map((line, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: i * 1.2 }}
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
    </div>
  );
}
