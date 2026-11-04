import React, { createContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const CoffeeContext = createContext();

const STORAGE_KEYS = {
  RECIPES: 'brewlog_recipes',
  TODOS: 'brewlog_todos',
  USER: 'brewlog_user',
};

const INITIAL_RECIPES = [
  {
    id: '1',
    name: 'V60 Single Origin',
    method: 'V60',
    coffeeWeight: 15,
    waterVolume: 250,
    grindSize: 'Medium-Fine',
    ratio: '1:16.7',
    notes: 'Bloom 45s, pour in slow spiral. Citrus notes prominent.',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Vietnamese Cold Brew',
    method: 'Cold Brew',
    coffeeWeight: 100,
    waterVolume: 1000,
    grindSize: 'Coarse',
    ratio: '1:10',
    notes: 'Steep 24h. Filter through cheesecloth. Serve over ice.',
    createdAt: new Date().toISOString(),
  },
];

const INITIAL_TODOS = [
  {
    id: '1',
    recipeId: '1',
    recipeName: 'V60 Single Origin',
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    recipeId: '2',
    recipeName: 'Vietnamese Cold Brew',
    completed: true,
    createdAt: new Date().toISOString(),
  },
];

const INITIAL_USER = {
  name: 'Coffee Lover',
  email: 'demo@brewlog.app',
};

export function CoffeeProvider({ children }) {
  const [recipes, setRecipes] = useState(INITIAL_RECIPES);
  const [todos, setTodos] = useState(INITIAL_TODOS);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const [storedRecipes, storedTodos, storedUser] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.RECIPES),
        AsyncStorage.getItem(STORAGE_KEYS.TODOS),
        AsyncStorage.getItem(STORAGE_KEYS.USER),
      ]);

      if (storedRecipes) setRecipes(JSON.parse(storedRecipes));
      if (storedTodos) setTodos(JSON.parse(storedTodos));
      if (storedUser) setUser(JSON.parse(storedUser));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveRecipes = useCallback(async (newRecipes) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.RECIPES, JSON.stringify(newRecipes));
      setRecipes(newRecipes);
    } catch (error) {
      console.error('Error saving recipes:', error);
    }
  }, []);

  const saveTodos = useCallback(async (newTodos) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.TODOS, JSON.stringify(newTodos));
      setTodos(newTodos);
    } catch (error) {
      console.error('Error saving todos:', error);
    }
  }, []);

  const saveUser = useCallback(async (newUser) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
      setUser(newUser);
    } catch (error) {
      console.error('Error saving user:', error);
    }
  }, []);

  const addRecipe = async (recipe) => {
    const newRecipe = { ...recipe, id: Date.now().toString(), createdAt: new Date().toISOString() };
    const newRecipes = [...recipes, newRecipe];
    await saveRecipes(newRecipes);
    return newRecipe;
  };

  const deleteRecipe = async (id) => {
    const newRecipes = recipes.filter((r) => r.id !== id);
    await saveRecipes(newRecipes);
  };

  const addTodo = async (todo) => {
    const newTodo = { ...todo, id: Date.now().toString(), completed: false, createdAt: new Date().toISOString() };
    const newTodos = [...todos, newTodo];
    await saveTodos(newTodos);
    return newTodo;
  };

  const toggleTodo = async (id) => {
    const newTodos = todos.map((todo) =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    await saveTodos(newTodos);
  };

  const deleteTodo = async (id) => {
    const newTodos = todos.filter((t) => t.id !== id);
    await saveTodos(newTodos);
  };

  const login = async (name, email) => {
    const newUser = { name, email };
    await saveUser(newUser);
    setUser(newUser);
  };

  const demoLogin = async () => {
    await saveUser(INITIAL_USER);
    setUser(INITIAL_USER);
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.USER);
    } catch (error) {
      console.error('Error clearing user:', error);
    }
    setUser(null);
  };

  const getCompletedTodos = () => todos.filter((t) => t.completed).length;
  const getTotalTodos = () => todos.length;
  const getProgress = () => {
    if (getTotalTodos() === 0) return 0;
    return Math.round((getCompletedTodos() / getTotalTodos()) * 100);
  };

  const value = {
    recipes,
    todos,
    user,
    isLoading,
    addRecipe,
    deleteRecipe,
    addTodo,
    toggleTodo,
    deleteTodo,
    login,
    demoLogin,
    logout,
    getCompletedTodos,
    getTotalTodos,
    getProgress,
  };

  return <CoffeeContext.Provider value={value}>{children}</CoffeeContext.Provider>;
}
