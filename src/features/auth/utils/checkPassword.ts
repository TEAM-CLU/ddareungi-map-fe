export const checkPassword = (pwd: string): boolean => {
  if (pwd.length < 8) return false;

  const specialCharRegex = /[^A-Za-z0-9]/;
  if (!specialCharRegex.test(pwd)) return false;

  return true;
};
