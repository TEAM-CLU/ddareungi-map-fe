/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],

  theme: {
    extend: {},
  },

  corePlugins: {
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
    // layout/flex
    { pattern: /^(flex|flex-(row|col)|flex-(1|auto|initial|none))$/ },
    {
      pattern:
        /^(items|justify|self|content)-(start|end|center|between|around|evenly|stretch)$/,
    },
    { pattern: /^(hidden|block)$/ },

    // spacing
    {
      pattern:
        /^(p|px|py|pt|pr|pb|pl|m|mx|my|mt|mr|mb|ml)-(0|0\.5|1|1\.5|2|2\.5|3|3\.5|4|5|6|8|10|12|16|20|24|32)$/,
    },
    { pattern: /^gap-(0|0\.5|1|1\.5|2|3|4|6|8)$/ },

    // size
    {
      pattern:
        /^(w|h|min-w|min-h|max-w|max-h)-(full|screen|\d+|1\/2|1\/3|2\/3|1\/4|3\/4)$/,
    },

    // position
    { pattern: /^(relative|absolute)$/ },
    { pattern: /^(top|right|bottom|left)-(\d+|0)$/ },

    // background colors
    {
      pattern:
        /^bg-(transparent|black|white|(zinc|gray|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(50|100|200|300|400|500|600|700|800|900))$/,
    },

    // text colors
    {
      pattern:
        /^text-(black|white|(zinc|gray|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(50|100|200|300|400|500|600|700|800|900))$/,
    },

    // opacity / zIndex
    { pattern: /^opacity-(0|5|10|20|25|30|40|50|60|70|75|80|90|95|100)$/ },
    { pattern: /^z-(0|10|20|30|40|50|auto)$/ },

    // border & radius
    { pattern: /^(border|border-(t|r|b|l))$/ },
    {
      pattern:
        /^border-(black|white|(zinc|gray|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(50|100|200|300|400|500|600|700|800|900))$/,
    },
    { pattern: /^rounded(-(none|sm|md|lg|xl|2xl|3xl|full))?$/ },

    // typography
    { pattern: /^text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl)$/ },
    {
      pattern:
        /^font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)$/,
    },
    { pattern: /^leading-(none|tight|snug|normal|relaxed|loose|\d+)$/ },
    { pattern: /^tracking-(tighter|tight|normal|wide|wider|widest)$/ },
    { pattern: /^(underline|line-through|no-underline)$/ },

    // aspect ratio
    { pattern: /^(aspect-square|aspect-video)$/ },
  ],
};
