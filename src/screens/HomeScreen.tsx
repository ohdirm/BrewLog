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
  Clock,
  Sparkles,
} from 'lucide-react-native';
import { RootStackParamList } from '../types/navigation';
import { Recipe, RecipeCategory } from '../types';
import { palette, spacing, radii, strokes, layout } from '../theme/tokens';
import { Typography, Badge, SurfaceCard, Button, EmptyState } from '../components/common';
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

  // Filter recipes based on query & category
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

  const renderRecipeItem = ({ item }: { item: Recipe }) => {
    return (
      <SurfaceCard
        onPress={() => navigation.navigate('Detail', { recipeId: item.id })}
        style={styles.card}
      >
        {/* Top Card Row: Title & Favorite Star */}
        <View style={styles.cardHeaderRow}>
          <Typography variant="h3" color="primary" numberOfLines={1} style={styles.recipeTitle}>
            {item.name}
          </Typography>

          <TouchableOpacity
            onPress={() => handleToggleFavorite(item.id)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.favoriteButton}
          >
            <Star
              size={20}
              color={item.isFavorite ? palette.statusStar : palette.textTertiary}
              fill={item.isFavorite ? palette.statusStar : 'transparent'}
              strokeWidth={1.75}
            />
          </TouchableOpacity>
        </View>

        {/* Badges Row: Category & Tried Status */}
        <View style={styles.badgesRow}>
          <Badge
            label={item.category}
            tone={
              item.category === 'Kopi Panas'
                ? 'accent'
                : item.category === 'Kopi Dingin'
                ? 'warning'
                : 'neutral'
            }
          />

          <TouchableOpacity
            onPress={() => handleToggleTried(item.id)}
            style={styles.triedBadgeTouch}
            activeOpacity={0.7}
          >
            <Badge
              label={item.isTried ? 'Sudah dicoba' : 'Belum dicoba'}
              tone={item.isTried ? 'success' : 'neutral'}
              icon={
                item.isTried ? (
                  <Check size={11} color={palette.statusSuccess} strokeWidth={2.5} />
                ) : (
                  <Clock size={11} color={palette.textSecondary} strokeWidth={2} />
                )
              }
            />
          </TouchableOpacity>
        </View>

        {/* Ingredients Quick Preview (Tabular numbers) */}
        {item.ingredients.length > 0 && (
          <View style={styles.ingredientsRow}>
            <Typography variant="caption" color="secondary" style={styles.ingredientsPrefix}>
              Bahan:
            </Typography>
            <Typography
              variant="caption"
              color="primary"
              tabular
              numberOfLines={1}
              style={styles.ingredientsList}
            >
              {item.ingredients
                .slice(0, 3)
                .map((ing) => `${ing.amount} ${ing.unit} ${ing.name}`)
                .join(' • ')}
              {item.ingredients.length > 3 ? ' ...' : ''}
            </Typography>
          </View>
        )}
      </SurfaceCard>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Top Application Bar */}
      <View style={styles.topBar}>
        <View style={styles.brandContainer}>
          <View style={styles.brandIcon}>
            <Coffee size={20} color={palette.accent} strokeWidth={2} />
          </View>
          <View>
            <Typography variant="h2" color="primary" style={styles.brandTitle}>
              BrewLog
            </Typography>
            <Typography variant="caption" color="secondary">
              Barista @{username || 'Pengguna'}
            </Typography>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => {
            triggerHaptic();
            setShowLogoutModal(true);
          }}
          style={styles.logoutButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <LogOut size={18} color={palette.textSecondary} strokeWidth={1.75} />
        </TouchableOpacity>
      </View>

      {/* Search Input Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Search size={18} color={palette.textTertiary} strokeWidth={1.75} />
          <TextInput
            placeholder="Cari nama racikan atau bahan..."
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

      {/* Category Pills Carousel */}
      <View style={styles.categorySection}>
        <FlatList
          data={CATEGORIES}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.categoryList}
          renderItem={({ item }) => {
            const isActive = selectedCategory === item;
            return (
              <Pressable
                onPress={() => {
                  triggerHaptic();
                  setSelectedCategory(item);
                }}
                style={[
                  styles.categoryPill,
                  isActive && styles.categoryPillActive,
                ]}
              >
                <Typography
                  variant="caption"
                  style={[
                    styles.categoryText,
                    isActive && styles.categoryTextActive,
                  ]}
                >
                  {item}
                </Typography>
              </Pressable>
            );
          }}
        />
      </View>

      {/* Recipe Count Info */}
      <View style={styles.metricRow}>
        <Typography variant="caption" color="secondary" tabular>
          {filteredRecipes.length} {filteredRecipes.length === 1 ? 'racikan' : 'racikan kopi'}
        </Typography>
      </View>

      {/* Main List of Recipes */}
      <FlatList
        data={filteredRecipes}
        keyExtractor={(item) => item.id}
        renderItem={renderRecipeItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon={<Coffee size={32} color={palette.textTertiary} strokeWidth={1.5} />}
            title={searchQuery ? 'Tidak Ada Hasil' : 'Belum Ada Racikan'}
            description={
              searchQuery
                ? `Tidak ditemukan resep dengan kata kunci "${searchQuery}". Coba kata kunci lain.`
                : 'Mulai dokumentasikan rasio dan seduhan kopi favorit Anda sekarang.'
            }
            actionLabel={searchQuery ? 'Hapus Pencarian' : '+ Racik Resep Pertama'}
            onAction={
              searchQuery
                ? () => setSearchQuery('')
                : () => navigation.navigate('Form', {})
            }
          />
        }
      />

      {/* Tactile Floating Action Button (FAB) */}
      <View style={styles.fabContainer}>
        <TouchableOpacity
          onPress={() => {
            triggerHaptic();
            navigation.navigate('Form', {});
          }}
          activeOpacity={0.85}
          style={styles.fab}
        >
          <Plus size={20} color={palette.textInverse} strokeWidth={2.5} />
          <Typography variant="bodyMedium" color="inverse" style={styles.fabText}>
            Racik Baru
          </Typography>
        </TouchableOpacity>
      </View>

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
            <View style={styles.modalIconCircle}>
              <LogOut size={24} color={palette.statusDanger} strokeWidth={2} />
            </View>

            <Typography variant="h2" color="primary" align="center" style={styles.modalTitle}>
              Keluar Akun
            </Typography>

            <Typography variant="callout" color="secondary" align="center" style={styles.modalSubtitle}>
              Sesi Anda akan diakhiri. Koleksi resep Anda tetap aman tersimpan di perangkat ini.
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
    paddingVertical: spacing.md,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandIcon: {
    width: 38,
    height: 38,
    borderRadius: radii.md,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  brandTitle: {
    letterSpacing: -0.4,
  },
  logoutButton: {
    width: 38,
    height: 38,
    borderRadius: radii.md,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchSection: {
    paddingHorizontal: layout.screenPadding,
    marginTop: spacing.xs,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.surface,
    borderRadius: radii.md,
    borderWidth: strokes.hairline,
    borderColor: palette.borderStrong,
    height: 44,
    paddingHorizontal: spacing.md,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: palette.textPrimary,
    marginLeft: spacing.sm,
    paddingVertical: 0,
  },
  categorySection: {
    marginTop: spacing.md,
  },
  categoryList: {
    paddingHorizontal: layout.screenPadding,
  },
  categoryPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: radii.round,
    backgroundColor: palette.surface,
    borderWidth: strokes.hairline,
    borderColor: palette.borderSubtle,
    marginRight: spacing.sm,
  },
  categoryPillActive: {
    backgroundColor: palette.textPrimary,
    borderColor: palette.textPrimary,
  },
  categoryText: {
    fontWeight: '600',
    color: palette.textSecondary,
  },
  categoryTextActive: {
    color: palette.textInverse,
  },
  metricRow: {
    paddingHorizontal: layout.screenPadding,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  listContent: {
    paddingHorizontal: layout.screenPadding,
    paddingBottom: 96, // Space for FAB
    paddingTop: spacing.xs,
  },
  card: {
    marginBottom: spacing.md,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  recipeTitle: {
    flex: 1,
    marginRight: spacing.sm,
  },
  favoriteButton: {
    padding: spacing.xs,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  triedBadgeTouch: {
    marginLeft: spacing.xs,
  },
  ingredientsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
    borderTopWidth: strokes.hairline,
    borderTopColor: palette.divider,
  },
  ingredientsPrefix: {
    fontWeight: '600',
    marginRight: spacing.xs,
  },
  ingredientsList: {
    flex: 1,
  },
  fabContainer: {
    position: 'absolute',
    bottom: spacing.xxl,
    right: layout.screenPadding,
  },
  fab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.accent,
    borderRadius: radii.round,
    paddingVertical: 13,
    paddingHorizontal: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  fabText: {
    marginLeft: spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(26, 20, 18, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: layout.screenPadding,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: palette.surface,
    borderRadius: radii.xl,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: strokes.hairline,
    borderColor: palette.borderSubtle,
  },
  modalIconCircle: {
    width: 52,
    height: 52,
    borderRadius: radii.round,
    backgroundColor: palette.statusDangerBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: {
    marginBottom: spacing.xs,
  },
  modalSubtitle: {
    lineHeight: 19,
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
