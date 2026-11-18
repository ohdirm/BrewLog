import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { palette, radii, spacing } from '../../theme/tokens';
import { Typography } from './Typography';

export type BadgeTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'star';

interface BadgeProps {
  label: string;
  tone?: BadgeTone;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

const toneMap: Record<BadgeTone, { bg: string; text: string; border: string }> = {
  neutral: {
    bg: palette.surfaceSubdued,
    text: palette.textSecondary,
    border: 'transparent',
  },
  accent: {
    bg: palette.accentLight,
    text: palette.accent,
    border: 'rgba(188, 93, 46, 0.2)',
  },
  success: {
    bg: palette.statusSuccessBg,
    text: palette.statusSuccess,
    border: 'rgba(63, 107, 77, 0.2)',
  },
  warning: {
    bg: palette.statusWarningBg,
    text: palette.statusWarning,
    border: 'rgba(184, 120, 46, 0.2)',
  },
  danger: {
    bg: palette.statusDangerBg,
    text: palette.statusDanger,
    border: 'rgba(179, 57, 53, 0.2)',
  },
  star: {
    bg: palette.statusStarBg,
    text: palette.statusStar,
    border: 'rgba(217, 119, 6, 0.25)',
  },
};

export const Badge: React.FC<BadgeProps> = ({ label, tone = 'neutral', icon, style }) => {
  const currentTone = toneMap[tone];

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: currentTone.bg,
          borderColor: currentTone.border,
        },
        style,
      ]}
    >
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <Typography
        variant="caption"
        style={[styles.text, { color: currentTone.text }]}
      >
        {label}
      </Typography>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.round,
    borderWidth: StyleSheet.hairlineWidth,
    alignSelf: 'flex-start',
  },
  iconContainer: {
    marginRight: 4,
  },
  text: {
    fontWeight: '600',
    letterSpacing: 0.1,
  },
});

