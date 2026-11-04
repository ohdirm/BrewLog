import AsyncStorage from '@react-native-async-storage/async-storage';
import { Recipe, User } from '../types';

const STORAGE_KEYS = {
  USERS: '@app_coffee_users',
  CURRENT_USER: '@app_coffee_current_user',
  RECIPES_PREFIX: '@app_coffee_recipes_',
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
