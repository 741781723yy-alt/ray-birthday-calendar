import { getDayContent } from '@/data/dayContents';
import TextMessage from './TextMessage';
import PhotoMessage from './PhotoMessage';
import VideoPlayer from './VideoPlayer';
import VoiceMessages from './VoiceMessages';
import CandleBlow from './CandleBlow';
import MemoryTimeline from './MemoryTimeline';
import Envelope from './Envelope';

interface ContentRouterProps {
  day: number;
}

export default function ContentRouter({ day }: ContentRouterProps) {
  const content = getDayContent(day);

  if (!content) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <p className="font-body text-[16px]" style={{ color: '#8899AA' }}>
          内容加载中...
        </p>
      </div>
    );
  }

  switch (content.contentType) {
    case 'text':
      return <TextMessage content={content} />;
    case 'photo':
      return <PhotoMessage content={content} />;
    case 'voice':
      return <VoiceMessages content={content} />;
    case 'video':
      return <VideoPlayer content={content} />;
    case 'candle':
      return <CandleBlow content={content} />;
    case 'timeline':
      return <MemoryTimeline content={content} />;
    case 'envelope':
      return <Envelope content={content} />;
    default:
      return (
        <div className="flex flex-col items-center justify-center py-10">
          <p className="font-body text-[16px]" style={{ color: '#8899AA' }}>
            未知的内容类型
          </p>
        </div>
      );
  }
}
