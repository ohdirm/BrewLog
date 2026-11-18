import React, { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Coffee } from 'lucide-react-native';
import { RootStackParamList } from '../types/navigation';
import { palette, spacing } from '../theme/tokens';
import { Typography } from '../components/common/Typography';
import { useAuth } from '../context/AuthContext';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Splash'>;
};

const SplashScreen: React.FC<Props> = ({ navigation }) => {
  const { isLoggedIn, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    const timer = setTimeout(() => {
      if (isLoggedIn) {
        navigation.replace('Home');
      } else {
        navigation.replace('Login');
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [isLoggedIn, isLoading, navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.logoBadge}>
        <Coffee size={44} color={palette.accent} strokeWidth={1.75} />
      </View>

      <Typography variant="display" color="primary" align="center" style={styles.brandTitle}>
        BrewLog
      </Typography>

      <Typography variant="callout" color="secondary" align="center" style={styles.tagline}>
        Catatan Seduh & Resep Kopi Personal
      </Typography>

      <View style={styles.spinnerContainer}>
        <ActivityIndicator size="small" color={palette.accent} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.canvas,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxl,
  },
  logoBadge: {
    width: 88,
    height: 88,
    borderRadius: 24,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  brandTitle: {
    marginBottom: spacing.xs,
    letterSpacing: -0.6,
  },
  tagline: {
    letterSpacing: -0.2,
  },
  spinnerContainer: {
    position: 'absolute',
    bottom: 56,
  },
});

export default SplashScreen;
