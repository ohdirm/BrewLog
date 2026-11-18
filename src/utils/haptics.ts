import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export const triggerHaptic = (style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) => {
  if (Platform.OS === 'web') return;
  try {
    Haptics.impactAsync(style);
  } catch {
    // Graceful fallback on devices without haptic engine
  }
};

export const triggerHapticNotification = (type: Haptics.NotificationFeedbackType = Haptics.NotificationFeedbackType.Success) => {
  if (Platform.OS === 'web') return;
  try {
    Haptics.notificationAsync(type);
  } catch {
    // Graceful fallback
  }
};

