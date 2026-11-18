import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { palette, spacing, radii } from '../../theme/tokens';
import { Typography } from './Typography';
import { Button } from './Button';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconCircle}>{icon}</View>
      <Typography variant="h2" color="primary" align="center" style={styles.title}>
        {title}
      </Typography>
      <Typography variant="callout" color="secondary" align="center" style={styles.description}>
        {description}
      </Typography>
      {actionLabel && onAction && (
        <View style={styles.actionContainer}>
          <Button variant="primary" size="compact" onPress={onAction}>
            {actionLabel}
          </Button>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: radii.round,
    backgroundColor: palette.surfaceSubdued,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    marginBottom: spacing.xs,
  },
  description: {
    maxWidth: 280,
    lineHeight: 20,
    marginBottom: spacing.xl,
  },
  actionContainer: {
    minWidth: 160,
  },
});

