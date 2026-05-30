import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router';

const PART1 = ['好像写了很多想要去做的事情。'];
const PART2 = ['还好我们还有很多时间，', '可以一件一件慢慢完成～'];
const PAUSE = 1; // 秒

export default function Ending() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<'stars' | 'text' | 'cake'>('stars');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('text'), 1500);
    return () => clearTimeout(t1);
  }, []);

  return (
    <div
      className="fixed inset-0 overflow-hidden"
      style={{ background: '#050816' }}
    >
      {/* 星空背景 */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(180deg, #050816 0%, #0a1128 30%, #0f1a3a 60%, #0d1530 100%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: '80%',
          height: '40%',
          top: '10%',
          left: '10%',
          background:
            'radial-gradient(ellipse, rgba(100,120,200,0.08) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      {/* 内容区 */}
      <div className="absolute inset-0 flex items-center justify-center px-6">
        <AnimatePresence mode="wait">
          {phase === 'text' && (
            <motion.div
              key="text"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              style={{ textAlign: 'center' }}
            >
              {PART1.map((line, i) => (
                <motion.p
                  key={`p1-${i}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: i * 0.6 }}
                  style={{
                    fontFamily: 'Quicksand, sans-serif',
                    fontSize: 20,
                    lineHeight: 2,
                    color: '#fff',
                    margin: 0,
                  }}
                >
                  {line}
                </motion.p>
              ))}
              <div style={{ height: 24 }} />
              {PART2.map((line, i) => (
                <motion.p
                  key={`p2-${i}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: (PART1.length * 0.6 + PAUSE) + i * 0.6 }}
                  style={{
                    fontFamily: 'Quicksand, sans-serif',
                    fontSize: 20,
                    lineHeight: 2,
                    color: '#fff',
                    margin: 0,
                  }}
                >
                  {line}
                </motion.p>
              ))}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: (PART1.length * 0.6 + PAUSE) + PART2.length * 0.6 + 0.8 }}
                onClick={() => navigate('/', { state: { buildingOpen: true } })}
                style={{
                  marginTop: 36,
                  padding: '10px 28px',
                  borderRadius: 20,
                  border: '1px solid rgba(255,255,255,0.2)',
                  background: 'rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  color: 'rgba(255,255,255,0.6)',
                  fontSize: 14,
                  fontFamily: 'Quicksand, sans-serif',
                  cursor: 'pointer',
                }}
              >
                回到日历
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
