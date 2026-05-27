import { useState, useRef, useCallback } from 'react';

interface FlipBookProps {
  cover?: string;
  spreads?: string[];
  onComplete?: () => void;
}

export default function FlipBook({ cover, spreads = [], onComplete }: FlipBookProps) {
  const [flipped, setFlipped] = useState(0);
  const [flipping, setFlipping] = useState(false);
  const [flipDir, setFlipDir] = useState<'fwd' | 'bwd'>('fwd');
  const [topOverride, setTopOverride] = useState<string | null | false>(null);
  const touch = useRef({ y: 0, t: 0 });

  const total = spreads.length;
  const done = flipped >= total;

  /* ── Content mapping ── */

  // Static top: back of last flipped sheet
  const topImg = flipped > 0 ? spreads[flipped - 1] : null;
  // topOverride=false means "show nothing", topOverride=null means "use topImg"
  const effectiveTopImg = topOverride === false ? null
    : topOverride !== null ? topOverride
    : topImg;

  // Forward sheet content
  const frontImg = flipped === 0 ? (cover ?? null) : spreads[flipped - 1];
  const backImg = flipped < total ? spreads[flipped] : null;
  const revealImg = flipped < total ? spreads[flipped] : (flipped > 0 ? spreads[flipped - 1] : null);
  const isCover = flipped === 0;

  // Backward flip content (from state N → N-1)
  const bwdFrontImg = flipped > 0 ? spreads[flipped - 1] : null;
  const bwdBackImg = flipped === 1 ? (cover ?? null) : (flipped > 1 ? spreads[flipped - 2] : null);
  const bwdBackIsCover = flipped <= 1;

  /* ── Forward flip ── */

  const flipForward = useCallback(() => {
    if (flipping) return;
    if (done) { onComplete?.(); return; }
    setFlipDir('fwd');
    setFlipping(true);
  }, [flipping, done, onComplete]);

  /* ── Backward flip ── */

  const flipBackward = useCallback(() => {
    if (flipping || flipped <= 0) return;
    setFlipDir('bwd');
    setTopOverride(flipped > 1 ? spreads[flipped - 2] : false);
    setFlipping(true);
  }, [flipping, flipped, spreads]);

  /* ── Flip complete ── */

  const onFlipComplete = useCallback(() => {
    if (!flipping) return;
    if (flipDir === 'fwd') {
      setFlipped(f => f + 1);
    } else {
      setFlipped(f => f - 1);
    }
    setFlipping(false);
    setFlipDir('fwd');
    setTopOverride(null);
  }, [flipping, flipDir]);

  /* ── Touch ── */

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touch.current = { y: e.touches[0].clientY, t: Date.now() };
  }, []);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (flipping) return;
    const dy = touch.current.y - e.changedTouches[0].clientY;
    const dt = Date.now() - touch.current.t;
    const vel = Math.abs(dy) / dt;

    if (dy > 35 || (dy > 15 && vel > 0.25)) {
      flipForward();
    } else if (dy < -35 || (dy < -15 && vel > 0.25)) {
      flipBackward();
    }
  }, [flipping, flipForward, flipBackward]);

  /* ── Render helper ── */

  const faceStyle = (
    img: string | null,
    pos: 'cover' | 'top' | 'bottom',
    fallback: string,
  ): React.CSSProperties => ({
    position: 'absolute',
    inset: 0,
    backfaceVisibility: 'hidden',
    ...(img ? {
      backgroundImage: `url(${img})`,
      backgroundSize: pos === 'cover' ? 'cover' : '100% 200%',
      backgroundPosition: pos === 'cover' ? 'center' : pos,
      backgroundRepeat: 'no-repeat',
    } : {}),
    backgroundColor: fallback,
  });

  return (
    <div className="fb-root" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <div className="fb-book">
        {/* ── Top half: static ── */}
        <div className="fb-half fb-top">
          {effectiveTopImg ? (
            <div style={faceStyle(effectiveTopImg, 'top', '#E8DCC8')} />
          ) : null}
        </div>

        {/* ── Spine (thin line) ── */}
        <div className="fb-spine" />

        {/* ── Bottom half: static reveal ── */}
        <div className="fb-half fb-btm">
          <div style={faceStyle(revealImg, 'bottom', '#FDF6EC')} />
          <div className="fb-page-dot-row">
            {spreads.map((_, i) => (
              <div
                key={i}
                className="fb-page-dot"
                style={{
                  background: i < flipped ? '#C4A882' : '#E8DCC8',
                  transform: i === flipped ? 'scale(1.3)' : 'scale(1)',
                }}
              />
            ))}
          </div>
        </div>

        {/* ── Forward sheet (bottom, flips up) ── */}
        {!done && !(flipping && flipDir === 'bwd') && (
          <div
            key={`fwd-${flipped}`}
            className={`fb-sheet${flipping && flipDir === 'fwd' ? ' flipping' : ''}`}
            onTransitionEnd={flipping && flipDir === 'fwd' ? (e) => {
              if (e.target === e.currentTarget) onFlipComplete();
            } : undefined}
          >
            <div style={{
              ...faceStyle(frontImg, isCover ? 'cover' : 'bottom', isCover ? '#8B6F47' : '#FDF6EC'),
              ...(isCover && !frontImg ? {
                background: `repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px),
                  linear-gradient(135deg, #8B6F47 0%, #6B4F37 50%, #8B6F47 100%)`,
              } : {}),
              borderRadius: '0 0 8px 8px',
            }}>
              {isCover && <div className="fb-cover-border" />}
              {!isCover && <div className="fb-page-corner" />}
            </div>
            <div style={{
              ...faceStyle(backImg, 'top', '#F5EDD8'),
              transform: 'rotateX(180deg)',
              borderRadius: '8px 8px 0 0',
            }}>
              <div className="fb-page-corner fb-page-corner-back" />
            </div>
            <div className="fb-edge" />
            {flipping && flipDir === 'fwd' && <div className="fb-shadow" />}
          </div>
        )}

        {/* ── Reverse sheet (top, flips down for backward) ── */}
        {flipping && flipDir === 'bwd' && (
          <div
            key={`bwd-${flipped}`}
            className="fb-sheet-reverse bwd-animating"
            onAnimationEnd={(e) => {
              if (e.target === e.currentTarget) onFlipComplete();
            }}
          >
            {/* Front: current top content, visible at rotateX(0) */}
            <div style={{
              ...faceStyle(bwdFrontImg, 'top', '#F5EDD8'),
              borderRadius: '8px 8px 0 0',
            }} />
            {/* Back: previous bottom content, visible at rotateX(180deg) */}
            <div style={{
              ...faceStyle(bwdBackImg, bwdBackIsCover ? 'cover' : 'bottom', bwdBackIsCover ? '#8B6F47' : '#FDF6EC'),
              transform: 'rotateX(180deg)',
              borderRadius: '0 0 8px 8px',
            }}>
              {bwdBackIsCover && <div className="fb-cover-border" />}
            </div>
            <div className="fb-edge-reverse" />
            <div className="fb-shadow-bwd" />
          </div>
        )}
      </div>

      <p className="fb-hint">
        {done ? '上滑继续' : flipped === 0 ? '↑ 上滑翻页' : '↑↓ 翻页'}
      </p>

      <style>{`
        .fb-root {
          width: 100%; height: 100%;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          touch-action: none; user-select: none; -webkit-user-select: none;
        }

        .fb-book {
          position: relative;
          width: 88%; max-width: 380px;
          aspect-ratio: 5 / 7;
          max-height: 72vh;
          perspective: 1500px;
        }

        /* ── Halves ── */
        .fb-half {
          position: absolute; left: 0; right: 0;
          overflow: hidden;
        }
        .fb-top { top: 0; height: 50%; border-radius: 8px 8px 0 0; background: transparent; }
        .fb-btm { bottom: 0; height: 50%; border-radius: 0 0 8px 8px; }

        /* ── Spine ── */
        .fb-spine {
          position: absolute; top: 50%; left: 0; right: 0;
          height: 1px; transform: translateY(-50%);
          z-index: 90; pointer-events: none;
          background: rgba(0,0,0,0.06);
        }

        /* ── Forward sheet (bottom → top) ── */
        .fb-sheet {
          position: absolute; left: 0; right: 0;
          top: 50%; height: 50%;
          transform-style: preserve-3d;
          transform-origin: top center;
          transform: rotateX(0deg);
          z-index: 50;
          will-change: transform;
        }
        .fb-sheet.flipping {
          transform: rotateX(-180deg);
          z-index: 100;
          transition: transform 0.8s cubic-bezier(0.4, 0.0, 0.2, 1);
        }

        /* ── Reverse sheet (top → bottom) ── */
        .fb-sheet-reverse {
          position: absolute; left: 0; right: 0;
          top: 0; height: 50%;
          transform-style: preserve-3d;
          transform-origin: bottom center;
          z-index: 100;
        }
        .fb-sheet-reverse.bwd-animating {
          animation: bwd-flip 0.8s cubic-bezier(0.4, 0.0, 0.2, 1) forwards;
        }
        @keyframes bwd-flip {
          from { transform: rotateX(0deg); }
          to { transform: rotateX(180deg); }
        }

        /* ── Paper edges ── */
        .fb-edge {
          position: absolute; left: 0; right: 0; bottom: 0; height: 4px;
          transform-origin: bottom; transform: rotateX(-90deg);
          background: linear-gradient(to bottom, #C9B896, #B8A582);
          backface-visibility: hidden;
        }
        .fb-edge-reverse {
          position: absolute; left: 0; right: 0; top: 0; height: 4px;
          transform-origin: top; transform: rotateX(90deg);
          background: linear-gradient(to top, #C9B896, #B8A582);
          backface-visibility: hidden;
        }

        /* ── Cover ── */
        .fb-cover-border {
          position: absolute; inset: 8px;
          border: 1.5px solid rgba(255,255,255,0.12);
          border-radius: 4px; pointer-events: none;
        }

        /* ── Page corners ── */
        .fb-page-corner {
          position: absolute; bottom: 0; right: 0;
          width: 50px; height: 50px; pointer-events: none;
          background: radial-gradient(ellipse at 100% 100%, rgba(0,0,0,0.08) 0%, transparent 70%);
        }
        .fb-page-corner-back {
          bottom: auto; right: auto; top: 0; left: 0;
          background: radial-gradient(ellipse at 0% 0%, rgba(0,0,0,0.06) 0%, transparent 70%);
        }

        /* ── Shadows ── */
        .fb-shadow {
          position: absolute; inset: 0; z-index: 10; pointer-events: none;
          background: linear-gradient(to bottom, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.04) 40%, transparent 100%);
          animation: fb-shadow-fade 0.8s ease-out forwards;
        }
        .fb-shadow-bwd {
          position: absolute; inset: 0; z-index: 10; pointer-events: none;
          background: linear-gradient(to top, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.04) 40%, transparent 100%);
          animation: fb-shadow-fade 0.8s ease-out forwards;
        }
        @keyframes fb-shadow-fade {
          from { opacity: 1; } to { opacity: 0; }
        }

        /* ── Page dots ── */
        .fb-page-dot-row {
          position: absolute; bottom: 12px; left: 50%;
          transform: translateX(-50%);
          display: flex; gap: 6px; z-index: 5; pointer-events: none;
        }
        .fb-page-dot {
          width: 5px; height: 5px; border-radius: 50%;
          transition: all 0.3s ease;
        }

        /* ── Hint ── */
        .fb-hint {
          margin-top: 24px;
          font-family: 'Quicksand', sans-serif;
          font-size: 13px; color: rgba(255,255,255,0.5);
          animation: fb-pulse 2s ease-in-out infinite;
        }
        @keyframes fb-pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
