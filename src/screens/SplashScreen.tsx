import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Splash'>;
};

const SplashScreen: React.FC<Props> = ({ navigation }) => {
  const { isLoggedIn, isLoading } = useAuth();

  // Setelah cek sesi selesai, arahkan ke layar yang sesuai
  useEffect(() => {
    if (isLoading) return; // Tunggu pengecekan sesi selesai

    const timer = setTimeout(() => {
      if (isLoggedIn) {
        navigation.replace('Home');
      } else {
        navigation.replace('Login');
      }
    }, 2000); // Splash tampil minimal 2 detik

    return () => clearTimeout(timer);
  }, [isLoggedIn, isLoading, navigation]);

  return (
    <View style={styles.container}>
      {/* Ikon kopi sederhana dari emoji */}
      <Text style={styles.logo}>☕</Text>
      <Text style={styles.appName}>Catatan Resep Kopi</Text>
      <Text style={styles.tagline}>Racik favoritmu, catat selalu</Text>

      {/* Loading spinner */}
      <ActivityIndicator
        size="large"
        color={colors.accent}
        style={styles.spinner}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  logo: {
    fontSize: 72,
    marginBottom: 16,
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textLight,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 14,
    color: colors.accent,
    marginTop: 8,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  spinner: {
    marginTop: 48,
  },
});

export default SplashScreen;
