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
  AlertTriangle,
} from 'lucide-react-native';
import { RootStackParamList } from '../types/navigation';
import { palette, spacing, radii, strokes, layout } from '../theme/tokens';
import {
  Typography,
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
        <HeaderBar title="Resep" onBack={() => navigation.goBack()} />
        <EmptyState
          icon={<AlertTriangle size={28} color={palette.statusDanger} strokeWidth={1.5} />}
          title="Resep tidak ditemukan"
          description="Resep ini mungkin sudah dihapus."
          actionLabel="Kembali"
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

  const stepItems = recipe.steps
    ? recipe.steps.split('\n').filter((s) => s.trim().length > 0)
    : [];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <HeaderBar
        title=""
        onBack={() => navigation.goBack()}
        showDivider={false}
        rightAction={
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={() => {
                triggerHaptic();
                navigation.navigate('Form', { recipe });
              }}
              style={styles.headerIconBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Pencil size={19} color={palette.textPrimary} strokeWidth={1.75} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleToggleFavorite}
              style={styles.headerIconBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Star
                size={20}
                color={recipe.isFavorite ? palette.statusStar : palette.textSecondary}
                fill={recipe.isFavorite ? palette.statusStar : 'transparent'}
                strokeWidth={1.75}
              />
            </TouchableOpacity>
          </View>
        }
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Editorial Title Block */}
        <View style={styles.titleBlock}>
          <Typography variant="overline" color="accent" tabular style={styles.metaOverline}>
            {recipe.category} · {formattedDate}
          </Typography>

          <Typography variant="display" color="primary" style={styles.recipeTitle}>
            {recipe.name}
          </Typography>

          <TouchableOpacity
            onPress={handleToggleTried}
            activeOpacity={0.7}
            style={styles.statusRow}
          >
            {recipe.isTried ? (
              <View style={styles.statusInline}>
                <Check size={15} color={palette.statusSuccess} strokeWidth={2.25} />
                <Typography variant="subheadlineMedium" color="success" style={styles.statusText}>
                  Sudah pernah dicoba
                </Typography>
              </View>
            ) : (
              <View style={styles.statusInline}>
                <Clock size={15} color={palette.textTertiary} strokeWidth={1.75} />
                <Typography variant="subheadline" color="secondary" style={styles.statusText}>
                  Belum dicoba — ketuk untuk tandai
                </Typography>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.sectionDivider} />

        {/* Ingredients Table */}
        <View style={styles.section}>
          <Typography variant="overline" color="secondary" style={styles.sectionLabel}>
            Bahan-Bahan
          </Typography>

          {recipe.ingredients.map((item, index) => (
            <View
              key={item.id || index}
              style={[
                styles.ingredientRow,
                index === recipe.ingredients.length - 1 && styles.ingredientRowLast,
              ]}
            >
              <Typography variant="bodyMedium" color="primary" tabular style={styles.measureText}>
                {item.amount} {item.unit}
              </Typography>
              <Typography variant="body" color="primary" style={styles.ingredientName}>
                {item.name}
              </Typography>
            </View>
          ))}
        </View>

        <View style={styles.sectionDivider} />

        {/* Brewing Steps */}
        <View style={styles.section}>
          <Typography variant="overline" color="secondary" style={styles.sectionLabel}>
            Langkah Seduh
          </Typography>

          {stepItems.length > 0 ? (
            stepItems.map((step, index) => (
              <View key={index} style={styles.stepRow}>
                <Typography variant="bodyMedium" color="accent" tabular style={styles.stepNum}>
                  {index + 1}.
                </Typography>
                <Typography variant="body" color="primary" style={styles.stepText}>
                  {step}
                </Typography>
              </View>
            ))
          ) : (
            <Typography variant="callout" color="tertiary">
              Belum ada langkah yang dicatat.
            </Typography>
          )}
        </View>

        {/* Barista Notes */}
        {recipe.notes ? (
          <>
            <View style={styles.sectionDivider} />
            <View style={styles.section}>
              <Typography variant="overline" color="secondary" style={styles.sectionLabel}>
                Catatan
              </Typography>
              <View style={styles.notesBlock}>
                <Typography variant="body" color="secondary" style={styles.notesText}>
                  {recipe.notes}
                </Typography>
              </View>
            </View>
          </>
        ) : null}

        {/* Quiet Destructive Action at bottom */}
        <View style={styles.footerActions}>
          <TouchableOpacity
            onPress={() => {
              triggerHaptic();
              setShowDeleteModal(true);
            }}
            style={styles.deleteLink}
            hitSlop={{ top: 10, bottom: 10, left: 20, right: 20 }}
          >
            <Typography variant="subheadlineMedium" color="danger">
              Hapus Resep Ini
            </Typography>
          </TouchableOpacity>
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
            <Typography variant="h2" color="primary" style={styles.modalTitle}>
              Hapus resep?
            </Typography>
            <Typography variant="callout" color="secondary" style={styles.modalSubtitle}>
              "{recipe.name}" akan dihapus permanen dan tidak bisa dikembalikan.
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
                  Hapus
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconBtn: {
    padding: spacing.xs,
    marginLeft: spacing.md,
  },
  scrollContent: {
    paddingHorizontal: layout.screenPadding,
    paddingBottom: spacing.huge,
  },
  titleBlock: {
    paddingTop: spacing.xs,
    paddingBottom: spacing.xl,
  },
  metaOverline: {
    marginBottom: spacing.xs,
  },
  recipeTitle: {
    marginBottom: spacing.md,
  },
  statusRow: {
    alignSelf: 'flex-start',
  },
  statusInline: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    marginLeft: 6,
  },
  sectionDivider: {
    height: strokes.hairline,
    backgroundColor: palette.divider,
    marginBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionLabel: {
    marginBottom: spacing.md,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingVertical: spacing.sm,
    borderBottomWidth: strokes.hairline,
    borderBottomColor: palette.divider,
  },
  ingredientRowLast: {
    borderBottomWidth: 0,
  },
  measureText: {
    width: 92,
  },
  ingredientName: {
    flex: 1,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  stepNum: {
    width: 24,
  },
  stepText: {
    flex: 1,
    lineHeight: 23,
  },
  notesBlock: {
    borderLeftWidth: 2,
    borderLeftColor: palette.accent,
    paddingLeft: spacing.md,
  },
  notesText: {
    lineHeight: 23,
  },
  footerActions: {
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: strokes.hairline,
    borderTopColor: palette.divider,
    alignItems: 'center',
  },
  deleteLink: {
    paddingVertical: spacing.sm,
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

export default DetailScreen;
