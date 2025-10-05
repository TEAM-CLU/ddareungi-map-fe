// tailwind.config.js
const unsupported = require('tailwind-rn/unsupported-core-plugins');
import plugin from 'tailwindcss/plugin';

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './tailwind.css'],

  theme: {
    fontSize: {
      xs: [12, { lineHeight: 16 }],
      sm: [14, { lineHeight: 20 }],
      base: [16, { lineHeight: 24 }],
      lg: [18, { lineHeight: 28 }],
      xl: [20, { lineHeight: 28 }],
      '2xl': [24, { lineHeight: 32 }],
      '3xl': [30, { lineHeight: 36 }],
      '4xl': [36, { lineHeight: 40 }],
      '5xl': [48, { lineHeight: 52 }],
      '6xl': [60, { lineHeight: 64 }],
    },

    lineHeight: {
      none: 0,
      tight: 16,
      snug: 20,
      normal: 24,
      relaxed: 28,
      loose: 32,
      4: 16,
      5: 20,
      6: 24,
      7: 28,
      8: 32,
    },

    zIndex: {
      0: 0,
      10: 10,
      20: 20,
      30: 30,
      40: 40,
      50: 50,
    },

    extend: {
      colors: {
        brand: {
          primary: '#01DA86',
        },

        'on-surface': {
          primary: '#414548',
          secondary: '#FFFFFF',
          tertiary: '#979797',
          quaternary: '#77838F',
          'input-label': '#373E44',
          placeholder: '#A7A7A7',
          disabled: '#9CA3AF',
        },

        surface: {
          primary: '#FFFFFF',
          secondary: '#F9F9F9',
          disabled: '#E5E7EB',
        },

        line: {
          default: '#A7A7A7',
        },

        button: {
          container: '#77838F',
        },

        icon: {
          container: {
            primary: '#77838F',
            secondary: '#FFFFFF',
          },
          content: {
            primary: '#FFFFFF',
            secondary: '#77838F',
          },
        },

        decorative: {
          default: '#D9D9D9',
        },

        marker: {
          destination: '#006AFF',
          origin: '#FF0000',
        },

        error: '#ef4444',
        disabled: '##E5E7EB',
      },

      fontFamily: {
        primary: {
          400: 'Pretendard-Regular',
          500: 'Pretendard-Medium',
          600: 'Pretendard-SemiBold',
          700: 'Pretendard-Bold',
        },
        secondary: 'system-ui',

        'p-thin': 'Pretendard-Thin',
        'p-extlight': 'Pretendard-ExtraLight',
        'p-light': 'Pretendard-Light',
        'p-regular': 'Pretendard-Regular',
        'p-medium': 'Pretendard-Medium',
        'p-semibold': 'Pretendard-SemiBold',
        'p-bold': 'Pretendard-Bold',
        'p-extbold': 'Pretendard-ExtraBold',
        'p-black': 'Pretendard-Black',
      },
    },
  },

  plugins: [
    plugin(({ addUtilities }) => {
      addUtilities(
        {
          /* === GAP (row) — margin 기반 === */
          '.g-x-2': { flexDirection: 'row', marginLeft: -8, marginRight: -8 },
          '.g-x-3': { flexDirection: 'row', marginLeft: -12, marginRight: -12 },
          '.g-x-4': { flexDirection: 'row', marginLeft: -16, marginRight: -16 },
          '.g-x-6': { flexDirection: 'row', marginLeft: -24, marginRight: -24 },
          '.g-x-8': { flexDirection: 'row', marginLeft: -32, marginRight: -32 },

          '.g-item-x-2': { marginLeft: 8, marginRight: 8 },
          '.g-item-x-3': { marginLeft: 12, marginRight: 12 },
          '.g-item-x-4': { marginLeft: 16, marginRight: 16 },
          '.g-item-x-6': { marginLeft: 24, marginRight: 24 },
          '.g-item-x-8': { marginLeft: 32, marginRight: 32 },

          /* === GAP (column) — margin 기반 === */
          '.g-y-2': {
            flexDirection: 'column',
            marginTop: -8,
            marginBottom: -8,
          },
          '.g-y-3': {
            flexDirection: 'column',
            marginTop: -12,
            marginBottom: -12,
          },
          '.g-y-4': {
            flexDirection: 'column',
            marginTop: -16,
            marginBottom: -16,
          },
          '.g-y-6': {
            flexDirection: 'column',
            marginTop: -24,
            marginBottom: -24,
          },
          '.g-y-8': {
            flexDirection: 'column',
            marginTop: -32,
            marginBottom: -32,
          },

          '.g-item-y-2': { marginTop: 8, marginBottom: 8 },
          '.g-item-y-3': { marginTop: 12, marginBottom: 12 },
          '.g-item-y-4': { marginTop: 16, marginBottom: 16 },
          '.g-item-y-6': { marginTop: 24, marginBottom: 24 },
          '.g-item-y-8': { marginTop: 32, marginBottom: 32 },

          /* === SHADOWS === */
          '.shadow-sm': {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 1,
          },
          '.shadow-md': {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.15,
            shadowRadius: 4,
            elevation: 3,
          },
          '.shadow-lg': {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.2,
            shadowRadius: 6,
            elevation: 6,
          },
          '.shadow-xl': {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.25,
            shadowRadius: 12,
            elevation: 10,
          },
          '.shadow-2xl': {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 15 },
            shadowOpacity: 0.3,
            shadowRadius: 20,
            elevation: 15,
          },
        },
        ['responsive'],
      );
    }),
  ],

  corePlugins: {
    ...unsupported,
    preflight: false,
    container: false,
    columns: false,
    ringWidth: false,
    ringColor: false,
    ringOffsetWidth: false,
    ringOffsetColor: false,
    space: false,
    divideWidth: false,
    divideColor: false,
    divideOpacity: false,
    divideStyle: false,
    fontFamily: false,
    gridTemplateColumns: false,
    gridColumn: false,
    gridColumnStart: false,
    gridColumnEnd: false,
    gridTemplateRows: false,
    gridRow: false,
    gridRowStart: false,
    gridRowEnd: false,
    overscrollBehavior: false,
    scrollSnapType: false,
    scrollBehavior: false,
    backdropFilter: false,
    backdropBlur: false,
    textDecorationStyle: false,
  },

  safelist: [
    // Layout / Flex
    { pattern: /^(flex|flex-(row|col)|flex-(1|auto|initial|none))$/ },
    {
      pattern:
        /^(items|justify|content)-(start|end|center|between|around|evenly|stretch)$/,
    },
    // display
    { pattern: /^hidden$/ },

    // Spacing
    {
      pattern:
        /^(p|px|py|pt|pr|pb|pl|m|mx|my|mt|mr|mb|ml)-(0|0\.5|1|1\.5|2|2\.5|3|3\.5|4|5|6|8|10|12|16|20|24|32)$/,
    },

    // Sizing
    {
      pattern:
        /^(w|h|min-w|min-h|max-w|max-h)-(full|screen|\d+|1\/2|1\/3|2\/3|1\/4|3\/4)$/,
    },

    // Position
    { pattern: /^(relative|absolute)$/ },
    { pattern: /^(top|right|bottom|left)-(\d+|0)$/ },

    // Background colors
    {
      pattern:
        /^bg-(transparent|black|white|(zinc|gray|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(50|100|200|300|400|500|600|700|800|900))$/,
    },

    // Text colors
    {
      pattern:
        /^text-(black|white|(zinc|gray|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(50|100|200|300|400|500|600|700|800|900))$/,
    },

    // Text align
    { pattern: /^text-(left|center|right|justify)$/ },

    // Opacity / zIndex
    { pattern: /^opacity-(0|5|10|20|25|30|40|50|60|70|75|80|90|95|100)$/ },
    { pattern: /^z-(0|10|20|30|40|50)$/ },

    // Borders & radius
    { pattern: /^(border|border-(t|r|b|l))$/ },
    {
      pattern:
        /^border-(black|white|(zinc|gray|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(50|100|200|300|400|500|600|700|800|900))$/,
    },
    { pattern: /^rounded(-(none|sm|md|lg|xl|2xl|3xl|full))?$/ },

    // Typograph
    { pattern: /^text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl)$/ },
    {
      pattern:
        /^font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)$/,
    },
    { pattern: /^leading-(none|tight|snug|normal|relaxed|loose|4|5|6|7|8)$/ },
    { pattern: /^tracking-(tighter|tight|normal|wide|wider|widest)$/ },
    { pattern: /^(underline|line-through|no-underline)$/ },

    // Overflow
    { pattern: /^overflow-(visible|hidden)$/ },
  ],
};
