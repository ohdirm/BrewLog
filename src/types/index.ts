// Tipe data untuk resep kopi
export type RecipeCategory = 'Kopi Panas' | 'Kopi Dingin' | 'Non-Kopi';

export interface Ingredient {
  id: string;
  name: string;
  amount: string;
  unit: string;
}

export interface Recipe {
  id: string;
  name: string;
  category: RecipeCategory;
  ingredients: Ingredient[];
  steps: string;
  notes: string;
  imageUri?: string;
  tags?: string[];
  rating?: number;
  brewCount?: number;
  lastBrewedAt?: number;
  isTried: boolean;
  isFavorite: boolean;
  createdAt: number;
  userId: string;
}

// Tipe data untuk user
export interface User {
  id: string;
  username: string;
  password: string;
  createdAt: number;
}

export interface AuthState {
  isLoggedIn: boolean;
  userId: string | null;
  username: string | null;
}
