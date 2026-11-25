import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { palette, spacing, strokes } from '../../theme/tokens';
import { useTheme } from '../../context/ThemeContext';
import { Typography } from './Typography';
import { triggerHaptic } from '../../utils/haptics';

interface HeaderBarProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  showDivider?: boolean;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  title,
  subtitle,
  onBack,
  rightAction,
  showDivider = true,
}) => {
  const { palette: themePalette } = useTheme();
  const handleBack = () => {
    triggerHaptic();
    onBack?.();
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: themePalette.canvas },
        showDivider && [styles.divider, { borderBottomColor: themePalette.borderSubtle }],
      ]}
    >
      <View style={styles.leftContainer}>
        {onBack && (
          <TouchableOpacity
            onPress={handleBack}
            style={styles.backButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ArrowLeft size={22} color={themePalette.textPrimary} strokeWidth={2} />
          </TouchableOpacity>
        )}
        <View style={styles.titleContainer}>
          <Typography variant="h3" color="primary" numberOfLines={1}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="secondary" numberOfLines={1}>
              {subtitle}
            </Typography>
          )}
        </View>
      </View>

      {rightAction && <View style={styles.rightContainer}>{rightAction}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 56,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: palette.canvas,
  },
  divider: {
    borderBottomWidth: strokes.hairline,
    borderBottomColor: palette.borderSubtle,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    marginRight: spacing.md,
    padding: spacing.xs,
  },
  titleContainer: {
    flex: 1,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

