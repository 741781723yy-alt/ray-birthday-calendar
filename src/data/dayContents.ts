// Day Contents Data - 12 days of birthday countdown
// All content is in Chinese with English translation comments

export type ContentType =
  | 'text'
  | 'photo'
  | 'voice'
  | 'video'
  | 'candle'
  | 'timeline'
  | 'envelope';

// Voice Message Item
export interface VoiceMessageData {
  id: string;
  label: string;
  sender: string;
  duration: string;
  timestamp: string;
}

// Timeline Era
export interface TimelineEra {
  id: string;
  emoji: string;
  name: string;
  photos: {
    caption: string;
    date: string;
  }[];
  note: string;
}

// Day Content
export interface DayContent {
  day: number;
  date: string;
  contentType: ContentType;
  title: string;
  subtitle?: string;
  message?: string;
  signature?: string;
  photoCaption?: string;
  videoTitle?: string;
  videoDescription?: string;
  videoDuration?: string;
  voiceMessages?: VoiceMessageData[];
  timelineEras?: TimelineEra[];
  candleCount?: number;
}

export const dayContents: DayContent[] = [
  {
    day: 1,
    date: '6\u67081\u65E5',
    contentType: 'text',
    title: '\u751F\u65E5\u5012\u8BA1\u65F6\u5F00\u59CB\uFF01',
    message:
      '\u4E4B\u540E\u7684\u6BCF\u4E00\u5929\u90FD\u6709\u4E00\u4EFD\u5C0F\u60CA\u559C\u7B49\u7740\u4F60\uFF0C\n\n\u7B54\u5E94\u6211\uFF0C\u6BCF\u5929\u53EA\u80FD\u6253\u5F00\u4E00\u4E2A\u683C\u5B50\u54E6\uFF5E',
    signature: '',
  },
  {
    day: 2,
    date: '6月2日',
    contentType: 'text',
    title: '',
    message: '今天依然是时光之旅\n\n去见见另一个时间的你。',
    signature: '',
  },
  {
    day: 3,
    date: '6月3日',
    contentType: 'text',
    title: '',
    message: '今天我们要去见一见，\n\n哪个时候的你呢？',
    signature: '',
  },
  {
    day: 4,
    date: '6\u67084\u65E5',
    contentType: 'text',
    title: '',
    message: '\u4ECA\u5929\u6211\u4EEC\u53BB\u770B\u770B\uFF0C\n\n\u66FE\u7ECF\u53EF\u80FD\u64E6\u80A9\u800C\u8FC7\u7684\u5730\u65B9\u3002',
    signature: '',
  },
    {
    day: 5,
    date: '6月5日',
    contentType: 'text',
    title: '',
    message: '成年人的世界可以变得很大，\n\n今天我们去更远的地方看看。',
    signature: '',
  },
  {
    day: 6,
    date: '6\u67086\u65E5',
    contentType: 'text',
    title: '',
    message: '\u4ECA\u5929\u8981\u8BA9\u65F6\u95F4\u5FEB\u8FDB\u4E00\u4E0B\uFF0C\n\n\u7EC8\u4E8E\u8F6E\u5230\u6211\u767B\u573A\u4E86\u3002',
    signature: '',
  },
  {
    day: 7,
    date: '6\u67087\u65E5',
    contentType: 'text',
    title: '',
    message:
      '\u7EC8\u4E8E\u53EF\u4EE5\u56DE\u5230\u73B0\u5728\u4E86\uFF01\n\n\u6211\u627E\u5230\u5F88\u591A\u5173\u4E8E\u201C\u6211\u4EEC\u201D\u7684\u7167\u7247\uFF0C\n\n\u4E00\u8D77\u770B\u770B\u5427\uFF5E',
    signature: '',
  },
  {
    day: 8,
    date: '6\u67088\u65E5',
    contentType: 'text',
    title: '',
    message: '\u6211\u5077\u5077\u51C6\u5907\u4E86\u4E00\u4EFD\u6863\u6848\uFF0C\n\n\u91CC\u9762\u8BB0\u7684\u5168\u662F\u5173\u4E8E\u4F60\u7684\u4E8B\u60C5\u3002\n\n\u6253\u5F00\u770B\u770B\u5427\uFF5E',
    signature: '',
  },
  {
    day: 9,
    date: '6\u67089\u65E5',
    contentType: 'text',
    title: '',
    message:
      '\u548C\u4F60\u76F8\u5904\u7684\u65F6\u5019\uFF0C\u6211\u53D1\u73B0\u6211\u4EEC\u8868\u8FBE\u559C\u6B22\u548C\u63A5\u53D7\u559C\u6B22\u7684\u65B9\u5F0F\u6709\u70B9\u4E0D\u4E00\u6837\u3002\n\n\u6240\u4EE5\u4ECA\u5929\uFF0C\u6211\u51C6\u5907\u4E86\u4E00\u4EFD\u5C0F\u8C03\u67E5\u95EE\u5377\u3002\n\n\u6CA1\u6709\u6807\u51C6\u7B54\u6848\u3002\u53EA\u662F\u60F3\u66F4\u4E86\u89E3\u4F60\u4E00\u70B9\u70B9\u3002',
    signature: '',
  },
  {
    day: 10,
    date: '6\u670810\u65E5',
    contentType: 'text',
    title: '',
    message: '\u5DF2\u7ECF\u5012\u8BA1\u65F610\u5929\u4E86\uFF01\n\n\u4ECA\u5929\u60F3\u9080\u8BF7\u4F60\u53BB\u6D77\u8FB9\u770B\u661F\u661F\uFF5E',
    signature: '',
  },
  {
    day: 11,
    date: '6\u670811\u65E5',
    contentType: 'envelope',
    title: '',
    message: '\u4EB2\u7231\u7684\u4F60\uFF0C\n\n\u8FD9\u662F\u4E00\u5C01\u6765\u81EA\u672A\u6765\u7684\u9080\u8BF7\u3002\n\n\u8BA9\u6211\u4EEC\u4E00\u8D77\u51FA\u53D1\u5427\uFF01',
  },
  {
    day: 12,
    date: '6\u670812\u65E5',
    contentType: 'text',
    title: '\u751F\u65E5\u5FEB\u4E50\uFF01',
    message: '\u7EC8\u4E8E\u5230\u4F60\u7684\u751F\u65E5\u5566\uFF0C\n\n\u6211\u51C6\u5907\u4E86\u4E00\u4E9B\u5C0F\u60CA\u559C\u54E6\uFF5E',
    signature: '',
  },
];

export function getDayContent(day: number): DayContent | undefined {
  return dayContents.find((d) => d.day === day);
}

export function getContentTypeForDay(day: number): ContentType | undefined {
  return dayContents.find((d) => d.day === day)?.contentType;
}
