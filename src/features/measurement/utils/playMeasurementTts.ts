import { enqueueTts } from '@/features/navigation/libs/ttsPlayer';
import { useVolumeStore } from '@/features/navigation/stores/useVolumeStore';
import {
  MEASUREMENT_AUDIO_URLS,
  MEASUREMENT_TTS_KEYS,
} from '../model/measurement.constants';

function getVolume(): number {
  return useVolumeStore.getState().systemVolume;
}

export const playMeasurementTts = {
  ridingStart: () => {
    enqueueTts(
      MEASUREMENT_TTS_KEYS.RIDING_START,
      MEASUREMENT_AUDIO_URLS.RIDING_START,
      getVolume(),
    );
  },
  ridingRestart: () => {
    enqueueTts(
      MEASUREMENT_TTS_KEYS.RIDING_RESTART,
      MEASUREMENT_AUDIO_URLS.RIDING_RESTART,
      getVolume(),
    );
  },
  tempStop: () => {
    enqueueTts(
      MEASUREMENT_TTS_KEYS.TEMP_STOP,
      MEASUREMENT_AUDIO_URLS.TEMP_STOP,
      getVolume(),
    );
  },
  arriveAimedDistance: () => {
    enqueueTts(
      MEASUREMENT_TTS_KEYS.ARRIVE_AIMED_DISTANCE,
      MEASUREMENT_AUDIO_URLS.ARRIVE_AIMED_DISTANCE,
      getVolume(),
    );
  },
  finish: () => {
    enqueueTts(
      MEASUREMENT_TTS_KEYS.FINISH,
      MEASUREMENT_AUDIO_URLS.FINISH,
      getVolume(),
    );
  },
};
