import { StyleSheet, Platform } from 'react-native';

/**
 * BrewLog Human-Crafted Design Tokens
 * Philosophy: Editorial Warm Minimalist / Artisanal Craft
 * 80/15/5 Color Discipline: Warm Stone Canvas + Crisp Surfaces + Terracotta Accent
 */

export const palette = {
  // Canvas & Surfaces (Warm organic neutrals)
  canvas: '#F7F5F0',          // Warm natural paper/linen background
  surface: '#FFFFFF',         // Crisp elevated sheet surface
  surfaceRaised: '#FFFFFF',   // Modals, sheets
  surfaceSubdued: '#EFECE4',  // Input containers, category chips, subtle fills
  surfaceHighlight: '#E8E3D8',

  // Borders & Dividers
  borderSubtle: 'rgba(38, 28, 22, 0.08)',
  borderStrong: 'rgba(38, 28, 22, 0.16)',
  divider: 'rgba(38, 28, 22, 0.06)',

  // Typography & Content
  textPrimary: '#1E1815',     // Deep roasted espresso
  textSecondary: '#665C54',   // Muted roasted almond
  textTertiary: '#9E948B',    // Soft stone / placeholder
  textInverse: '#FFFFFF',     // Clean white on dark badges/buttons

  // 5% Focal Accent (Terracotta Roast)
  accent: '#BC5D2E',          // Rich earthy terracotta
  accentLight: '#F7EDE6',     // Tinted pill/active background
  accentPressed: '#9E4A20',   // Darker press state

  // Semantic Colors (Desaturated, human-friendly tones)
  statusSuccess: '#3F6B4D',   // Matcha forest
  statusSuccessBg: '#EDF4EE',
  statusWarning: '#B8782E',   // Roasted caramel
  statusWarningBg: '#FAF3EA',
  statusDanger: '#B33935',    // Raw brick red
  statusDangerBg: '#FAEDED',
  statusStar: '#D97706',      // Warm Ochre gold
  statusStarBg: '#FEF8EB',
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
  lg: 14,
  xl: 18,
  round: 9999,
} as const;

export const typography = {
  // Display & Headers
  display: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '700' as const,
    letterSpacing: -0.8,
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
    lineHeight: 22,
    fontWeight: '600' as const,
    letterSpacing: -0.2,
    color: palette.textPrimary,
  },
  
  // Body copy
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

  // Supporting & Badges
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
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '500' as const,
    letterSpacing: 0.3,
    color: palette.textTertiary,
  },
  overline: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '700' as const,
    letterSpacing: 0.8,
    textTransform: 'uppercase' as const,
    color: palette.textSecondary,
  },

  // Numbers & Metrics (always tabular)
  tabular: {
    fontVariant: ['tabular-nums' as const],
  },
};

export const strokes = {
  hairline: StyleSheet.hairlineWidth,
  thin: 1,
  focused: 2,
};

export const layout = {
  screenPadding: spacing.xl, // 20px comfortable gutter
  cardPadding: spacing.lg,   // 16px
  inputHeight: 48,
  buttonHeight: 48,
  compactButtonHeight: 36,
  touchTargetMin: 44,
};

