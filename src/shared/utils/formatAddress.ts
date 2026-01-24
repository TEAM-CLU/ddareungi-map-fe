export const formatAddress = (gu: string, dong: string): string => {
  const city = '서울특별시';
  return `${city}-${gu}-${dong}`;
};
