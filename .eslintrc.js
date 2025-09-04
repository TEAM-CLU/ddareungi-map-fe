// .eslintrc.js
module.exports = {
  root: true,
  extends: ['@react-native', 'plugin:react-hooks/recommended'],
  plugins: ['react-hooks'],
  rules: {
    'react-native/no-inline-styles': 'off', // ✅ 인라인 스타일 규칙 끔
  },
};
