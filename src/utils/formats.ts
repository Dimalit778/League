export const dateFormat = (date: string) => {
  const dateObj = new Date(date);
  return dateObj.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'numeric',
  });
};
export const timeFormat = (time: string) => {
  const timeObj = new Date(time);
  return timeObj.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};
// Advanced: Get user's timezone and format accordingly
export const timeFormatTimezone = (time: string) => {
  const timeObj = new Date(time);
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return timeObj.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: userTimezone,
  });
};
