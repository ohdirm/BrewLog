import { StyleSheet } from 'react-native';

/**
 * BrewLog Design Tokens — Editorial Coffee Journal
 * Warm paper canvas, deep espresso ink, understated hairline rules.
 */

export const palette = {
  // Canvas & Surfaces
  canvas: '#FAF8F5',          // Warm off-white paper
  surface: '#FFFFFF',         // Pure sheet for inputs / modals
  surfaceRaised: '#FFFFFF',
  surfaceSubdued: '#F1EDE6',  // Quiet warm stone fill
  surfaceHighlight: '#E6E0D6',

  // Borders & Dividers
  borderSubtle: 'rgba(26, 23, 21, 0.08)',
  borderStrong: 'rgba(26, 23, 21, 0.16)',
  divider: '#E8E3DA',

  // Typography & Content
  textPrimary: '#1A1715',     // Deep espresso ink
  textSecondary: '#686058',   // Warm charcoal
  textTertiary: '#9E958C',    // Stone gray
  textInverse: '#FAF8F5',

  // Brand Focal Accent (Single intentional accent + deep ink CTA)
  ink: '#1A1715',             // Primary action ink
  accent: '#B8532A',          // Burnt terracotta
  accentLight: '#F5EAE4',
  accentPressed: '#96411E',

  // Semantic Colors (Muted & natural)
  statusSuccess: '#3A6647',   // Muted sage green
  statusSuccessBg: '#ECF3EE',
  statusWarning: '#A86B24',
  statusWarningBg: '#F9F1E6',
  statusDanger: '#B03A35',    // Muted brick red
  statusDangerBg: '#F9ECEB',
  statusStar: '#C9821E',      // Warm amber
  statusStarBg: '#FCF5E8',
};

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
} as const;

export const radii = {
  xs: 4,
  sm: 6,
  md: 10,
  lg: 12,
  xl: 16,
  round: 9999,
} as const;

export const typography = {
  display: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '700' as const,
    letterSpacing: -0.7,
    color: palette.textPrimary,
  },
  h1: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
    color: palette.textPrimary,
  },
  h2: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '600' as const,
    letterSpacing: -0.3,
    color: palette.textPrimary,
  },
  h3: {
    fontSize: 17,
    lineHeight: 23,
    fontWeight: '600' as const,
    letterSpacing: -0.2,
    color: palette.textPrimary,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400' as const,
    color: palette.textPrimary,
  },
  bodyMedium: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500' as const,
    color: palette.textPrimary,
  },
  callout: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400' as const,
    color: palette.textSecondary,
  },
  calloutMedium: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500' as const,
    color: palette.textPrimary,
  },
  subheadline: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400' as const,
    color: palette.textSecondary,
  },
  subheadlineMedium: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600' as const,
    color: palette.textPrimary,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500' as const,
    color: palette.textTertiary,
  },
  overline: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600' as const,
    letterSpacing: 0.7,
    textTransform: 'uppercase' as const,
    color: palette.textSecondary,
  },
  tabular: {
    fontVariant: ['tabular-nums' as const],
  },
};

export const strokes = {
  hairline: StyleSheet.hairlineWidth,
  thin: 1,
  focused: 1.5,
};

export const layout = {
  screenPadding: spacing.xl, // 20px
  cardPadding: spacing.lg,
  inputHeight: 46,
  buttonHeight: 48,
  compactButtonHeight: 38,
  touchTargetMin: 44,
};
