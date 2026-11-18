import { palette, spacing as tokenSpacing, typography as tokenTypography } from './tokens';

// Palet kopi backwards-compatible & refined
export const colors = {
  // Palet kopi
  primary: '#2B1E16',          // Espresso pekat
  primaryLight: '#4A3728',     // Coklat kopi medium
  accent: palette.accent,      // Terracotta roast
  background: palette.canvas,  // Krem lembut canvas
  card: palette.surface,       // Putih surface
  border: '#E8E3D8',           // Krem border halus
  
  // Teks
  text: palette.textPrimary,
  textMuted: palette.textSecondary,
  textLight: palette.textInverse,
  
  // Status
  success: palette.statusSuccess,
  danger: palette.statusDanger,
  favorite: palette.statusDanger,
  star: palette.statusStar,
  
  // Netral
  gray: '#C7C0B6',
  inputBg: palette.surfaceSubdued,
};

export const spacing = tokenSpacing;
export const typography = tokenTypography;
export * from './tokens';
