const dateFormat = (date: string) => {
  const dateObj = new Date(date);
  return dateObj.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'numeric',
  });
};
const dayNameFormatLong = (date: string) => {
  const dateObj = new Date(date);
  return dateObj.toLocaleDateString('en-GB', {
    weekday: 'long',
  });
};
const dayNameFormatShort = (date: string) => {
  const dateObj = new Date(date);
  return dateObj.toLocaleDateString('en-GB', {
    weekday: 'short',
  });
};

const timeFormatTimezone = (time: string) => {
  const timeObj = new Date(time);
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return timeObj.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: userTimezone,
  });
};
const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatDateRange = (startDate: string, endDate: string) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const startMonth = start.toLocaleDateString('en-GB', { month: 'short' });
  const startDay = start.getDate();
  const endMonth = end.toLocaleDateString('en-GB', { month: 'short' });
  const endDay = end.getDate();

  if (startMonth === endMonth) {
    return `${startMonth} ${startDay} - ${endDay}`;
  }
  return `${startMonth} ${startDay} - ${endMonth} ${endDay}`;
};

const formatMatchdayDate = (date: string) => {
  const dateObj = new Date(date);
  const day = dateObj.toLocaleDateString('en-GB', { weekday: 'short' }).toUpperCase();
  const dayNum = dateObj.getDate();
  const month = dateObj.getMonth() + 1;
  return `${day}, ${dayNum}/${month}`;
};

const formatNameCapitalize = (name: string | null | undefined): string => {
  if (!name) return '';
  return name
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

export {
  dateFormat,
  dayNameFormatLong,
  dayNameFormatShort,
  formatDateRange,
  formatMatchdayDate,
  formatNameCapitalize,
  formatTime,
  timeFormatTimezone,
};
