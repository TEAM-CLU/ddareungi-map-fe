import { TW } from '@/shared/model/index.types';

let _tw: TW | null = null;

export const setTw = (twInstance: TW) => {
  _tw = twInstance;
};

export const tw: TW = (classNames: string) => {
  if (!_tw)
    throw new Error(
      'tw is not initialized. Wrap your app with TailwindProvider.',
    );
  return _tw(classNames);
};
