import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { Recipe, User } from '../types';
import { ThemeMode } from '../theme/tokens';

const STORAGE_KEYS = {
  USERS: '@app_coffee_users',
  CURRENT_USER: '@app_coffee_current_user',
  RECIPES_PREFIX: '@app_coffee_recipes_',
  THEME_MODE: '@app_coffee_theme_mode',
};

// ==================== PASSWORD HASHING ====================

export const hashPassword = async (raw: string): Promise<string> => {
  const digest = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    `brewlog_v1_${raw}`
  );
  return `sha256:${digest}`;
};

export const verifyPassword = async (input: string, stored: string): Promise<boolean> => {
  if (stored.startsWith('sha256:')) {
    const hashed = await hashPassword(input);
    return hashed === stored;
  }
  // Kompatibilitas akun lama sebelum hashing
  return input === stored;
};

// ==================== THEME STORAGE ====================

export const getThemePreference = async (): Promise<ThemeMode> => {
  try {
    const val = await AsyncStorage.getItem(STORAGE_KEYS.THEME_MODE);
    if (val === 'light' || val === 'dark' || val === 'system') return val;
    return 'system';
  } catch {
    return 'system';
  }
};

export const setThemePreference = async (mode: ThemeMode): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.THEME_MODE, mode);
  } catch (error) {
    console.error('Error menyimpan tema:', error);
  }
};

// ==================== AUTH / USER STORAGE ====================

// Ambil seluruh user yang terdaftar
export const getUsers = async (): Promise<User[]> => {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEYS.USERS);
    return json ? JSON.parse(json) : [];
  } catch (error) {
    console.error('Error membaca user:', error);
    return [];
  }
};

// Simpan user baru (register)
export const saveUser = async (user: User): Promise<boolean> => {
  try {
    const users = await getUsers();
    users.push(user);
    await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    return true;
  } catch (error) {
    console.error('Error menyimpan user:', error);
    return false;
  }
};

// Simpan sesi user login
export const setCurrentUser = async (user: { id: string; username: string } | null): Promise<void> => {
  try {
    if (user) {
      await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  } catch (error) {
    console.error('Error menyimpan sesi user:', error);
  }
};

// Ambil sesi user saat ini
export const getCurrentUser = async (): Promise<{ id: string; username: string } | null> => {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return json ? JSON.parse(json) : null;
  } catch (error) {
    console.error('Error mengambil sesi user:', error);
    return null;
  }
};

// Ubah password user
export const updateUserPassword = async (
  userId: string,
  oldPassword: string,
  newPassword: string
): Promise<{ ok: boolean; error?: string }> => {
  try {
    const users = await getUsers();
    const index = users.findIndex((u) => u.id === userId);
    if (index === -1) {
      return { ok: false, error: 'Akun tidak ditemukan' };
    }
    const isMatch = await verifyPassword(oldPassword, users[index].password);
    if (!isMatch) {
      return { ok: false, error: 'Password lama tidak sesuai' };
    }
    const hashedNew = await hashPassword(newPassword);
    users[index] = { ...users[index], password: hashedNew };
    await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    return { ok: true };
  } catch (error) {
    console.error('Error mengubah password:', error);
    return { ok: false, error: 'Gagal menyimpan password baru' };
  }
};

// Hapus akun beserta seluruh data resepnya
export const deleteUserAccount = async (userId: string): Promise<boolean> => {
  try {
    const users = await getUsers();
    const filteredUsers = users.filter((u) => u.id !== userId);
    await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(filteredUsers));
    await AsyncStorage.removeItem(`${STORAGE_KEYS.RECIPES_PREFIX}${userId}`);
    await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    return true;
  } catch (error) {
    console.error('Error menghapus akun:', error);
    return false;
  }
};

// ==================== RECIPE STORAGE ====================

// Ambil daftar resep milik user tertentu
export const getRecipesByUser = async (userId: string): Promise<Recipe[]> => {
  try {
    const key = `${STORAGE_KEYS.RECIPES_PREFIX}${userId}`;
    const json = await AsyncStorage.getItem(key);
    return json ? JSON.parse(json) : [];
  } catch (error) {
    console.error('Error mengambil resep:', error);
    return [];
  }
};

// Simpan seluruh daftar resep milik user
export const saveRecipesByUser = async (userId: string, recipes: Recipe[]): Promise<boolean> => {
  try {
    const key = `${STORAGE_KEYS.RECIPES_PREFIX}${userId}`;
    await AsyncStorage.setItem(key, JSON.stringify(recipes));
    return true;
  } catch (error) {
    console.error('Error menyimpan resep:', error);
    return false;
  }
};

// Buat starter pack resep awal untuk pengguna baru
export const seedStarterRecipes = async (userId: string): Promise<void> => {
  const existing = await getRecipesByUser(userId);
  if (existing.length > 0) return;

  const now = Date.now();
  const starterRecipes: Recipe[] = [
    {
      id: `${now}_1`,
      name: 'V60 Pour Over Klasik',
      category: 'Kopi Panas',
      ingredients: [
        { id: 's1_1', name: 'Biji kopi giling medium', amount: '15', unit: 'g' },
        { id: 's1_2', name: 'Air panas 92°C', amount: '225', unit: 'ml' },
      ],
      steps:
        'Basahi kertas filter dengan air panas dan buang air bilasannya.\nMasukkan 15g kopi bubuk ke dripper.\nTuang 45ml air untuk blooming selama 30 detik.\nTuang sisa air secara melingkar hingga 225ml pada menit 02:15.',
      notes: 'Rasio 1:15 menghasilkan rasa floral dan acidity yang seimbang.',
      isTried: true,
      isFavorite: true,
      createdAt: now - 1000,
      userId,
    },
    {
      id: `${now}_2`,
      name: 'Es Kopi Susu Gula Aren',
      category: 'Kopi Dingin',
      ingredients: [
        { id: 's2_1', name: 'Espresso double shot', amount: '60', unit: 'ml' },
        { id: 's2_2', name: 'Susu UHT full cream', amount: '120', unit: 'ml' },
        { id: 's2_3', name: 'Sirup gula aren', amount: '20', unit: 'ml' },
        { id: 's2_4', name: 'Es batu', amount: '100', unit: 'g' },
      ],
      steps:
        'Tuang sirup gula aren di dasar gelas.\nMasukkan es batu hingga hampir penuh.\nTuang susu dingin perlahan.\nTambahkan espresso di paling atas agar terbentuk gradasi.',
      notes: 'Gunakan espresso roast medium-dark agar karakter kopi tetap terasa.',
      isTried: false,
      isFavorite: false,
      createdAt: now - 2000,
      userId,
    },
    {
      id: `${now}_3`,
      name: 'Matcha Oat Latte',
      category: 'Non-Kopi',
      ingredients: [
        { id: 's3_1', name: 'Bubuk ceremonial matcha', amount: '3', unit: 'g' },
        { id: 's3_2', name: 'Air hangat 75°C', amount: '40', unit: 'ml' },
        { id: 's3_3', name: 'Susu oat', amount: '150', unit: 'ml' },
      ],
      steps:
        'Ayak bubuk matcha agar tidak menggumpal.\nKocok matcha dengan 40ml air hangat menggunakan chasen hingga berbusa halus.\nSiapkan gelas berisi es dan susu oat, lalu tuang larutan matcha di atasnya.',
      notes: 'Hindari air mendidih agar matcha tidak terasa pahit.',
      isTried: false,
      isFavorite: false,
      createdAt: now - 3000,
      userId,
    },
  ];

  await saveRecipesByUser(userId, starterRecipes);
};
