import { useState, useCallback, Component } from 'react';
import type { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router';
import {
  questions,
  submitSurveyAnswers,
  type SurveyAnswer,
  type ChoiceAnswer,
  type OpenAnswer,
} from '../lib/survey';

/* ── Error Boundary ── */
interface EBState { hasError: boolean; error?: Error }
class ErrorBoundary extends Component<{ children: ReactNode }, EBState> {
  state: EBState = { hasError: false };
  static getDerivedStateFromError(error: Error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, color: '#fff', background: '#1a1028', minHeight: '100vh' }}>
          <p>加载出错了</p>
          <p style={{ fontSize: 12, opacity: 0.5 }}>{this.state.error?.message}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

/* ═══════════════════════════════════════════
   ChildRoom 9 - 问卷调查
   一题一题出现，提交前可修改，答案上传 Firestore
   ═══════════════════════════════════════════ */

export default function ChildRoom9() {
  return (
    <ErrorBoundary>
      <SurveyPage />
    </ErrorBoundary>
  );
}

function SurveyPage() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, SurveyAnswer>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(false);

  const totalQuestions = questions.length;
  const currentQ = questions[currentIndex];

  /* ── 当前答案 ── */
  const currentAnswer = answers[currentQ.id];

  /* ── 更新选择题答案 ── */
  const handleSelectOption = useCallback((questionId: number, optionLabel: string, isOther: boolean) => {
    setAnswers((prev) => {
      const existing = prev[questionId] as ChoiceAnswer | undefined;
      const customText = isOther ? (existing?.customText || '') : '';
      return {
        ...prev,
        [questionId]: {
          questionId,
          type: 'choice' as const,
          selectedOption: optionLabel,
          customText,
        },
      };
    });
  }, []);

  /* ── 更新"其他"自定义文本 ── */
  const handleOtherTextChange = useCallback((questionId: number, text: string) => {
    setAnswers((prev) => {
      const existing = prev[questionId] as ChoiceAnswer | undefined;
      return {
        ...prev,
        [questionId]: {
          questionId,
          type: 'choice' as const,
          selectedOption: existing?.selectedOption || '',
          customText: text,
        },
      };
    });
  }, []);

  /* ── 更新开放题答案 ── */
  const handleOpenTextChange = useCallback((questionId: number, text: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        questionId,
        type: 'open' as const,
        text,
      },
    }));
  }, []);

  /* ── 当前题是否已作答 ── */
  const isCurrentAnswered = (() => {
    if (!currentAnswer) return false;
    if (currentAnswer.type === 'choice') {
      return currentAnswer.selectedOption !== '';
    }
    return currentAnswer.type === 'open' && currentAnswer.text.trim() !== '';
  })();

  /* ── 是否所有题都已回答 ── */
  const allAnswered = questions.every((q) => {
    const a = answers[q.id];
    if (!a) return false;
    if (a.type === 'choice') return a.selectedOption !== '';
    return a.type === 'open' && a.text.trim() !== '';
  });

  /* ── 导航 ── */
  const goNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((i) => i + 1);
    }
  };
  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  };

  /* ── 提交 ── */
  const handleSubmit = async () => {
    if (!allAnswered || submitting) return;
    setSubmitting(true);
    setError(false);
    try {
      const answerList = questions.map((q) => answers[q.id]);
      await submitSurveyAnswers(answerList);
      setSubmitted(true);
    } catch (e) {
      console.error('提交失败:', e);
      setError(true);
    } finally {
      setSubmitting(false);
    }
  };

  /* ── 提交成功页面 ── */
  if (submitted) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: '#1a1028' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 22, stiffness: 300 }}
          className="flex flex-col items-center px-8"
        >
          <div style={{ fontSize: 56, marginBottom: 20 }}>&#10024;</div>
          <p
            style={{
              fontFamily: 'Quicksand, sans-serif',
              fontSize: 20,
              fontWeight: 700,
              color: '#fff',
              textAlign: 'center',
              marginBottom: 12,
            }}
          >
            谢谢你的回答！
          </p>
          <p
            style={{
              fontFamily: 'Quicksand, sans-serif',
              fontSize: 15,
              color: 'rgba(255,255,255,0.6)',
              textAlign: 'center',
              marginBottom: 32,
              lineHeight: 1.8,
            }}
          >
            我会认真看每一题的答案
            <br />
            想更了解你一点点 ☺
          </p>
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '12px 32px',
              borderRadius: 24,
              border: 'none',
              background: 'linear-gradient(135deg, #B8A0D2 0%, #9B80BC 100%)',
              boxShadow: '0 4px 12px rgba(184, 160, 210, 0.35)',
              color: '#fff',
              fontSize: 15,
              fontWeight: 700,
              fontFamily: 'Quicksand, sans-serif',
              cursor: 'pointer',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            回到日历
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col" style={{ background: '#1a1028' }}>
      {/* ── 顶部进度条 ── */}
      <div style={{ padding: '16px 20px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span
            style={{
              fontFamily: 'Quicksand, sans-serif',
              fontSize: 13,
              color: 'rgba(255,255,255,0.5)',
            }}
          >
            第 {currentIndex + 1} / {totalQuestions} 题
          </span>
          <span
            style={{
              fontFamily: 'Quicksand, sans-serif',
              fontSize: 13,
              color: 'rgba(184, 160, 210, 0.8)',
            }}
          >
            {Math.round(((currentIndex + 1) / totalQuestions) * 100)}%
          </span>
        </div>
        <div
          style={{
            width: '100%',
            height: 4,
            borderRadius: 2,
            background: 'rgba(255,255,255,0.1)',
          }}
        >
          <motion.div
            animate={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            style={{
              height: '100%',
              borderRadius: 2,
              background: 'linear-gradient(90deg, #B8A0D2, #9B80BC)',
            }}
          />
        </div>
      </div>

      {/* ── 题目区域 ── */}
      <div
        className="flex-1 overflow-y-auto"
        style={{ padding: '24px 20px 120px' }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQ.id}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
          >
            {/* 题目标题 */}
            <p
              style={{
                fontFamily: 'Quicksand, sans-serif',
                fontSize: 18,
                fontWeight: 700,
                color: '#fff',
                lineHeight: 1.7,
                marginBottom: 24,
              }}
            >
              {currentQ.question}
            </p>

            {/* 选择题 */}
            {currentQ.type === 'choice' && currentQ.options && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {currentQ.options.map((opt) => {
                  const isSelected =
                    (answers[currentQ.id] as ChoiceAnswer | undefined)?.selectedOption === opt.label;
                  return (
                    <motion.button
                      key={opt.label}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSelectOption(currentQ.id, opt.label, !!opt.isOther)}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 12,
                        width: '100%',
                        padding: '14px 16px',
                        borderRadius: 14,
                        border: isSelected
                          ? '1.5px solid rgba(184, 160, 210, 0.6)'
                          : '1.5px solid rgba(255,255,255,0.1)',
                        background: isSelected
                          ? 'rgba(184, 160, 210, 0.15)'
                          : 'rgba(255,255,255,0.04)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.2s',
                      }}
                    >
                      {/* 选项圆圈 */}
                      <div
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: '50%',
                          border: isSelected
                            ? '2px solid #B8A0D2'
                            : '2px solid rgba(255,255,255,0.25)',
                          background: isSelected ? '#B8A0D2' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          marginTop: 1,
                          transition: 'all 0.2s',
                        }}
                      >
                        {isSelected && (
                          <div
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              background: '#fff',
                            }}
                          />
                        )}
                      </div>
                      {/* 选项文字 */}
                      <span
                        style={{
                          fontFamily: 'Quicksand, sans-serif',
                          fontSize: 15,
                          lineHeight: 1.6,
                          color: isSelected ? '#fff' : 'rgba(255,255,255,0.7)',
                          transition: 'color 0.2s',
                        }}
                      >
                        {opt.text}
                      </span>
                    </motion.button>
                  );
                })}

                {/* "其他"选项的文本输入框 */}
                {(() => {
                  const otherOpt = currentQ.options.find((o) => o.isOther);
                  const answer = answers[currentQ.id] as ChoiceAnswer | undefined;
                  if (!otherOpt || !answer || answer.selectedOption !== otherOpt.label) return null;
                  return (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      style={{ marginTop: 4 }}
                    >
                      <input
                        value={answer.customText || ''}
                        onChange={(e) => handleOtherTextChange(currentQ.id, e.target.value)}
                        placeholder="请输入你的答案..."
                        maxLength={200}
                        autoFocus
                        style={{
                          width: '100%',
                          boxSizing: 'border-box',
                          padding: '12px 16px',
                          borderRadius: 12,
                          border: '1.5px solid rgba(184, 160, 210, 0.3)',
                          background: 'rgba(255,255,255,0.06)',
                          color: '#fff',
                          fontSize: 15,
                          fontFamily: 'Quicksand, sans-serif',
                          outline: 'none',
                          transition: 'border-color 0.2s',
                        }}
                        onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(184, 160, 210, 0.6)')}
                        onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(184, 160, 210, 0.3)')}
                      />
                    </motion.div>
                  );
                })()}
              </div>
            )}

            {/* 开放题 */}
            {currentQ.type === 'open' && (
              <div>
                <textarea
                  value={(answers[currentQ.id] as OpenAnswer | undefined)?.text || ''}
                  onChange={(e) => handleOpenTextChange(currentQ.id, e.target.value)}
                  placeholder={currentQ.placeholder || '写下你的答案...'}
                  maxLength={500}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    minHeight: 140,
                    padding: '16px',
                    borderRadius: 14,
                    border: '1.5px solid rgba(184, 160, 210, 0.3)',
                    background: 'rgba(255,255,255,0.06)',
                    color: '#fff',
                    fontSize: 15,
                    lineHeight: 1.8,
                    fontFamily: 'Quicksand, sans-serif',
                    outline: 'none',
                    resize: 'vertical',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(184, 160, 210, 0.6)')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(184, 160, 210, 0.3)')}
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── 底部导航按钮 ── */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '16px 20px 28px',
          background: 'linear-gradient(transparent, #1a1028 30%)',
          display: 'flex',
          gap: 12,
          zIndex: 10,
        }}
      >
        {/* 上一题 */}
        {currentIndex > 0 ? (
          <button
            onClick={goPrev}
            style={{
              flex: 1,
              padding: '14px 0',
              borderRadius: 14,
              border: '1.5px solid rgba(255,255,255,0.15)',
              background: 'transparent',
              color: 'rgba(255,255,255,0.7)',
              fontSize: 15,
              fontWeight: 700,
              fontFamily: 'Quicksand, sans-serif',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            上一题
          </button>
        ) : (
          <button
            onClick={() => navigate('/')}
            style={{
              flex: 1,
              padding: '14px 0',
              borderRadius: 14,
              border: '1.5px solid rgba(255,255,255,0.1)',
              background: 'transparent',
              color: 'rgba(255,255,255,0.4)',
              fontSize: 15,
              fontFamily: 'Quicksand, sans-serif',
              cursor: 'pointer',
            }}
          >
            返回
          </button>
        )}

        {/* 下一题 / 提交 */}
        {currentIndex < totalQuestions - 1 ? (
          <button
            onClick={goNext}
            disabled={!isCurrentAnswered}
            style={{
              flex: 1,
              padding: '14px 0',
              borderRadius: 14,
              border: 'none',
              background: isCurrentAnswered
                ? 'linear-gradient(135deg, #B8A0D2 0%, #9B80BC 100%)'
                : 'rgba(255,255,255,0.08)',
              color: isCurrentAnswered ? '#fff' : 'rgba(255,255,255,0.3)',
              fontSize: 15,
              fontWeight: 700,
              fontFamily: 'Quicksand, sans-serif',
              cursor: isCurrentAnswered ? 'pointer' : 'default',
              transition: 'all 0.2s',
              boxShadow: isCurrentAnswered ? '0 4px 12px rgba(184, 160, 210, 0.35)' : 'none',
            }}
          >
            下一题
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!allAnswered || submitting}
            style={{
              flex: 1,
              padding: '14px 0',
              borderRadius: 14,
              border: 'none',
              background: allAnswered && !submitting
                ? 'linear-gradient(135deg, #B8A0D2 0%, #9B80BC 100%)'
                : 'rgba(255,255,255,0.08)',
              color: allAnswered && !submitting ? '#fff' : 'rgba(255,255,255,0.3)',
              fontSize: 15,
              fontWeight: 700,
              fontFamily: 'Quicksand, sans-serif',
              cursor: allAnswered && !submitting ? 'pointer' : 'default',
              transition: 'all 0.2s',
              boxShadow: allAnswered && !submitting ? '0 4px 12px rgba(184, 160, 210, 0.35)' : 'none',
            }}
          >
            {submitting ? '提交中...' : '提交问卷'}
          </button>
        )}
      </div>

      {/* ── 提交失败提示 ── */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            style={{
              position: 'fixed',
              bottom: 100,
              left: '50%',
              transform: 'translateX(-50%)',
              padding: '10px 20px',
              borderRadius: 10,
              background: 'rgba(255,80,80,0.2)',
              border: '1px solid rgba(255,80,80,0.3)',
              color: 'rgba(255,150,150,0.9)',
              fontSize: 14,
              fontFamily: 'Quicksand, sans-serif',
              zIndex: 20,
            }}
          >
            提交失败，请重试
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
