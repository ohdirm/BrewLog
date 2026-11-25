import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Modal,
  Pressable,
  Share,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Download, Upload, LogOut, CheckCircle2, Trash2 } from 'lucide-react-native';
import { RootStackParamList } from '../types/navigation';
import { palette as staticPalette, spacing, radii, strokes, layout, ThemeMode } from '../theme/tokens';
import { Typography, Input, Button, HeaderBar } from '../components/common';
import { useAuth } from '../context/AuthContext';
import { useRecipes } from '../context/RecipeContext';
import { useTheme } from '../context/ThemeContext';
import { updateUserPassword, deleteUserAccount } from '../storage';
import { triggerHaptic, triggerHapticNotification } from '../utils/haptics';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Profile'>;
};

const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { userId, username, logout } = useAuth();
  const { recipes, importRecipes } = useRecipes();
  const { palette, themeMode, setThemeMode } = useTheme();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // Import JSON state
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const totalCount = recipes.length;
  const triedCount = recipes.filter((r) => r.isTried).length;
  const favoriteCount = recipes.filter((r) => r.isFavorite).length;

  const handleExportJson = async () => {
    triggerHaptic();
    if (recipes.length === 0) {
      Alert.alert('Info', 'Belum ada resep untuk diekspor.');
      return;
    }

    try {
      const payload = JSON.stringify(
        {
          app: 'BrewLog',
          exportedAt: new Date().toISOString(),
          username,
          recipes,
        },
        null,
        2
      );
      await Share.share({
        title: 'Backup Resep BrewLog',
        message: payload,
      });
    } catch {
      Alert.alert('Gagal', 'Tidak dapat mengekspor data resep.');
    }
  };

  const handleImportJson = async () => {
    setImportError(null);
    const raw = importText.trim();
    if (!raw) {
      setImportError('Tempelkan teks JSON backup terlebih dahulu.');
      return;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      setImportError('Format JSON tidak valid. Pastikan seluruh teks tersalin utuh.');
      return;
    }

    const list = Array.isArray(parsed)
      ? parsed
      : parsed && typeof parsed === 'object' && Array.isArray((parsed as { recipes?: unknown }).recipes)
      ? (parsed as { recipes: unknown[] }).recipes
      : null;

    if (!list || list.length === 0) {
      setImportError('Data resep tidak ditemukan di dalam JSON.');
      return;
    }

    setIsImporting(true);
    const result = await importRecipes(list);
    setIsImporting(false);

    if (result.ok) {
      triggerHapticNotification();
      setImportText('');
      setShowImportModal(false);
      Alert.alert('Berhasil', `${result.added} resep berhasil diimpor ke katalog Anda.`);
    } else {
      setImportError('Tidak ada resep valid yang dapat diimpor.');
    }
  };

  const handleChangePassword = async () => {
    setPasswordError(null);
    setPasswordSuccess(false);

    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordError('Lengkapi seluruh kolom password.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('Password baru minimal 6 karakter.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Konfirmasi password baru tidak cocok.');
      return;
    }
    if (!userId) return;

    setIsUpdating(true);
    const res = await updateUserPassword(userId, oldPassword, newPassword);
    setIsUpdating(false);

    if (res.ok) {
      triggerHapticNotification();
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordSuccess(true);
    } else {
      setPasswordError(res.error || 'Gagal memperbarui password.');
    }
  };

  const handleLogout = async () => {
    setShowLogoutModal(false);
    await logout();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  const handleDeleteAccount = async () => {
    if (!userId) return;
    setIsDeletingAccount(true);
    const ok = await deleteUserAccount(userId);
    setIsDeletingAccount(false);
    setShowDeleteAccountModal(false);
    if (ok) {
      triggerHapticNotification();
      await logout();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } else {
      Alert.alert('Gagal', 'Tidak dapat menghapus akun.');
    }
  };

  const THEME_OPTIONS: { label: string; value: ThemeMode }[] = [
    { label: 'Sistem', value: 'system' },
    { label: 'Terang', value: 'light' },
    { label: 'Gelap', value: 'dark' },
  ];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.canvas }]} edges={['top', 'left', 'right']}>
      <HeaderBar title="Profil & Pengaturan" onBack={() => navigation.goBack()} />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Identity */}
          <View style={styles.identityBlock}>
            <Typography variant="overline" color="accent">
              Akun Lokal
            </Typography>
            <Typography variant="display" color="primary" style={styles.usernameTitle}>
              @{username || 'barista'}
            </Typography>
          </View>

          {/* Personal Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statCol}>
              <Typography variant="h1" color="primary" tabular>
                {totalCount}
              </Typography>
              <Typography variant="caption" color="secondary">
                Total Resep
              </Typography>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCol}>
              <Typography variant="h1" color="primary" tabular>
                {triedCount}
              </Typography>
              <Typography variant="caption" color="secondary">
                Sudah Dicoba
              </Typography>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCol}>
              <Typography variant="h1" color="primary" tabular>
                {favoriteCount}
              </Typography>
              <Typography variant="caption" color="secondary">
                Favorit
              </Typography>
            </View>
          </View>

          <View style={styles.sectionDivider} />

          {/* Theme Preference */}
          <View style={styles.section}>
            <Typography variant="overline" color="secondary" style={styles.sectionLabel}>
              Tema Tampilan
            </Typography>
            <View style={[styles.themeSegment, { backgroundColor: palette.surfaceSubdued }]}>
              {THEME_OPTIONS.map((opt) => {
                const isActive = themeMode === opt.value;
                return (
                  <Pressable
                    key={opt.value}
                    onPress={() => {
                      triggerHaptic();
                      setThemeMode(opt.value);
                    }}
                    style={[
                      styles.themeOption,
                      isActive && { backgroundColor: palette.surface },
                    ]}
                  >
                    <Typography
                      variant="caption"
                      style={[
                        styles.themeOptionText,
                        { color: isActive ? palette.textPrimary : palette.textSecondary },
                      ]}
                    >
                      {opt.label}
                    </Typography>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.sectionDivider} />

          {/* Backup Data */}
          <View style={styles.section}>
            <Typography variant="overline" color="secondary" style={styles.sectionLabel}>
              Cadangan Data
            </Typography>
            <Typography variant="callout" color="secondary" style={styles.sectionDesc}>
              Ekspor atau pulihkan seluruh resep beserta takaran dalam format JSON.
            </Typography>
            <View style={styles.backupActionsRow}>
              <View style={styles.backupBtnHalf}>
                <Button
                  variant="secondary"
                  size="compact"
                  icon={<Download size={16} color={palette.textPrimary} strokeWidth={1.75} />}
                  onPress={handleExportJson}
                >
                  Ekspor JSON
                </Button>
              </View>
              <View style={styles.backupBtnHalf}>
                <Button
                  variant="secondary"
                  size="compact"
                  icon={<Upload size={16} color={palette.textPrimary} strokeWidth={1.75} />}
                  onPress={() => {
                    triggerHaptic();
                    setImportError(null);
                    setShowImportModal(true);
                  }}
                >
                  Impor JSON
                </Button>
              </View>
            </View>
          </View>

          <View style={styles.sectionDivider} />

          {/* Change Password */}
          <View style={styles.section}>
            <Typography variant="overline" color="secondary" style={styles.sectionLabel}>
              Ubah Password
            </Typography>

            {passwordSuccess ? (
              <View style={styles.successBanner}>
                <CheckCircle2 size={18} color={palette.statusSuccess} strokeWidth={2} />
                <Typography variant="subheadlineMedium" color="success" style={styles.bannerText}>
                  Password berhasil diperbarui.
                </Typography>
              </View>
            ) : null}

            {passwordError ? (
              <View style={styles.errorBanner}>
                <Typography variant="subheadline" color="danger">
                  {passwordError}
                </Typography>
              </View>
            ) : null}

            <Input
              label="Password Lama"
              placeholder="Masukkan password saat ini"
              value={oldPassword}
              onChangeText={setOldPassword}
              secureTextEntry
            />
            <Input
              label="Password Baru"
              placeholder="Minimal 6 karakter"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />
            <Input
              label="Konfirmasi Password Baru"
              placeholder="Ulangi password baru"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />

            <Button
              variant="primary"
              size="compact"
              loading={isUpdating}
              onPress={handleChangePassword}
            >
              Simpan Password Baru
            </Button>
          </View>

          <View style={styles.sectionDivider} />

          {/* Logout & Delete Account */}
          <View style={styles.section}>
            <Button
              variant="secondary"
              icon={<LogOut size={16} color={palette.textPrimary} strokeWidth={1.75} />}
              onPress={() => {
                triggerHaptic();
                setShowLogoutModal(true);
              }}
            >
              Keluar dari Akun
            </Button>

            <View style={styles.deleteAccountSpacer}>
              <Button
                variant="destructive"
                icon={<Trash2 size={16} color={palette.statusDanger} strokeWidth={1.75} />}
                onPress={() => {
                  triggerHaptic();
                  setShowDeleteAccountModal(true);
                }}
              >
                Hapus Akun & Semua Data
              </Button>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Delete Account Confirmation Modal */}
      <Modal
        visible={showDeleteAccountModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteAccountModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowDeleteAccountModal(false)}>
          <Pressable
            style={[styles.modalCard, { backgroundColor: palette.surface }]}
            onPress={(e) => e.stopPropagation()}
          >
            <Typography variant="h2" color="primary" style={styles.modalTitle}>
              Hapus akun permanen?
            </Typography>
            <Typography variant="callout" color="secondary" style={styles.modalSubtitle}>
              Akun @{username} dan seluruh resep yang tersimpan akan dihapus permanen dari perangkat ini.
            </Typography>

            <View style={styles.modalActions}>
              <View style={styles.modalBtnHalf}>
                <Button variant="secondary" onPress={() => setShowDeleteAccountModal(false)}>
                  Batal
                </Button>
              </View>
              <View style={styles.modalBtnHalf}>
                <Button
                  variant="destructive"
                  loading={isDeletingAccount}
                  onPress={handleDeleteAccount}
                >
                  Hapus Permanen
                </Button>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Import JSON Modal */}
      <Modal
        visible={showImportModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowImportModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowImportModal(false)}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <Typography variant="h2" color="primary" style={styles.modalTitle}>
              Impor Resep (JSON)
            </Typography>
            <Typography variant="callout" color="secondary" style={styles.modalSubtitle}>
              Tempelkan isi file JSON hasil ekspor BrewLog di bawah ini.
            </Typography>

            <Input
              placeholder='{"recipes": [...]}'
              value={importText}
              onChangeText={(text) => {
                setImportText(text);
                if (importError) setImportError(null);
              }}
              multiline
              numberOfLines={5}
              error={importError || undefined}
              style={styles.importTextarea}
            />

            <View style={styles.modalActions}>
              <View style={styles.modalBtnHalf}>
                <Button variant="secondary" onPress={() => setShowImportModal(false)}>
                  Batal
                </Button>
              </View>
              <View style={styles.modalBtnHalf}>
                <Button variant="primary" loading={isImporting} onPress={handleImportJson}>
                  Impor
                </Button>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Logout Confirmation Modal */}
      <Modal
        visible={showLogoutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowLogoutModal(false)}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <Typography variant="h2" color="primary" style={styles.modalTitle}>
              Keluar dari akun?
            </Typography>
            <Typography variant="callout" color="secondary" style={styles.modalSubtitle}>
              Semua catatan resepmu tetap tersimpan di perangkat ini.
            </Typography>

            <View style={styles.modalActions}>
              <View style={styles.modalBtnHalf}>
                <Button variant="secondary" onPress={() => setShowLogoutModal(false)}>
                  Batal
                </Button>
              </View>
              <View style={styles.modalBtnHalf}>
                <Button variant="destructive" onPress={handleLogout}>
                  Keluar
                </Button>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

