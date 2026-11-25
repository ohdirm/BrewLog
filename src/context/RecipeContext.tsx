import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { Recipe } from '../types';
import { getRecipesByUser, saveRecipesByUser } from '../storage';
import { useAuth } from './AuthContext';

interface RecipeContextType {
  recipes: Recipe[];
  isLoading: boolean;
  lastDeletedRecipe: Recipe | null;
  addRecipe: (recipe: Omit<Recipe, 'id' | 'createdAt' | 'userId'>) => Promise<boolean>;
  updateRecipe: (recipe: Recipe) => Promise<boolean>;
  deleteRecipe: (id: string) => Promise<boolean>;
  undoDelete: () => Promise<boolean>;
  dismissUndo: () => void;
  importRecipes: (incoming: Partial<Recipe>[]) => Promise<{ ok: boolean; added: number }>;
  toggleTried: (id: string) => Promise<boolean>;
  toggleFavorite: (id: string) => Promise<boolean>;
  logBrew: (id: string) => Promise<boolean>;
  refreshRecipes: () => Promise<void>;
}

const RecipeContext = createContext<RecipeContextType>({
  recipes: [],
  isLoading: false,
  lastDeletedRecipe: null,
  addRecipe: async () => false,
  updateRecipe: async () => false,
  deleteRecipe: async () => false,
  undoDelete: async () => false,
  dismissUndo: () => {},
  importRecipes: async () => ({ ok: false, added: 0 }),
  toggleTried: async () => false,
  toggleFavorite: async () => false,
  logBrew: async () => false,
  refreshRecipes: async () => {},
});

export const RecipeProvider = ({ children }: { children: ReactNode }) => {
  const { userId } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastDeletedRecipe, setLastDeletedRecipe] = useState<Recipe | null>(null);
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // Hapus resep (simpan sementara untuk fitur Undo)
  const deleteRecipe = async (id: string): Promise<boolean> => {
    if (!userId) return false;
    const target = recipes.find((r) => r.id === id) || null;
    const updated = recipes.filter((r) => r.id !== id);
    const success = await saveRecipesByUser(userId, updated);
    if (success) {
      setRecipes(updated);
      if (target) {
        if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
        setLastDeletedRecipe(target);
        undoTimerRef.current = setTimeout(() => {
          setLastDeletedRecipe(null);
        }, 5000);
      }
    }
    return success;
  };

  // Kembalikan resep yang baru saja dihapus
  const undoDelete = async (): Promise<boolean> => {
    if (!userId || !lastDeletedRecipe) return false;
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    const restored = [lastDeletedRecipe, ...recipes].sort((a, b) => b.createdAt - a.createdAt);
    const success = await saveRecipesByUser(userId, restored);
    if (success) {
      setRecipes(restored);
      setLastDeletedRecipe(null);
    }
    return success;
  };

  const dismissUndo = () => {
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    setLastDeletedRecipe(null);
  };

  // Impor daftar resep dari JSON backup
  const importRecipes = async (
    incoming: Partial<Recipe>[]
  ): Promise<{ ok: boolean; added: number }> => {
    if (!userId) return { ok: false, added: 0 };

    const now = Date.now();
    const validCategories = ['Kopi Panas', 'Kopi Dingin', 'Non-Kopi'];
    const normalized: Recipe[] = incoming
      .filter((item) => typeof item.name === 'string' && item.name.trim().length > 0)
      .map((item, idx) => ({
        id: `${now}_imp_${idx}`,
        name: item.name!.trim(),
        category: validCategories.includes(item.category as string)
          ? (item.category as Recipe['category'])
          : 'Kopi Panas',
        ingredients: Array.isArray(item.ingredients)
          ? item.ingredients.map((ing, iIdx) => ({
              id: ing.id || `${now}_ing_${idx}_${iIdx}`,
              name: String(ing.name || ''),
              amount: String(ing.amount || ''),
              unit: String(ing.unit || 'g'),
            }))
          : [],
        steps: typeof item.steps === 'string' ? item.steps : '',
        notes: typeof item.notes === 'string' ? item.notes : '',
        imageUri: typeof item.imageUri === 'string' ? item.imageUri : undefined,
        isTried: Boolean(item.isTried),
        isFavorite: Boolean(item.isFavorite),
        createdAt: typeof item.createdAt === 'number' ? item.createdAt : now - idx,
        userId,
      }));

    if (normalized.length === 0) {
      return { ok: false, added: 0 };
    }

    const updated = [...normalized, ...recipes].sort((a, b) => b.createdAt - a.createdAt);
    const success = await saveRecipesByUser(userId, updated);
    if (success) {
      setRecipes(updated);
      return { ok: true, added: normalized.length };
    }
    return { ok: false, added: 0 };
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

  // Catat sesi seduh (tambah brewCount & lastBrewedAt)
  const logBrew = async (id: string): Promise<boolean> => {
    if (!userId) return false;
    const now = Date.now();
    const updated = recipes.map((r) =>
      r.id === id
        ? {
            ...r,
            isTried: true,
            brewCount: (r.brewCount || 0) + 1,
            lastBrewedAt: now,
          }
        : r
    );
    const success = await saveRecipesByUser(userId, updated);
    if (success) setRecipes(updated);
    return success;
  };

  return (
    <RecipeContext.Provider
      value={{
        recipes,
        isLoading,
        lastDeletedRecipe,
        addRecipe,
        updateRecipe,
        deleteRecipe,
        undoDelete,
        dismissUndo,
        importRecipes,
        toggleTried,
        toggleFavorite,
        logBrew,
        refreshRecipes: loadRecipes,
      }}
    >
      {children}
    </RecipeContext.Provider>
  );
};

export const useRecipes = () => useContext(RecipeContext);
