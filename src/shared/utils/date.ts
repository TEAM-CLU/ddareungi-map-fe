const isLeapYear = (year: number): boolean => {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
};

const getDaysInMonth = (year: number, month: number): number => {
  if (month === 2) {
    return isLeapYear(year) ? 29 : 28;
  }
  if ([4, 6, 9, 11].includes(month)) {
    return 30;
  }
  return 31;
};

export const createDayListInMonth = (
  year: number | null,
  month: number | null,
): { label: string; value: number }[] => {
  if (!year || !month) {
    return Array.from({ length: 31 }, (_, i) => {
      const day = i + 1;
      return { label: `${day}일`, value: day };
    });
  }

  const maxDays = getDaysInMonth(year, month);
  return Array.from({ length: maxDays }, (_, i) => {
    const day = i + 1;
    return { label: `${day}일`, value: day };
  });
};

const pad = (n: number, len: number) => {
  return String(n).padStart(len, '0');
};

export const formatBirthDateForDb = (date = new Date(), withColon = false) => {
  const y = date.getFullYear();
  const M = pad(date.getMonth() + 1, 2);
  const d = pad(date.getDate(), 2);
  const h = pad(date.getHours(), 2);
  const m = pad(date.getMinutes(), 2);
  const s = pad(date.getSeconds(), 2);
  const micros = pad(date.getMilliseconds() * 1000, 6);

  const offsetMin = -date.getTimezoneOffset();
  const sign = offsetMin >= 0 ? '+' : '-';
  const absMin = Math.abs(offsetMin);
  const oh = pad(Math.floor(absMin / 60), 2);
  const om = pad(absMin % 60, 2);
  const tz = withColon
    ? `${sign}${oh}:${om}`
    : `${sign}${oh}${om === '00' ? '' : `:${om}`}`;

  return `${y}-${M}-${d} ${h}:${m}:${s}.${micros}${
    withColon ? tz : `${sign}${oh}${om === '00' ? '' : `:${om}`}`
  }`;
};
