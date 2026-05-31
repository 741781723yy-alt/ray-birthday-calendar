import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

/* ── 问题类型 ── */
export interface ChoiceOption {
  label: string; // e.g. 'A'
  text: string;
  isOther?: boolean; // 是否为"其他：______"选项
}

export interface SurveyQuestion {
  id: number;
  type: 'choice' | 'open';
  question: string;
  options?: ChoiceOption[];
  placeholder?: string; // 开放题的 placeholder
}

/* ── 答案类型 ── */
export interface ChoiceAnswer {
  questionId: number;
  type: 'choice';
  selectedOption: string;
  customText: string; // 仅当选了"其他"时填写
}

export interface OpenAnswer {
  questionId: number;
  type: 'open';
  text: string;
}

export type SurveyAnswer = ChoiceAnswer | OpenAnswer;

/* ── 12 道问题 ── */
export const questions: SurveyQuestion[] = [
  {
    id: 1,
    type: 'choice',
    question: '下面哪个最像你理想中的周末？',
    options: [
      { label: 'A', text: '睡到自然醒，在家躺一天' },
      { label: 'B', text: '去没去过的地方逛逛' },
      { label: 'C', text: '和朋友聚会' },
      { label: 'D', text: '两个人出去约会' },
      { label: 'E', text: '其他：______', isOther: true },
    ],
  },
  {
    id: 2,
    type: 'choice',
    question: '你最喜欢哪一种陪伴？',
    options: [
      { label: 'A', text: '一起出去玩' },
      { label: 'B', text: '一起吃饭聊天' },
      { label: 'C', text: '各做各的事，但待在一起' },
      { label: 'D', text: '其他：______', isOther: true },
    ],
  },
  {
    id: 3,
    type: 'choice',
    question: '当你给我发消息的时候，更希望：',
    options: [
      { label: 'A', text: '我马上回复' },
      { label: 'B', text: '有空再回就好' },
      { label: 'C', text: '看情况' },
      { label: 'D', text: '其他：______', isOther: true },
    ],
  },
  {
    id: 4,
    type: 'open',
    question: '如果未来某一天，你特别特别不开心，最希望我做的一件事是什么？',
    placeholder: '写下你的答案...',
  },
  {
    id: 5,
    type: 'choice',
    question: '如果你遇到烦心事，你更希望我：',
    options: [
      { label: 'A', text: '给建议' },
      { label: 'B', text: '听你吐槽' },
      { label: 'C', text: '抱抱你（如果在身边的话）' },
      { label: 'D', text: '先不问你，等你想说的时候再说' },
      { label: 'E', text: '其他：______', isOther: true },
    ],
  },
  {
    id: 6,
    type: 'choice',
    question: '我们吵架的时候，你更希望：',
    options: [
      { label: 'A', text: '当天解决' },
      { label: 'B', text: '先冷静一下，第二天再聊' },
      { label: 'C', text: '其他：______', isOther: true },
    ],
  },
  {
    id: 7,
    type: 'choice',
    question: '当你说"我好累呀"的时候，你最希望我：',
    options: [
      { label: 'A', text: '让你一个人安静待一会儿，等缓过来再来找我' },
      { label: 'B', text: '给我打个电话，或者来见见我' },
      { label: 'C', text: '陪你聊聊天，但不用急着解决问题' },
      { label: 'D', text: '其他：______', isOther: true },
    ],
  },
  {
    id: 8,
    type: 'choice',
    question: '如果有一天你发现我有点不开心，你更希望我：',
    options: [
      { label: 'A', text: '直接告诉你，就算当下会有一点压力' },
      { label: 'B', text: '先自己消化一下，整理好再和你说' },
      { label: 'C', text: '看情况，想说就说，不想说就不说' },
      { label: 'D', text: '其他：______', isOther: true },
    ],
  },
  {
    id: 9,
    type: 'choice',
    question: '如果最近工作特别忙，我做这件事情会让你觉得轻松一点：',
    options: [
      { label: 'A', text: '点一个好吃的外卖' },
      { label: 'B', text: '让你安静休息，当你独处，不用找你' },
      { label: 'C', text: '帮你分担一些小事情' },
      { label: 'D', text: '其他：______', isOther: true },
    ],
  },
  {
    id: 10,
    type: 'choice',
    question: '如果有一天你说："我没事。"这句话更有可能是：',
    options: [
      { label: 'A', text: '我真的没事' },
      { label: 'B', text: '我想自己消化一下' },
      { label: 'C', text: '快来关心我一下笨蛋' },
      { label: 'D', text: '其他：______', isOther: true },
    ],
  },
  {
    id: 11,
    type: 'open',
    question: '当你觉得自己做得不够好的时候，你最希望听到别人说什么？',
    placeholder: '写下你的答案...',
  },
  {
    id: 12,
    type: 'open',
    question: '如果有一张"许愿券"，你希望我帮你完成什么？',
    placeholder: '写下你的答案...',
  },
];

/* ── 提交答案到 Firestore ── */
export async function submitSurveyAnswers(
  answers: SurveyAnswer[],
): Promise<string> {
  const ref = await addDoc(collection(db, 'survey-answers'), {
    answers,
    submittedAt: serverTimestamp(),
  });
  return ref.id;
}
