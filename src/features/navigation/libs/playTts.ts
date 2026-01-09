// features/navigation/utils/playTts.ts
import { enqueueTts } from './ttsPlayer';

export const playTts = (key: string, url: string, systemVolume: number) => {
  enqueueTts(key, url, systemVolume);
};
