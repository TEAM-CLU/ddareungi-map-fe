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

const pad = (n: number, width = 2) => String(n).padStart(width, '0');

export const formatBirthDate = (
  year: number,
  month: number,
  day: number,
): string => {
  const y = year;
  const M = pad(month, 2);
  const d = pad(day, 2);
  return `${y}-${M}-${d}`;
};
