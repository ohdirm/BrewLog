import React, { useState, useMemo } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Coffee,
  Plus,
  Search,
  X,
  LogOut,
  Star,
  Check,
} from 'lucide-react-native';
import { RootStackParamList } from '../types/navigation';
import { Recipe, RecipeCategory } from '../types';
import { palette, spacing, radii, strokes, layout } from '../theme/tokens';
import { Typography, Button, EmptyState } from '../components/common';
import { useAuth } from '../context/AuthContext';
import { useRecipes } from '../context/RecipeContext';
import { triggerHaptic } from '../utils/haptics';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

const CATEGORIES: (RecipeCategory | 'Semua')[] = [
  'Semua',
  'Kopi Panas',
  'Kopi Dingin',
  'Non-Kopi',
];

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { username, logout } = useAuth();
  const { recipes, toggleTried, toggleFavorite } = useRecipes();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<RecipeCategory | 'Semua'>('Semua');
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const filteredRecipes = useMemo(() => {
    return recipes.filter((recipe) => {
      const matchesSearch = recipe.name.toLowerCase().includes(searchQuery.toLowerCase().trim());
      const matchesCategory =
        selectedCategory === 'Semua' || recipe.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [recipes, searchQuery, selectedCategory]);

  const handleLogout = async () => {
    setShowLogoutModal(false);
    await logout();
    navigation.replace('Login');
  };

  const handleToggleFavorite = (recipeId: string) => {
    triggerHaptic();
    toggleFavorite(recipeId);
  };

  const handleToggleTried = (recipeId: string) => {
    triggerHaptic();
    toggleTried(recipeId);
  };

  const renderRecipeItem = ({ item, index }: { item: Recipe; index: number }) => {
    const isLast = index === filteredRecipes.length - 1;
    const ingredientSummary = item.ingredients
      .slice(0, 3)
      .map((ing) => `${ing.amount} ${ing.unit} ${ing.name}`)
      .join(', ');

    return (
      <Pressable
        onPress={() => {
          triggerHaptic();
          navigation.navigate('Detail', { recipeId: item.id });
        }}
        style={({ pressed }) => [
          styles.row,
          !isLast && styles.rowDivider,
          pressed && styles.rowPressed,
        ]}
      >
        {/* Title & Favorite */}
        <View style={styles.rowHeader}>
          <Typography variant="h3" color="primary" numberOfLines={1} style={styles.recipeTitle}>
            {item.name}
          </Typography>

          <TouchableOpacity
            onPress={() => handleToggleFavorite(item.id)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Star
              size={18}
              color={item.isFavorite ? palette.statusStar : palette.textTertiary}
              fill={item.isFavorite ? palette.statusStar : 'transparent'}
              strokeWidth={1.75}
            />
          </TouchableOpacity>
        </View>

        {/* Quiet inline metadata */}
        <View style={styles.metaRow}>
          <Typography variant="subheadline" color="secondary" tabular>
            {item.category} · {item.ingredients.length} bahan
          </Typography>

          <TouchableOpacity
            onPress={() => handleToggleTried(item.id)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.statusButton}
          >
            {item.isTried ? (
              <View style={styles.statusInline}>
                <Check size={13} color={palette.statusSuccess} strokeWidth={2.25} />
                <Typography variant="caption" color="success" style={styles.statusLabel}>
                  Sudah dicoba
                </Typography>
              </View>
            ) : (
              <Typography variant="caption" color="tertiary">
                Belum dicoba
              </Typography>
            )}
          </TouchableOpacity>
        </View>

        {/* Ingredient preview */}
        {item.ingredients.length > 0 && (
          <Typography
            variant="subheadline"
            color="tertiary"
            tabular
            numberOfLines={1}
            style={styles.ingredientPreview}
          >
            {ingredientSummary}
            {item.ingredients.length > 3 ? ', ...' : ''}
          </Typography>
        )}
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Editorial Header */}
      <View style={styles.topBar}>
        <View>
          <Typography variant="h1" color="primary">
            Catatan Seduh
          </Typography>
          <Typography variant="caption" color="secondary" tabular>
            @{username || 'barista'} · {filteredRecipes.length} resep
          </Typography>
        </View>

        <TouchableOpacity
          onPress={() => {
            triggerHaptic();
            setShowLogoutModal(true);
          }}
          style={styles.logoutButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <LogOut size={19} color={palette.textSecondary} strokeWidth={1.75} />
        </TouchableOpacity>
      </View>

      {/* Quiet Search Input */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Search size={16} color={palette.textTertiary} strokeWidth={1.75} />
          <TextInput
            placeholder="Cari resep atau bahan..."
            placeholderTextColor={palette.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <X size={16} color={palette.textSecondary} strokeWidth={2} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Clean Underline Category Tabs */}
      <View style={styles.tabsWrapper}>
        <FlatList
          data={CATEGORIES}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.tabsList}
          renderItem={({ item }) => {
            const isActive = selectedCategory === item;
            return (
              <Pressable
                onPress={() => {
                  triggerHaptic();
                  setSelectedCategory(item);
                }}
                style={[styles.tabItem, isActive && styles.tabItemActive]}
              >
                <Typography
                  variant="calloutMedium"
                  style={[styles.tabText, isActive && styles.tabTextActive]}
                >
                  {item}
                </Typography>
              </Pressable>
            );
          }}
        />
      </View>

      {/* Recipe List */}
      <FlatList
        data={filteredRecipes}
        keyExtractor={(item) => item.id}
        renderItem={renderRecipeItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon={<Coffee size={28} color={palette.textTertiary} strokeWidth={1.5} />}
            title={searchQuery ? 'Tidak ditemukan' : 'Belum ada resep'}
            description={
              searchQuery
                ? `Tidak ada resep yang cocok dengan "${searchQuery}".`
                : 'Mulai catat rasio dan langkah seduh kopi favoritmu.'
            }
            actionLabel={searchQuery ? 'Reset Pencarian' : 'Tambah Resep'}
            onAction={
              searchQuery
                ? () => setSearchQuery('')
                : () => navigation.navigate('Form', {})
            }
          />
        }
      />

      {/* Minimal Circular FAB */}
      <TouchableOpacity
        onPress={() => {
          triggerHaptic();
          navigation.navigate('Form', {});
        }}
        activeOpacity={0.85}
        style={styles.fab}
      >
        <Plus size={24} color={palette.textInverse} strokeWidth={2} />
      </TouchableOpacity>

      {/* Logout Confirmation Modal */}
      <Modal
        visible={showLogoutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowLogoutModal(false)}
        >
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.canvas,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  logoutButton: {
    padding: spacing.xs,
  },
  searchSection: {
    paddingHorizontal: layout.screenPadding,
    marginTop: spacing.xs,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.surfaceSubdued,
    borderRadius: radii.md,
    height: 42,
    paddingHorizontal: spacing.md,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: palette.textPrimary,
    marginLeft: spacing.sm,
    paddingVertical: 0,
  },
  tabsWrapper: {
    marginTop: spacing.md,
    borderBottomWidth: strokes.hairline,
    borderBottomColor: palette.divider,
  },
  tabsList: {
    paddingHorizontal: layout.screenPadding,
  },
  tabItem: {
    paddingVertical: spacing.sm,
    marginRight: spacing.xl,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: palette.accent,
  },
  tabText: {
    color: palette.textTertiary,
  },
  tabTextActive: {
    color: palette.textPrimary,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: layout.screenPadding,
    paddingBottom: 96,
  },
  row: {
    paddingVertical: spacing.lg,
  },
  rowDivider: {
    borderBottomWidth: strokes.hairline,
    borderBottomColor: palette.divider,
  },
  rowPressed: {
    opacity: 0.65,
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  recipeTitle: {
    flex: 1,
    marginRight: spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusButton: {
    paddingVertical: 2,
  },
  statusInline: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusLabel: {
    marginLeft: 4,
  },
  ingredientPreview: {
    marginTop: 2,
  },
  fab: {
    position: 'absolute',
    bottom: spacing.xxl,
    right: layout.screenPadding,
    width: 54,
    height: 54,
    borderRadius: radii.round,
    backgroundColor: palette.ink,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.16,
    shadowRadius: 6,
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

export default HomeScreen;
