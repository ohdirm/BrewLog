import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Recipe } from '../types';
import { getRecipesByUser, saveRecipesByUser } from '../storage';
import { useAuth } from './AuthContext';

interface RecipeContextType {
  recipes: Recipe[];
  isLoading: boolean;
  addRecipe: (recipe: Omit<Recipe, 'id' | 'createdAt' | 'userId'>) => Promise<boolean>;
  updateRecipe: (recipe: Recipe) => Promise<boolean>;
  deleteRecipe: (id: string) => Promise<boolean>;
  toggleTried: (id: string) => Promise<boolean>;
  toggleFavorite: (id: string) => Promise<boolean>;
  refreshRecipes: () => Promise<void>;
}

const RecipeContext = createContext<RecipeContextType>({
  recipes: [],
  isLoading: false,
  addRecipe: async () => false,
  updateRecipe: async () => false,
  deleteRecipe: async () => false,
  toggleTried: async () => false,
  toggleFavorite: async () => false,
  refreshRecipes: async () => {},
});

export const RecipeProvider = ({ children }: { children: ReactNode }) => {
  const { userId } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Ambil resep setiap user berubah
  const loadRecipes = useCallback(async () => {
    if (!userId) {
      setRecipes([]);
      return;
    }
    setIsLoading(true);
    const data = await getRecipesByUser(userId);
    // Urutkan terbaru dulu
    data.sort((a, b) => b.createdAt - a.createdAt);
    setRecipes(data);
    setIsLoading(false);
  }, [userId]);

  useEffect(() => {
    loadRecipes();
  }, [loadRecipes]);

  // Tambah resep baru
  const addRecipe = async (item: Omit<Recipe, 'id' | 'createdAt' | 'userId'>): Promise<boolean> => {
    if (!userId) return false;
    const newRecipe: Recipe = {
      ...item,
      id: Date.now().toString(),
      createdAt: Date.now(),
      userId,
    };
    const updated = [newRecipe, ...recipes];
    const success = await saveRecipesByUser(userId, updated);
    if (success) setRecipes(updated);
    return success;
  };

  // Update resep yang ada
  const updateRecipe = async (item: Recipe): Promise<boolean> => {
    if (!userId) return false;
    const updated = recipes.map((r) => (r.id === item.id ? item : r));
    const success = await saveRecipesByUser(userId, updated);
    if (success) setRecipes(updated);
    return success;
  };

  // Hapus resep
  const deleteRecipe = async (id: string): Promise<boolean> => {
    if (!userId) return false;
    const updated = recipes.filter((r) => r.id !== id);
    const success = await saveRecipesByUser(userId, updated);
    if (success) setRecipes(updated);
    return success;
  };

  // Toggle status sudah dicoba / belum
  const toggleTried = async (id: string): Promise<boolean> => {
    if (!userId) return false;
    const updated = recipes.map((r) => (r.id === id ? { ...r, isTried: !r.isTried } : r));
    const success = await saveRecipesByUser(userId, updated);
    if (success) setRecipes(updated);
    return success;
  };

  // Toggle status favorit
  const toggleFavorite = async (id: string): Promise<boolean> => {
    if (!userId) return false;
    const updated = recipes.map((r) => (r.id === id ? { ...r, isFavorite: !r.isFavorite } : r));
    const success = await saveRecipesByUser(userId, updated);
    if (success) setRecipes(updated);
    return success;
  };

  return (
    <RecipeContext.Provider
      value={{
        recipes,
        isLoading,
        addRecipe,
        updateRecipe,
        deleteRecipe,
        toggleTried,
        toggleFavorite,
        refreshRecipes: loadRecipes,
      }}
    >
      {children}
    </RecipeContext.Provider>
  );
};

export const useRecipes = () => useContext(RecipeContext);
