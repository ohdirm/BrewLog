import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Eye, EyeOff } from 'lucide-react-native';
import { RootStackParamList } from '../types/navigation';
import { palette, spacing, layout, strokes } from '../theme/tokens';
import { Typography, Input, Button } from '../components/common';
import { useAuth } from '../context/AuthContext';
import { getUsers } from '../storage';
import { triggerHapticNotification } from '../utils/haptics';
import * as Haptics from 'expo-haptics';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Login'>;
};

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { login } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [hidePassword, setHidePassword] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ username?: string; password?: string; general?: string }>({});

  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    if (!username.trim()) newErrors.username = 'Username wajib diisi';
    if (!password) newErrors.password = 'Password wajib diisi';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    setErrors({});

    await new Promise((res) => setTimeout(res, 350));

    const users = await getUsers();
    const found = users.find(
      (u) => u.username.toLowerCase() === username.trim().toLowerCase() && u.password === password
    );

    if (!found) {
      triggerHapticNotification(Haptics.NotificationFeedbackType.Error);
      setErrors({ general: 'Username atau password tidak sesuai.' });
      setIsSubmitting(false);
      return;
    }

    triggerHapticNotification(Haptics.NotificationFeedbackType.Success);
    await login(found.id, found.username);
    setIsSubmitting(false);
    navigation.replace('Home');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Typography variant="overline" color="accent" style={styles.overline}>
              BrewLog
            </Typography>
            <Typography variant="display" color="primary" style={styles.title}>
              Masuk
            </Typography>
            <Typography variant="callout" color="secondary">
              Lanjutkan catatan seduh dan koleksi resep kopimu.
            </Typography>
          </View>

          {errors.general ? (
            <View style={styles.errorBanner}>
              <Typography variant="subheadline" color="danger">
                {errors.general}
              </Typography>
            </View>
          ) : null}

          <View style={styles.formSection}>
            <Input
              label="Username"
              placeholder="Masukkan username"
              value={username}
              onChangeText={(text) => {
                setUsername(text);
                if (errors.username) setErrors((prev) => ({ ...prev, username: undefined }));
              }}
              autoCapitalize="none"
              autoCorrect={false}
              error={errors.username}
            />

            <Input
              label="Password"
              placeholder="Masukkan password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
              }}
              secureTextEntry={hidePassword}
              error={errors.password}
              trailingIcon={
                hidePassword ? (
                  <EyeOff size={18} color={palette.textTertiary} strokeWidth={1.75} />
                ) : (
                  <Eye size={18} color={palette.textPrimary} strokeWidth={1.75} />
                )
              }
              onTrailingIconPress={() => setHidePassword(!hidePassword)}
            />

            <View style={styles.submitContainer}>
              <Button variant="primary" onPress={handleLogin} loading={isSubmitting}>
                Masuk
              </Button>
            </View>
          </View>

          <View style={styles.footer}>
            <Typography variant="callout" color="secondary">
              Belum punya akun?{' '}
            </Typography>
            <TouchableOpacity
              onPress={() => navigation.navigate('Register')}
              hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}
            >
              <Typography variant="calloutMedium" color="accent">
                Daftar
              </Typography>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.canvas,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing.xxl,
  },
  header: {
    marginBottom: spacing.xxl,
  },
  overline: {
    marginBottom: spacing.xs,
  },
  title: {
    marginBottom: spacing.xs,
  },
  errorBanner: {
    backgroundColor: palette.statusDangerBg,
    borderRadius: 8,
    borderWidth: strokes.hairline,
    borderColor: 'rgba(176, 58, 53, 0.25)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.lg,
  },
  formSection: {
    marginBottom: spacing.xl,
  },
  submitContainer: {
    marginTop: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
});

export default LoginScreen;
