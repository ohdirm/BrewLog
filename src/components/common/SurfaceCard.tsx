import React, { useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  ViewStyle,
  View,
} from 'react-native';
import { palette, radii, spacing, strokes } from '../../theme/tokens';
import { triggerHaptic } from '../../utils/haptics';

interface SurfaceCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle | ViewStyle[];
  subdued?: boolean;
  highlighted?: boolean;
}

export const SurfaceCard: React.FC<SurfaceCardProps> = ({
  children,
  onPress,
  style,
  subdued = false,
  highlighted = false,
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (!onPress) return;
    triggerHaptic();
    Animated.spring(scale, {
      toValue: 0.985,
      useNativeDriver: true,
      speed: 40,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    if (!onPress) return;
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 40,
      bounciness: 6,
    }).start();
  };

  const cardStyle = [
    styles.card,
    subdued && styles.subdued,
    highlighted && styles.highlighted,
    style,
  ];

  if (!onPress) {
    return <View style={cardStyle}>{children}</View>;
  }

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={cardStyle}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    borderWidth: strokes.hairline,
    borderColor: palette.borderSubtle,
  },
  subdued: {
    backgroundColor: palette.surfaceSubdued,
    borderColor: 'transparent',
  },
  highlighted: {
    borderColor: palette.accent,
    borderWidth: 1.5,
  },
});

