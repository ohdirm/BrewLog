import React, { useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { palette, radii, layout, typography } from '../../theme/tokens';
import { triggerHaptic } from '../../utils/haptics';

export type ButtonVariant = 'primary' | 'secondary' | 'destructive' | 'ghost';
export type ButtonSize = 'default' | 'compact' | 'sm';

interface ButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  onPress,
  children,
  variant = 'primary',
  size = 'default',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = true,
  style,
  textStyle,
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (disabled || loading) return;
    triggerHaptic();
    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 40,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 40,
      bounciness: 6,
    }).start();
  };

  const isPrimary = variant === 'primary';
  const isSecondary = variant === 'secondary';
  const isDestructive = variant === 'destructive';
  const isGhost = variant === 'ghost';

  return (
    <Animated.View style={[{ transform: [{ scale }] }, fullWidth && styles.fullWidth]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        style={[
          styles.base,
          size === 'default' && styles.sizeDefault,
          size === 'compact' && styles.sizeCompact,
          size === 'sm' && styles.sizeSm,
          isPrimary && styles.primary,
          isSecondary && styles.secondary,
          isDestructive && styles.destructive,
          isGhost && styles.ghost,
          (disabled || loading) && styles.disabled,
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator
            size="small"
            color={isPrimary || isDestructive ? palette.textInverse : palette.accent}
          />
        ) : (
          <View style={styles.contentRow}>
            {icon && iconPosition === 'left' && <View style={styles.iconLeft}>{icon}</View>}
            <Animated.Text
              style={[
                styles.textBase,
                size === 'default' && styles.textDefault,
                size === 'compact' && styles.textCompact,
                size === 'sm' && styles.textSm,
                isPrimary && styles.textPrimary,
                isSecondary && styles.textSecondary,
                isDestructive && styles.textDestructive,
                isGhost && styles.textGhost,
                textStyle,
              ]}
            >
              {children}
            </Animated.Text>
            {icon && iconPosition === 'right' && <View style={styles.iconRight}>{icon}</View>}
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  fullWidth: {
    width: '100%',
  },
  base: {
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  sizeDefault: {
    height: layout.buttonHeight,
    paddingHorizontal: 20,
  },
  sizeCompact: {
    height: layout.compactButtonHeight,
    paddingHorizontal: 14,
  },
  sizeSm: {
    height: 30,
    paddingHorizontal: 10,
    borderRadius: radii.sm,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
  // Variants
  primary: {
    backgroundColor: palette.accent,
  },
  secondary: {
    backgroundColor: palette.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.borderStrong,
  },
  destructive: {
    backgroundColor: palette.statusDangerBg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.statusDanger,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.5,
  },
  // Text Styles
  textBase: {
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  textDefault: {
    fontSize: 15,
  },
  textCompact: {
    fontSize: 13,
  },
  textSm: {
    fontSize: 12,
  },
  textPrimary: {
    color: palette.textInverse,
  },
  textSecondary: {
    color: palette.textPrimary,
  },
  textDestructive: {
    color: palette.statusDanger,
  },
  textGhost: {
    color: palette.textSecondary,
  },
});

