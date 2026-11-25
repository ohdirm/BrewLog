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
import { Eye, EyeOff, CheckCircle2 } from 'lucide-react-native';
import { RootStackParamList } from '../types/navigation';
import { palette, spacing, layout, strokes } from '../theme/tokens';
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
      newErrors.username = 'Username wajib diisi';
    } else if (username.trim().length < 3) {
      newErrors.username = 'Minimal 3 karakter';
    }

    if (!password) {
      newErrors.password = 'Password wajib diisi';
    } else if (password.length < 6) {
      newErrors.password = 'Minimal 6 karakter';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Konfirmasi password wajib diisi';
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = 'Password tidak cocok';
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
      setErrors({ username: 'Username sudah terdaftar' });
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
      }, 1100);
    } else {
      setErrors({ general: 'Gagal menyimpan akun. Coba lagi.' });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <HeaderBar
        title="Buat Akun"
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
          <View style={styles.header}>
            <Typography variant="display" color="primary" style={styles.title}>
              Daftar
            </Typography>
            <Typography variant="callout" color="secondary">
              Buat akun lokal untuk menyimpan resep dan catatan seduhmu.
            </Typography>
          </View>

          {isSuccess ? (
            <View style={styles.successBanner}>
              <CheckCircle2 size={20} color={palette.statusSuccess} strokeWidth={2} />
              <View style={styles.successTextContainer}>
                <Typography variant="subheadlineMedium" color="success">
                  Akun berhasil dibuat
                </Typography>
                <Typography variant="caption" color="secondary">
                  Mengalihkan ke halaman masuk...
                </Typography>
              </View>
            </View>
          ) : null}

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
              placeholder="Minimal 3 karakter"
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
                  <Eye size={18} color={palette.textPrimary} strokeWidth={1.75} />
                )
              }
              onTrailingIconPress={() => setHidePassword(!hidePassword)}
            />

            <Input
              label="Konfirmasi Password"
              placeholder="Ulangi password"
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
                {isSuccess ? 'Berhasil' : 'Daftar'}
              </Button>
            </View>
          </View>

          <View style={styles.footer}>
            <Typography variant="callout" color="secondary">
              Sudah punya akun?{' '}
            </Typography>
            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}
            >
              <Typography variant="calloutMedium" color="accent">
                Masuk
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
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  title: {
    marginBottom: spacing.xs,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.statusSuccessBg,
    borderRadius: 10,
    borderWidth: strokes.hairline,
    borderColor: 'rgba(58, 102, 71, 0.25)',
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  successTextContainer: {
    marginLeft: spacing.sm,
    flex: 1,
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

export default RegisterScreen;
