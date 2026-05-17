import RNFS from 'react-native-fs';

const QA_LOG_PATH = `${RNFS.DocumentDirectoryPath}/navigation-qa.log`;

export const writeNavigationQaLog = (
  eventName: string,
  payload?: Record<string, unknown>,
) => {
  if (!__DEV__) return;

  const entry = {
    at: new Date().toISOString(),
    eventName,
    payload: payload ?? {},
  };

  RNFS.appendFile(QA_LOG_PATH, `${JSON.stringify(entry)}\n`, 'utf8').catch(
    () => {},
  );
};
