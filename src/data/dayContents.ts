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
    date: '6\u67082\u65E5',
    contentType: 'photo',
    title: '\u6211\u4EEC\u7684\u7B2C\u4E00\u5F20\u5408\u5F71',
    photoCaption:
      "\u8FD8\u8BB0\u5F97\u8FD9\u5F20\u7167\u7247\u5417\uFF1F\u90A3\u662F\u6211\u4EEC\u7B2C\u4E00\u6B21\u4E00\u8D77\u51FA\u53BB\u73A9\u7684\u65F6\u5149\uFF0C\u9633\u5149\u6B63\u597D\uFF0C\u7B11\u5BB9\u707F\u70C2\u3002\u4ECE\u90A3\u4E00\u523B\u8D77\uFF0C\u6211\u5C31\u77E5\u9053\u6211\u4EEC\u4F1A\u6210\u4E3A\u6700\u597D\u7684\u670B\u53CB\u3002",
  },
  {
    day: 3,
    date: '6\u67083\u65E5',
    contentType: 'voice',
    title: '\u670B\u53CB\u4EEC\u7684\u795D\u798F',
    subtitle: '\u70B9\u51FB\u64AD\u653E\u6765\u81EA\u670B\u53CB\u4EEC\u7684\u795D\u798F',
    voiceMessages: [
      { id: 'v1', label: '\u751F\u65E5\u795D\u798F #1', sender: '\u5C0F\u660E', duration: '0:23', timestamp: '6\u67083\u65E5' },
      { id: 'v2', label: '\u6765\u81EA\u8FDC\u65B9\u7684\u795D\u798F', sender: '\u5C0F\u7EA2', duration: '0:18', timestamp: '6\u67083\u65E5' },
      { id: 'v3', label: '\u6084\u6084\u8BDD', sender: '\u963F\u534E', duration: '0:31', timestamp: '6\u67083\u65E5' },
    ],
  },
  {
    day: 4,
    date: '6\u67084\u65E5',
    contentType: 'text',
    title: '\u5199\u7ED9RAY\u7684\u4E00\u5C01\u4FE1',
    message:
      "\u4EB2\u7231\u7684RAY\uFF0C\n\n\u5728\u8FD9\u4E2A\u7279\u522B\u7684\u65E5\u5B50\u91CC\uFF0C\u60F3\u5BF9\u4F60\u8BF4\u5F88\u591A\u8BDD\u3002\u611F\u8C22\u4F60\u4E00\u76F4\u4EE5\u6765\u7684\u966A\u4F34\uFF0C\u611F\u8C22\u4F60\u5E26\u6765\u7684\u6BCF\u4E00\u4EFD\u6B22\u7B11\u3002\u4F60\u7684\u5584\u826F\u3001\u4F60\u7684\u771F\u8BDA\u3001\u4F60\u7684\u6E29\u6696\uFF0C\u8BA9\u8EAB\u8FB9\u6240\u6709\u4EBA\u90FD\u611F\u5230\u5E78\u798F\u3002\n\n\u613F\u65B0\u7684\u4E00\u5C81\u91CC\uFF0C\u6240\u6709\u7684\u7F8E\u597D\u90FD\u5982\u671F\u800C\u81F3\uFF0C\u6240\u6709\u7684\u68A6\u60F3\u90FD\u89E6\u624B\u53EF\u53CA\u3002\u751F\u65E5\u5FEB\u4E50\uFF01",
    signature: '\u2014\u2014 \u6C38\u8FDC\u652F\u6301\u4F60\u7684\u5C0F\u4F19\u4F34',
  },
  {
    day: 5,
    date: '6\u67085\u65E5',
    contentType: 'video',
    title: '\u751F\u65E5\u60CA\u559C\u89C6\u9891',
    videoTitle: '\u751F\u65E5\u60CA\u559C\u89C6\u9891',
    videoDescription: '\u670B\u53CB\u4EEC\u4E3A\u4F60\u7CBE\u5FC3\u51C6\u5907\u7684\u751F\u65E5\u795D\u798F\u96C6\u9526',
    videoDuration: '1:28',
  },
  {
    day: 6,
    date: '6\u67086\u65E5',
    contentType: 'candle',
    title: '\u8BB8\u4E2A\u613F\u5427\uFF01',
    subtitle: '\u5BF9\u7740\u624B\u673A\u5439\u6C14\uFF0C\u5439\u706D\u8721\u70DB',
    candleCount: 5,
  },
  {
    day: 7,
    date: '6\u67087\u65E5',
    contentType: 'timeline',
    title: '\u56DE\u5FC6\u65F6\u5149\u673A',
    subtitle: '\u9009\u62E9\u4E00\u4E2A\u65F6\u671F\uFF0C\u770B\u770B\u90A3\u65F6\u5019\u7684\u7167\u7247\u5427',
    timelineEras: [
      {
        id: 'childhood',
        emoji: '\uD83D\uDC76',
        name: '\u7AE5\u5E74\u65F6\u5149',
        photos: [
          { caption: '\u5C0F\u65F6\u5019\u7684\u4F60\uFF0C\u8D85\u7EA7\u53EF\u7231\uFF01', date: '2005\u5E74\u6625' },
          { caption: '\u7B2C\u4E00\u6B21\u8FC7\u751F\u65E5\uFF0C\u6EE1\u8138\u86CB\u7CD5', date: '2006\u5E74\u590F' },
        ],
        note: '\u7AE5\u5E74\u7684\u4F60\u5929\u771F\u70FD\u70C2\uFF0C\u6BCF\u4E00\u4E2A\u77AC\u95F4\u90FD\u95EA\u95EA\u53D1\u5149\u3002',
      },
      {
        id: 'school',
        emoji: '\uD83C\uDF92',
        name: '\u5B66\u751F\u65F6\u4EE3',
        photos: [
          { caption: '\u6BD5\u4E1A\u5178\u793C\u4E0A\u7684\u4F60\uFF0C\u95EA\u95EA\u53D1\u5149', date: '2018\u5E74\u590F' },
          { caption: '\u548C\u540C\u5B66\u4EEC\u7684\u5FEB\u4E50\u65F6\u5149', date: '2017\u5E74\u79CB' },
        ],
        note: '\u5B66\u751F\u65F6\u4EE3\u7684\u4F60\uFF0C\u52AA\u529B\u53C8\u4E0A\u8FDB\uFF0C\u670B\u53CB\u904D\u5929\u4E0B\u3002',
      },
      {
        id: 'present',
        emoji: '\uD83D\uDCBC',
        name: '\u73B0\u5728',
        photos: [
          { caption: '\u5DE5\u4F5C\u4E2D\u7684\u4F60\uFF0C\u4E13\u6CE8\u53C8\u5E05\u6C14', date: '2024\u5E74\u6625' },
          { caption: '\u65C5\u884C\u4E2D\u7684\u7F8E\u597D\u77AC\u95F4', date: '2024\u5E74\u51AC' },
        ],
        note: '\u73B0\u5728\u7684\u4F60\uFF0C\u6210\u719F\u7A33\u91CD\uFF0C\u5374\u4F9D\u7136\u4FDD\u6301\u7740\u90A3\u4EFD\u8D64\u5B50\u4E4B\u5FC3\u3002',
      },
      {
        id: 'future',
        emoji: '\uD83D\uDD2E',
        name: '\u672A\u6765\u5C55\u671B',
        photos: [
          { caption: '\u671F\u5F85\u4E0E\u4F60\u4E00\u8D77\u7684\u672A\u6765', date: '\u672A\u6765' },
          { caption: '\u613F\u6240\u6709\u68A6\u60F3\u90FD\u5B9E\u73B0', date: '\u672A\u6765' },
        ],
        note: '\u672A\u6765\u7684\u8DEF\u8FD8\u5F88\u957F\uFF0C\u6211\u4EEC\u4E00\u8D77\u8D70\u4E0B\u53BB\u5427\uFF01',
      },
    ],
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
