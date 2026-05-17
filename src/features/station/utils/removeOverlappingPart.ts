export const removeOverlappingPart = (base: string, keyword: string) => {
  if (base.includes(keyword)) {
    const replaced = base.replace(keyword, '');
    return replaced.replace(/\s+/g, ' ').trim();
  }
  return base;
};
