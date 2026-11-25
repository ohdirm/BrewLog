import React, { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
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
    }, 1200);

    return () => clearTimeout(timer);
  }, [isLoggedIn, isLoading, navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.centerBlock}>
        <Typography variant="overline" color="accent" align="center" style={styles.overline}>
          Jurnal Kopi
        </Typography>
        <Typography variant="display" color="primary" align="center" style={styles.brandTitle}>
          BrewLog
        </Typography>
        <View style={styles.rule} />
        <Typography variant="subheadline" color="secondary" align="center">
          Catatan rasio & seduh harian
        </Typography>
      </View>

      <View style={styles.spinnerContainer}>
        <ActivityIndicator size="small" color={palette.textTertiary} />
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
  centerBlock: {
    alignItems: 'center',
  },
  overline: {
    marginBottom: spacing.xs,
  },
  brandTitle: {
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: -0.9,
  },
  rule: {
    width: 28,
    height: 1.5,
    backgroundColor: palette.accent,
    marginVertical: spacing.md,
  },
  spinnerContainer: {
    position: 'absolute',
    bottom: 52,
  },
});

export default SplashScreen;
