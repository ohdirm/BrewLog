import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { RecipeCategory } from '../types';
import { colors, spacing, typography } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { useRecipes } from '../context/RecipeContext';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

const categories: { label: RecipeCategory | 'Semua'; value: RecipeCategory | 'Semua' }[] = [
  { label: 'Semua', value: 'Semua' },
  { label: 'Kopi Panas', value: 'Kopi Panas' },
  { label: 'Kopi Dingin', value: 'Kopi Dingin' },
  { label: 'Non-Kopi', value: 'Non-Kopi' },
];

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { logout } = useAuth();
  const { recipes, deleteRecipe, toggleTried, toggleFavorite } = useRecipes();

  // State untuk filter dan search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<RecipeCategory | 'Semua'>('Semua');
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Load ulang resep saat fokus ke screen ini
  useFocusEffect(
    React.useCallback(() => {
      // Re-render akan terpicu oleh context update, tidak perlu manual reload
    }, [])
  );

  // Filter resep berdasarkan search + category
  const filteredRecipes = recipes.filter((recipe) => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'Semua' || recipe.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Konfirmasi sebelum hapus resep
  const handleDelete = (id: string, name: string) => {
    Alert.alert('Hapus Resep', `Yakin ingin menghapus "${name}"?`, [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: async () => {
          const success = await deleteRecipe(id);
          if (!success) {
            Alert.alert('Gagal', 'Gagal menghapus resep');
          }
        },
      },
    ]);
  };

  // Tombol Logout dengan konfirmasi
  const handleLogout = () => {
    setShowLogoutModal(false);
    logout();
  };

  // Render item resep di FlatList
  const renderRecipeItem = ({ item: recipe }: { item: typeof recipes[0] }) => (
    <TouchableOpacity
      style={[
        styles.card,
        recipe.isTried && styles.cardTried, // Style berbeda jika sudah dicoba
      ]}
      onPress={() => navigation.navigate('Detail', { recipeId: recipe.id })}
    >
      {/* Header kartu: nama + kategori */}
      <View style={styles.cardHeader}>
        <Text style={[styles.recipeName, recipe.isTried && styles.recipeNameTried]}>
          {recipe.name}
        </Text>
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => toggleFavorite(recipe.id)}
          activeOpacity={0.7}
        >
          <Text style={[styles.star, recipe.isFavorite && styles.starFilled]}>
            {recipe.isFavorite ? '⭐' : '☆'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Kategori badge */}
      <View style={styles.categoryContainer}>
        <Text style={styles.categoryBadge}>{recipe.category}</Text>
      </View>

      {/* Tag: sudah dicoba / belum */}
      <View style={styles.statusContainer}>
        {recipe.isTried ? (
          <View style={styles.triedBadge}>
            <Text style={styles.triedText}>✅ Sudah dicoba</Text>
          </View>
        ) : (
          <View style={styles.notTriedBadge}>
            <Text style={styles.notTriedText}>⏳ Belum dicoba</Text>
          </View>
        )}

        {/* Toggle status dicoba */}
        <TouchableOpacity
          style={styles.tryButton}
          onPress={() => toggleTried(recipe.id)}
        >
          <Text style={styles.tryText}>
            {recipe.isTried ? 'Ubah ke Belum' : 'Tandai Sudah'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bahan utama (tampil 2 bahan pertama) */}
      {recipe.ingredients.length > 0 && (
        <View style={styles.ingredientsContainer}>
          <Text style={styles.ingredientsLabel}>Bahan:</Text>
          <Text style={styles.ingredientsText}>
            {recipe.ingredients.slice(0, 2).map((ing) => `${ing.amount} ${ing.unit} ${ing.name}`).join(', ')}
            {recipe.ingredients.length > 2 ? '...' : ''}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  // Empty state: belum ada resep
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>☕</Text>
      <Text style={styles.emptyTitle}>Belum ada resep</Text>
      <Text style={styles.emptyText}>Yuk tambah resep favoritmu!</Text>
      <TouchableOpacity
        style={styles.addRecipeButton}
        onPress={() => navigation.navigate('Form', {})}
      >
        <Text style={styles.addRecipeText}>+ Tambah Resep</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Resep Kopiku</Text>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => setShowLogoutModal(true)}
        >
          <Text style={styles.logoutText}> Logout </Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Cari resep..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
        />
      </View>

      {/* Category Filter */}
      <FlatList
        data={categories}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.value}
        contentContainerStyle={styles.categoryList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.categoryButton,
              selectedCategory === item.value && styles.categoryButtonActive,
            ]}
            onPress={() => setSelectedCategory(item.value)}
          >
            <Text
              style={[
                styles.categoryButtonText,
                selectedCategory === item.value && styles.categoryButtonTextActive,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* List Resep */}
      <FlatList
        data={filteredRecipes}
        keyExtractor={(item) => item.id}
        renderItem={renderRecipeItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
      />

      {/* Floating Action Button (FAB) */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('Form', {})}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      {/* Modal Konfirmasi Logout */}
      <Modal
        visible={showLogoutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Konfirmasi</Text>
            <Text style={styles.modalText}>Yakin ingin keluar dari akun ini?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setShowLogoutModal(false)}
              >
                <Text style={styles.modalButtonTextCancel}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={handleLogout}
              >
                <Text style={styles.modalButtonTextConfirm}>Keluar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.primary,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textLight,
  },
  logoutButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 8,
  },
  logoutText: {
    color: colors.textLight,
    fontSize: 12,
  },
  searchContainer: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  searchInput: {
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: spacing.md,
    fontSize: 14,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryList: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  categoryButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    backgroundColor: colors.card,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryButtonText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  categoryButtonTextActive: {
    color: colors.textLight,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTried: {
    opacity: 0.9,
    backgroundColor: '#F8F5F0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  recipeName: {
    ...typography.h3,
    color: colors.text,
    flex: 1,
  },
  recipeNameTried: {
    textDecorationLine: 'line-through',
    color: colors.textMuted,
  },
  favoriteButton: {
    padding: 4,
  },
  star: {
    fontSize: 20,
  },
  starFilled: {
    color: colors.star,
  },
  categoryContainer: {
    marginBottom: spacing.sm,
  },
  categoryBadge: {
    fontSize: 11,
    color: colors.primaryLight,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
    fontWeight: '700',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  triedBadge: {
    backgroundColor: '#D8F3DC',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
  },
  triedText: {
    color: colors.success,
    fontSize: 11,
    fontWeight: '700',
  },
  notTriedBadge: {
    backgroundColor: '#FEF3CD',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
  },
  notTriedText: {
    color: '#D4A017',
    fontSize: 11,
    fontWeight: '700',
  },
  tryButton: {
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
  },
  tryText: {
    color: colors.primary,
    fontSize: 11,
  },
  ingredientsContainer: {
    marginTop: spacing.xs,
  },
  ingredientsLabel: {
    color: colors.textMuted,
    fontSize: 11,
  },
  ingredientsText: {
    color: colors.text,
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.sm,
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  addRecipeButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 12,
  },
  addRecipeText: {
    color: colors.textLight,
    fontSize: 14,
    fontWeight: '700',
  },
  fab: {
    position: 'absolute',
    bottom: spacing.lg,
    right: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  fabIcon: {
    fontSize: 32,
    color: colors.textLight,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.lg,
    width: '80%',
    maxWidth: 320,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
  },
  modalButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: colors.border,
  },
  modalButtonConfirm: {
    backgroundColor: colors.danger,
  },
  modalButtonTextCancel: {
    color: colors.text,
    fontSize: 14,
  },
  modalButtonTextConfirm: {
    color: colors.textLight,
    fontSize: 14,
  },
});

export default HomeScreen;
