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
import { Eye, EyeOff, User as UserIcon, Lock, CheckCircle2 } from 'lucide-react-native';
import { RootStackParamList } from '../types/navigation';
import { palette, spacing, layout } from '../theme/tokens';
import { Typography, Input, Button, HeaderBar } from '../components/common';
import { saveUser, getUsers } from '../storage';
import { triggerHapticNotification } from '../utils/haptics';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Register'>;
};

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [hidePassword, setHidePassword] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<{
    username?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
  }>({});

  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    if (!username.trim()) {
      newErrors.username = 'Pilih username untuk akun Anda';
    } else if (username.trim().length < 3) {
      newErrors.username = 'Username minimal 3 karakter';
    }

    if (!password) {
      newErrors.password = 'Password tidak boleh kosong';
    } else if (password.length < 6) {
      newErrors.password = 'Gunakan minimal 6 karakter';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Ulangi password untuk konfirmasi';
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = 'Konfirmasi password tidak cocok';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    setErrors({});

    const users = await getUsers();
    if (users.some((u) => u.username.toLowerCase() === username.trim().toLowerCase())) {
      setErrors({ username: 'Username ini sudah digunakan barista lain.' });
      setIsSubmitting(false);
      return;
    }

    const newUser = {
      id: Date.now().toString(),
      username: username.trim(),
      password,
      createdAt: Date.now(),
    };

    const success = await saveUser(newUser);
    setIsSubmitting(false);

    if (success) {
      triggerHapticNotification();
      setIsSuccess(true);
      setTimeout(() => {
        navigation.navigate('Login');
      }, 1200);
    } else {
      setErrors({ general: 'Gagal membuat akun. Silakan coba lagi.' });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <HeaderBar
        title="Daftar Akun"
        subtitle="Langkah 1 dari 1"
        onBack={() => navigation.goBack()}
        showDivider={false}
      />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header Description */}
          <View style={styles.header}>
            <Typography variant="display" color="primary" style={styles.title}>
              Buat Profil
            </Typography>
            <Typography variant="callout" color="secondary" style={styles.subtitle}>
              Mulai koleksi catatan seduh, perbandingan rasio, dan resep kopi favorit Anda.
            </Typography>
          </View>

          {/* Success Banner */}
          {isSuccess ? (
            <View style={styles.successBanner}>
              <CheckCircle2 size={24} color={palette.statusSuccess} strokeWidth={2} />
              <View style={styles.successTextContainer}>
                <Typography variant="subheadlineMedium" color="success">
                  Akun Berhasil Dibuat
                </Typography>
                <Typography variant="caption" color="secondary">
                  Mengarahkan Anda ke halaman masuk...
                </Typography>
              </View>
            </View>
          ) : null}

          {/* General Error Banner */}
          {errors.general ? (
            <View style={styles.errorBanner}>
              <Typography variant="caption" color="danger">
                {errors.general}
              </Typography>
            </View>
          ) : null}

          {/* Inputs */}
          <View style={styles.formSection}>
            <Input
              label="Username"
              placeholder="Pilih nama pengguna unik"
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
              placeholder="Minimal 6 karakter"
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

            <Input
              label="Konfirmasi Password"
              placeholder="Ketik ulang password Anda"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                if (errors.confirmPassword)
                  setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
              }}
              secureTextEntry={hidePassword}
              error={errors.confirmPassword}
            />

            <View style={styles.submitContainer}>
              <Button
                variant="primary"
                onPress={handleRegister}
                loading={isSubmitting}
                disabled={isSuccess}
              >
                {isSuccess ? 'Berhasil Dibuat' : 'Selesaikan Pendaftaran'}
              </Button>
            </View>
          </View>

          {/* Login Link Footer */}
          <View style={styles.footer}>
            <Typography variant="callout" color="secondary">
              Sudah memiliki akun?{' '}
            </Typography>
            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}
            >
              <Typography variant="calloutMedium" color="accent">
                Masuk di sini
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
    paddingHorizontal: layout.screenPadding,
    paddingBottom: spacing.xxxl,
  },
  header: {
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  title: {
    marginBottom: spacing.xs,
  },
  subtitle: {
    lineHeight: 20,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.statusSuccessBg,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(63, 107, 77, 0.3)',
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  successTextContainer: {
    marginLeft: spacing.md,
    flex: 1,
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

export default RegisterScreen;
