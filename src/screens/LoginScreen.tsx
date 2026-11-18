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
import { Coffee, Eye, EyeOff, Lock, User as UserIcon } from 'lucide-react-native';
import { RootStackParamList } from '../types/navigation';
import { palette, spacing, layout } from '../theme/tokens';
import { Typography, Input, Button } from '../components/common';
import { useAuth } from '../context/AuthContext';
import { getUsers } from '../storage';
import { triggerHapticNotification } from '../utils/haptics';

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
    if (!username.trim()) newErrors.username = 'Masukkan username akun Anda';
    if (!password) newErrors.password = 'Masukkan password akun Anda';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    setErrors({});

    await new Promise((res) => setTimeout(res, 400));

    const users = await getUsers();
    const found = users.find(
      (u) => u.username.toLowerCase() === username.trim().toLowerCase() && u.password === password
    );

    if (!found) {
      triggerHapticNotification(false ? undefined : 2 as any); // Warning/Error
      setErrors({ general: 'Username atau password tidak cocok.' });
      setIsSubmitting(false);
      return;
    }

    triggerHapticNotification();
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
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.brandIconContainer}>
              <Coffee size={28} color={palette.accent} strokeWidth={2} />
            </View>
            <Typography variant="display" color="primary" style={styles.title}>
              Masuk
            </Typography>
            <Typography variant="callout" color="secondary" style={styles.subtitle}>
              Buka kembali koleksi racikan dan catatan seduh kopi Anda.
            </Typography>
          </View>

          {/* General Error Banner */}
          {errors.general && (
            <View style={styles.errorBanner}>
              <Typography variant="caption" color="danger">
                {errors.general}
              </Typography>
            </View>
          )}

          {/* Form */}
          <View style={styles.formSection}>
            <Input
              label="Username"
              placeholder="Contoh: barista_harian"
              value={username}
              onChangeText={(text) => {
                setUsername(text);
                if (errors.username) setErrors((prev) => ({ ...prev, username: undefined }));
              }}
              autoCapitalize="none"
              autoCorrect={false}
              error={errors.username}
              trailingIcon={<UserIcon size={18} color={palette.textTertiary} strokeWidth={1.75} />}
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
                  <Eye size={18} color={palette.accent} strokeWidth={1.75} />
                )
              }
              onTrailingIconPress={() => setHidePassword(!hidePassword)}
            />

            <View style={styles.submitContainer}>
              <Button
                variant="primary"
                onPress={handleLogin}
                loading={isSubmitting}
              >
                Masuk ke Akun
              </Button>
            </View>
          </View>

          {/* Register Link Footer */}
          <View style={styles.footer}>
            <Typography variant="callout" color="secondary">
              Belum memiliki akun?{' '}
            </Typography>
            <TouchableOpacity
              onPress={() => navigation.navigate('Register')}
              hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}
            >
              <Typography variant="calloutMedium" color="accent">
                Daftar Sekarang
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
  brandIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    marginBottom: spacing.xs,
  },
  subtitle: {
    lineHeight: 20,
  },
  errorBanner: {
    backgroundColor: palette.statusDangerBg,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(179, 57, 53, 0.25)',
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
    marginTop: spacing.md,
  },
});

export default LoginScreen;
