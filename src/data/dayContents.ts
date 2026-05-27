// Day Contents Data - 12 days of birthday countdown
// All content is in Chinese with English translation comments

export type ContentType =
  | 'text'
  | 'photo'
  | 'voice'
  | 'video'
  | 'candle'
  | 'timeline';

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
    contentType: 'photo',
    title: '\u6700\u53EF\u7231\u7684\u4F60',
    photoCaption:
      "\u7FFB\u76F8\u518C\u7684\u65F6\u5019\u53D1\u73B0\u8FD9\u5F20\u7167\u7247\uFF0C\u77AC\u95F4\u88AB\u840C\u5316\u4E86\u3002\u4F60\u8BA4\u771F\u505A\u4E8B\u7684\u6837\u5B50\u3001\u7B11\u8D77\u6765\u772F\u8D77\u7684\u773C\u775B\u3001\u72AF\u50BB\u65F6\u7684\u8868\u60C5\uFF0C\u6BCF\u4E00\u4E2A\u4F60\u90FD\u662F\u90A3\u4E48\u53EF\u7231\u3002\u8FD9\u5C31\u662F\u6700\u771F\u5B9E\u7684\u4F60\uFF0C\u4E5F\u662F\u6211\u6700\u559C\u6B22\u7684\u4F60\u3002",
  },
  {
    day: 9,
    date: '6\u67089\u65E5',
    contentType: 'voice',
    title: '\u6084\u6084\u8BDD\u65F6\u95F4',
    subtitle: '\u4E00\u4E9B\u6084\u6084\u8BDD\uFF0C\u53EA\u8BF4\u7ED9\u4F60\u542C',
    voiceMessages: [
      { id: 'v4', label: '\u5077\u5077\u544A\u8BC9\u4F60', sender: '\u795E\u79D8\u670B\u53CB', duration: '0:15', timestamp: '6\u67089\u65E5' },
      { id: 'v5', label: '\u7B11\u8BDD\u4E00\u5219', sender: '\u5F00\u5FC3\u679C', duration: '0:42', timestamp: '6\u67089\u65E5' },
      { id: 'v6', label: '\u6211\u4EEC\u7684\u79D8\u5BC6', sender: '\u95FA\u871C', duration: '0:27', timestamp: '6\u67089\u65E5' },
      { id: 'v7', label: '\u6700\u540E\u7684\u5C0F\u60CA\u559C', sender: '???', duration: '0:19', timestamp: '6\u67089\u65E5' },
    ],
  },
  {
    day: 10,
    date: '6\u670810\u65E5',
    contentType: 'text',
    title: '\u5341\u5929\u5012\u8BA1\u65F6',
    message:
      "\u8F6C\u773C\u95F4\uFF0C\u5012\u8BA1\u65F6\u5DF2\u7ECF\u8FC7\u53BB\u4E00\u5927\u534A\u4E86\u3002\u8FD9\u5341\u5929\u91CC\uFF0C\u6211\u4EEC\u4E00\u8D77\u56DE\u5FC6\u4E86\u90A3\u4E48\u591A\u7F8E\u597D\u7684\u77AC\u95F4\u3002\u6BCF\u4E00\u6B21\u6B22\u7B11\u3001\u6BCF\u4E00\u4E2A\u62E5\u62B1\u3001\u6BCF\u4E00\u6BB5\u5BF9\u8BDD\uFF0C\u90FD\u8BA9\u6211\u89C9\u5F97\u8BA4\u8BC6\u4F60\u662F\u6700\u5E78\u8FD0\u7684\u4E8B\u3002\n\n\u8FD8\u6709\u6700\u540E\u4E24\u5929\uFF0C\u671F\u5F85\u90A3\u4E2A\u6700\u7279\u522B\u7684\u65F6\u523B\u3002\u751F\u65E5\u5FEB\u4E50\uFF0CRAY\uFF01",
    signature: '\u2014\u2014 \u4E00\u8DEF\u966A\u4F34\u7684\u4F60',
  },
  {
    day: 11,
    date: '6\u670811\u65E5',
    contentType: 'video',
    title: '\u6211\u4EEC\u7684\u6545\u4E8B',
    videoTitle: '\u6211\u4EEC\u7684\u6545\u4E8B',
    videoDescription: '\u5C5E\u4E8E\u6211\u4EEC\u7684\u7F8E\u597D\u56DE\u5FC6\uFF0C\u6BCF\u4E00\u5E27\u90FD\u662F\u73CD\u8D35\u7684\u6545\u4E8B',
    videoDuration: '2:05',
  },
  {
    day: 12,
    date: '6\u670812\u65E5',
    contentType: 'candle',
    title: '\u751F\u65E5\u5FEB\u4E50\uFF01',
    subtitle: '\u5BF9\u7740\u624B\u673A\u5439\u6C14\uFF0C\u5439\u706D\u751F\u65E5\u8721\u70DB',
    candleCount: 5,
  },
];

export function getDayContent(day: number): DayContent | undefined {
  return dayContents.find((d) => d.day === day);
}

export function getContentTypeForDay(day: number): ContentType | undefined {
  return dayContents.find((d) => d.day === day)?.contentType;
}
