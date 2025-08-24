export const dateFormat = (date: string) => {
  const dateObj = new Date(date);
  return dateObj.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'numeric',
  });
};
export const timeFormat = (time: string) => {
  const timeObj = new Date(time);
  return timeObj.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};
