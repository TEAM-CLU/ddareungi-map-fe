import { enqueueTts } from '@/features/navigation/libs/ttsPlayer';

export const playTts = (key: string, url: string, systemVolume: number) => {
  enqueueTts(key, url, systemVolume);
};
