// A2A Circular Design Language — design tokens
// Source of truth: src/kb/A2A_DESIGN_SYSTEM.md

export const colors = {
  // Identity & primary
  azure500: '#0B9AEC', // A2A identity color
  azure600: '#0A8CD7', // primary interactive (buttons, links)
  azure50: '#E7F5FE',  // light azure tint for fills/badges
  blue500: '#016ABD',  // secondary brand accent
  blue800: '#013A68',  // dark backgrounds (nav, footers) + dark text

  // Greys
  grey800: '#636B71',
  grey300: '#DAE5EE',
  grey100: '#EEF3F7',

  // Semantic / status
  green: '#1AAA55',
  greenLight: '#E6F7ED',
  orange: '#FC9403',
  orangeLight: '#FFF4E3',
  red: '#DB3B21',
  redLight: '#FBEAE7',

  white: '#FFFFFF',
} as const;

// Life Sans weights: 450 Regular / 550 Medium / 650 SemiBold / 750 Bold
export const weight = {
  regular: 450,
  medium: 550,
  semibold: 650,
  bold: 750,
} as const;

// Standard animation: 300ms easeOutQuart
export const motion = {
  easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
  standard: '300ms cubic-bezier(0.25, 1, 0.5, 1)',
  suggestions: '400ms cubic-bezier(0.25, 1, 0.5, 1)',
} as const;

// Responsive spacing scale (Max/Xlg values)
export const spacing = {
  s01: 2, s02: 4, s03: 8, s04: 16, s05: 24, s06: 32,
  s07: 48, s08: 64, s09: 96,
} as const;

// Chart series palette (CDL primitives — azure/blue/status only)
export const chartColors = {
  budget: colors.blue500,
  rolling: colors.azure500,
  impegnato: colors.orange,
  actual: colors.green,
  series: [colors.azure500, colors.blue500, colors.green, colors.orange, colors.blue800, colors.grey800],
} as const;