const palette = staticPalette;

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
    paddingTop: spacing.lg,
    paddingBottom: spacing.huge,
  },
  identityBlock: {
    marginBottom: spacing.xl,
  },
  usernameTitle: {
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderTopWidth: strokes.hairline,
    borderTopColor: palette.divider,
    marginBottom: spacing.xl,
  },
  statCol: {
    flex: 1,
  },
  statDivider: {
    width: strokes.hairline,
    height: 32,
    backgroundColor: palette.divider,
    marginHorizontal: spacing.md,
  },
  sectionDivider: {
    height: strokes.hairline,
    backgroundColor: palette.divider,
    marginBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionLabel: {
    marginBottom: spacing.sm,
  },
  sectionDesc: {
    marginBottom: spacing.md,
  },
  backupActionsRow: {
    flexDirection: 'row',
    marginHorizontal: -4,
  },
  backupBtnHalf: {
    flex: 1,
    marginHorizontal: 4,
  },
  importTextarea: {
    minHeight: 110,
    textAlignVertical: 'top',
    paddingTop: spacing.sm,
    fontSize: 13,
  },
  themeSegment: {
    flexDirection: 'row',
    borderRadius: radii.md,
    padding: 3,
  },
  themeOption: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.sm,
  },
  themeOptionText: {
    fontWeight: '600',
  },
  deleteAccountSpacer: {
    marginTop: spacing.sm,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.statusSuccessBg,
    borderRadius: 8,
    borderWidth: strokes.hairline,
    borderColor: 'rgba(58, 102, 71, 0.25)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  bannerText: {
    marginLeft: spacing.sm,
  },
  errorBanner: {
    backgroundColor: palette.statusDangerBg,
    borderRadius: 8,
    borderWidth: strokes.hairline,
    borderColor: 'rgba(176, 58, 53, 0.25)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(26, 23, 21, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: layout.screenPadding,
  },
  modalCard: {
    width: '100%',
    maxWidth: 330,
    backgroundColor: palette.surface,
    borderRadius: radii.lg,
    padding: spacing.xl,
    borderWidth: strokes.hairline,
    borderColor: palette.borderSubtle,
  },
  modalTitle: {
    marginBottom: spacing.xs,
  },
  modalSubtitle: {
    lineHeight: 20,
    marginBottom: spacing.xl,
  },
  modalActions: {
    flexDirection: 'row',
    width: '100%',
  },
  modalBtnHalf: {
    flex: 1,
    marginHorizontal: 4,
  },
});

export default ProfileScreen;

