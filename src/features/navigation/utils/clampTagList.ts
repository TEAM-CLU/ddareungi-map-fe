// 태그 최대 3개 제한
export const clampTagList = (tags: string[]) =>
  tags
    .map(t => t.trim())
    .filter(Boolean)
    .slice(0, 3);
