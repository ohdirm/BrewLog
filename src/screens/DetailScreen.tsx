import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Star,
  Check,
  Clock,
  Pencil,
  Trash2,
  Calendar,
  AlertTriangle,
  FileText,
  ListOrdered,
  Layers,
} from 'lucide-react-native';
import { RootStackParamList } from '../types/navigation';
import { palette, spacing, radii, strokes, layout } from '../theme/tokens';
import {
  Typography,
  Badge,
  SurfaceCard,
  Button,
  HeaderBar,
  EmptyState,
} from '../components/common';
import { useRecipes } from '../context/RecipeContext';
import { triggerHaptic, triggerHapticNotification } from '../utils/haptics';

type Props = {
  route: RouteProp<RootStackParamList, 'Detail'>;
  navigation: NativeStackNavigationProp<RootStackParamList, 'Detail'>;
};

const DetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { recipeId } = route.params;
  const { recipes, toggleTried, toggleFavorite, deleteRecipe } = useRecipes();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const recipe = recipes.find((r) => r.id === recipeId);

  if (!recipe) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <HeaderBar title="Detail Resep" onBack={() => navigation.goBack()} />
        <EmptyState
          icon={<AlertTriangle size={32} color={palette.statusDanger} strokeWidth={1.5} />}
          title="Resep Tidak Ditemukan"
          description="Resep ini mungkin sudah dihapus atau tidak tersedia."
          actionLabel="Kembali ke Beranda"
          onAction={() => navigation.goBack()}
        />
      </SafeAreaView>
    );
  }

  const handleToggleFavorite = () => {
    triggerHaptic();
    toggleFavorite(recipe.id);
  };

  const handleToggleTried = () => {
    triggerHaptic();
    toggleTried(recipe.id);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    triggerHapticNotification();
    const success = await deleteRecipe(recipe.id);
    setIsDeleting(false);
    setShowDeleteModal(false);
    if (success) {
      navigation.goBack();
    }
  };

  const formattedDate = new Date(recipe.createdAt).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  // Split steps by newline if multiline
  const stepItems = recipe.steps
    ? recipe.steps.split('\n').filter((s) => s.trim().length > 0)
    : [];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <HeaderBar
        title="Detail Racikan"
        onBack={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity
            onPress={handleToggleFavorite}
            style={styles.favoriteHeaderBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Star
              size={22}
              color={recipe.isFavorite ? palette.statusStar : palette.textSecondary}
              fill={recipe.isFavorite ? palette.statusStar : 'transparent'}
              strokeWidth={1.75}
            />
          </TouchableOpacity>
        }
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Card */}
        <SurfaceCard style={styles.heroCard}>
          <View style={styles.categoryRow}>
            <Badge
              label={recipe.category}
              tone={
                recipe.category === 'Kopi Panas'
                  ? 'accent'
                  : recipe.category === 'Kopi Dingin'
                  ? 'warning'
                  : 'neutral'
              }
            />
            <View style={styles.dateContainer}>
              <Calendar size={12} color={palette.textTertiary} strokeWidth={1.5} />
              <Typography variant="caption" color="tertiary" tabular style={styles.dateText}>
                {formattedDate}
              </Typography>
            </View>
          </View>

          <Typography variant="display" color="primary" style={styles.recipeTitle}>
            {recipe.name}
          </Typography>

          {/* Interactive Status Pill */}
          <View style={styles.statusInteractiveRow}>
            <TouchableOpacity
              onPress={handleToggleTried}
              activeOpacity={0.8}
              style={[
                styles.statusToggle,
                recipe.isTried ? styles.statusToggleTried : styles.statusToggleUntried,
              ]}
            >
              {recipe.isTried ? (
                <>
                  <Check size={14} color={palette.statusSuccess} strokeWidth={2.5} />
                  <Typography variant="caption" color="success" style={styles.statusToggleText}>
                    Sudah Pernah Diseduh
                  </Typography>
                </>
              ) : (
                <>
                  <Clock size={14} color={palette.textSecondary} strokeWidth={2} />
                  <Typography variant="caption" color="secondary" style={styles.statusToggleText}>
                    Belum Dicoba (Ketuk jika sudah)
                  </Typography>
                </>
              )}
            </TouchableOpacity>
          </View>
        </SurfaceCard>

        {/* Ingredients Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Layers size={18} color={palette.accent} strokeWidth={2} />
            <Typography variant="h2" color="primary" style={styles.sectionTitle}>
              Komposisi & Takaran
            </Typography>
          </View>

          <SurfaceCard style={styles.ingredientsCard}>
            {recipe.ingredients.map((item, index) => (
              <View
                key={item.id || index}
                style={[
                  styles.ingredientItem,
                  index === recipe.ingredients.length - 1 && styles.ingredientItemLast,
                ]}
              >
                <View style={styles.ingredientMeasureCol}>
                  <Typography variant="bodyMedium" color="primary" tabular>
                    {item.amount}
                  </Typography>
                  <Typography variant="caption" color="secondary" style={styles.unitText}>
                    {item.unit}
                  </Typography>
                </View>

                <View style={styles.ingredientNameCol}>
                  <Typography variant="body" color="primary">
                    {item.name}
                  </Typography>
                </View>
              </View>
            ))}
          </SurfaceCard>
        </View>

        {/* Steps Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <ListOrdered size={18} color={palette.accent} strokeWidth={2} />
            <Typography variant="h2" color="primary" style={styles.sectionTitle}>
              Metode & Langkah Seduh
            </Typography>
          </View>

          <SurfaceCard style={styles.stepsCard}>
            {stepItems.length > 0 ? (
              stepItems.map((step, index) => (
                <View key={index} style={styles.stepRow}>
                  <View style={styles.stepNumberBadge}>
                    <Typography variant="caption" color="accent" tabular style={styles.stepNumberText}>
                      {(index + 1).toString().padStart(2, '0')}
                    </Typography>
                  </View>
                  <Typography variant="body" color="primary" style={styles.stepText}>
                    {step}
                  </Typography>
                </View>
              ))
            ) : (
              <Typography variant="callout" color="tertiary">
                Belum ada instruksi seduh yang dicatat.
              </Typography>
            )}
          </SurfaceCard>
        </View>

        {/* Tasting Notes Section */}
        {recipe.notes ? (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <FileText size={18} color={palette.accent} strokeWidth={2} />
              <Typography variant="h2" color="primary" style={styles.sectionTitle}>
                Catatan Barista
              </Typography>
            </View>

            <SurfaceCard subdued style={styles.notesCard}>
              <Typography variant="callout" color="secondary" style={styles.notesContent}>
                {recipe.notes}
              </Typography>
            </SurfaceCard>
          </View>
        ) : null}

        {/* Actions Dock */}
        <View style={styles.actionDock}>
          <View style={styles.actionBtn}>
            <Button
              variant="secondary"
              icon={<Pencil size={16} color={palette.textPrimary} strokeWidth={1.75} />}
              onPress={() => navigation.navigate('Form', { recipe })}
            >
              Ubah Resep
            </Button>
          </View>
          <View style={styles.actionBtn}>
            <Button
              variant="destructive"
              icon={<Trash2 size={16} color={palette.statusDanger} strokeWidth={1.75} />}
              onPress={() => setShowDeleteModal(true)}
            >
              Hapus
            </Button>
          </View>
        </View>
      </ScrollView>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowDeleteModal(false)}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalIconCircle}>
              <Trash2 size={24} color={palette.statusDanger} strokeWidth={2} />
            </View>

            <Typography variant="h2" color="primary" align="center" style={styles.modalTitle}>
              Hapus Racikan?
            </Typography>

            <Typography variant="callout" color="secondary" align="center" style={styles.modalSubtitle}>
              Resep "{recipe.name}" akan dihapus permanen dari daftar koleksi Anda.
            </Typography>

            <View style={styles.modalActions}>
              <View style={styles.modalBtnHalf}>
                <Button variant="secondary" onPress={() => setShowDeleteModal(false)}>
                  Batal
                </Button>
              </View>
              <View style={styles.modalBtnHalf}>
                <Button
                  variant="destructive"
                  loading={isDeleting}
                  onPress={handleDelete}
                >
                  Ya, Hapus
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
  favoriteHeaderBtn: {
    padding: spacing.xs,
  },
  scrollContent: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  heroCard: {
    marginBottom: spacing.lg,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    marginLeft: 4,
  },
  recipeTitle: {
    marginVertical: spacing.xs,
    letterSpacing: -0.6,
  },
  statusInteractiveRow: {
    marginTop: spacing.md,
  },
  statusToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: spacing.md,
    borderRadius: radii.round,
    alignSelf: 'flex-start',
    borderWidth: strokes.hairline,
  },
  statusToggleTried: {
    backgroundColor: palette.statusSuccessBg,
    borderColor: 'rgba(63, 107, 77, 0.25)',
  },
  statusToggleUntried: {
    backgroundColor: palette.surfaceSubdued,
    borderColor: palette.borderSubtle,
  },
  statusToggleText: {
    marginLeft: 6,
    fontWeight: '600',
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    marginLeft: spacing.xs,
    letterSpacing: -0.3,
  },
  ingredientsCard: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.lg,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: strokes.hairline,
    borderBottomColor: palette.divider,
  },
  ingredientItemLast: {
    borderBottomWidth: 0,
  },
  ingredientMeasureCol: {
    width: 90,
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  unitText: {
    marginLeft: 3,
  },
  ingredientNameCol: {
    flex: 1,
  },
  stepsCard: {
    padding: spacing.lg,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  stepNumberBadge: {
    width: 26,
    height: 26,
    borderRadius: radii.round,
    backgroundColor: palette.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    marginTop: 2,
  },
  stepNumberText: {
    fontWeight: '700',
  },
  stepText: {
    flex: 1,
    lineHeight: 22,
  },
  notesCard: {
    padding: spacing.lg,
    borderLeftWidth: 3,
    borderLeftColor: palette.accent,
  },
  notesContent: {
    lineHeight: 22,
    fontStyle: 'italic',
  },
  actionDock: {
    flexDirection: 'row',
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  actionBtn: {
    flex: 1,
    marginHorizontal: 4,
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

export default DetailScreen;
