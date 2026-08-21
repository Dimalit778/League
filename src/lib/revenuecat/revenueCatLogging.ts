import Purchases, { LOG_LEVEL, type LogHandler } from "react-native-purchases";

const isNoisyOfflineLog = (message: string): boolean => {
  const lower = message.toLowerCase();

  return (
    lower.includes("networkerror") ||
    lower.includes("unable to resolve host") ||
    lower.includes("api.revenuecat.com") ||
    lower.includes("no address associated with hostname") ||
    lower.includes("error fetching customer data") ||
    lower.includes("network request failed")
  );
};

const defaultLogHandler: LogHandler = (logLevel, message) => {
  const prefix = `[RevenueCat] ${message}`;

  switch (logLevel) {
    case LOG_LEVEL.DEBUG:
      if (__DEV__) console.debug(prefix);
      break;
    case LOG_LEVEL.INFO:
      if (__DEV__) console.info(prefix);
      break;
    case LOG_LEVEL.WARN:
      console.warn(prefix);
      break;
    case LOG_LEVEL.ERROR:
      console.error(prefix);
      break;
    default:
      console.log(prefix);
  }
};

export const configureRevenueCatLogging = (): void => {
  Purchases.setLogHandler((logLevel, message) => {
    if (__DEV__ && isNoisyOfflineLog(message)) {
      return;
    }

    defaultLogHandler(logLevel, message);
  });

  Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.WARN : LOG_LEVEL.ERROR);
};
