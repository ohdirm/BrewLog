import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  Image,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import * as Haptics from 'expo-haptics';
import {
  Star,
  Check,
  Clock,
  Pencil,
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
  Share2,
  Copy,
} from 'lucide-react-native';
import { RootStackParamList } from '../types/navigation';
import { palette as staticPalette, spacing, radii, strokes, layout } from '../theme/tokens';
import {
  Typography,
  Button,
  HeaderBar,
  EmptyState,
} from '../components/common';
import { useRecipes } from '../context/RecipeContext';
import { useTheme } from '../context/ThemeContext';
import { triggerHaptic, triggerHapticNotification } from '../utils/haptics';
import { formatScaledAmount } from '../utils/recipeMath';

type Props = {
  route: RouteProp<RootStackParamList, 'Detail'>;
  navigation: NativeStackNavigationProp<RootStackParamList, 'Detail'>;
};

const TIMER_PRESETS: { label: string; seconds: number }[] = [
  { label: 'Bebas', seconds: 0 },
  { label: '02:00', seconds: 120 },
  { label: '02:30', seconds: 150 },
  { label: '03:00', seconds: 180 },
];

const DetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { recipeId } = route.params;
  const { recipes, toggleTried, toggleFavorite, deleteRecipe, logBrew } = useRecipes();
  const { palette } = useTheme();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [checkedIngredients, setCheckedIngredients] = useState<string[]>([]);
  const [checkedSteps, setCheckedSteps] = useState<number[]>([]);
  const [scaleMultiplier, setScaleMultiplier] = useState<0.5 | 1 | 2>(1);

  // Brew timer state
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [targetSeconds, setTargetSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Keep screen awake while brew timer is active
  useEffect(() => {
    if (isTimerRunning) {
      activateKeepAwakeAsync('brew-timer').catch(() => {});
    } else {
      deactivateKeepAwake('brew-timer').catch(() => {});
    }
    return () => {
      deactivateKeepAwake('brew-timer').catch(() => {});
    };
  }, [isTimerRunning]);

  useEffect(() => {
    if (!isTimerRunning) return;
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => {
        const next = prev + 1;
        if (targetSeconds > 0 && next === targetSeconds) {
          triggerHapticNotification(Haptics.NotificationFeedbackType.Success);
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning, targetSeconds]);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, '0');
    const secs = (totalSeconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const toggleIngredientCheck = (key: string) => {
    triggerHaptic();
    setCheckedIngredients((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]
    );
  };

  const toggleStepCheck = (index: number) => {
    triggerHaptic();
    setCheckedSteps((prev) =>
      prev.includes(index) ? prev.filter((item) => item !== index) : [...prev, index]
    );
  };

  const hasCheckedItems = checkedIngredients.length > 0 || checkedSteps.length > 0;
  const recipe = recipes.find((r) => r.id === recipeId);

  if (!recipe) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.canvas }]}>
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

  const handleLogBrew = async () => {
    triggerHapticNotification(Haptics.NotificationFeedbackType.Success);
    await logBrew(recipe.id);
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

  const handleShare = async () => {
    triggerHaptic();
    const ingredientsText = recipe.ingredients
      .map((i) => `- ${formatScaledAmount(i.amount, scaleMultiplier)} ${i.unit} ${i.name}`)
      .join('\n');
    const stepsText = recipe.steps
      ? recipe.steps
          .split('\n')
          .filter((s) => s.trim())
          .map((s, idx) => `${idx + 1}. ${s}`)
          .join('\n')
      : '-';
    const scaleTag = scaleMultiplier !== 1 ? ` · Porsi ${scaleMultiplier}×` : '';
    const message = [
      `${recipe.name} (${recipe.category}${scaleTag})`,
      '',
      'Bahan:',
      ingredientsText,
      '',
      'Langkah Seduh:',
      stepsText,
      recipe.notes ? `\nCatatan:\n${recipe.notes}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    await Share.share({
      title: recipe.name,
      message,
    });
  };

  const formattedDate = new Date(recipe.createdAt).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const lastBrewLabel = recipe.lastBrewedAt
    ? new Date(recipe.lastBrewedAt).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
      })
    : null;

  const stepItems = recipe.steps
    ? recipe.steps.split('\n').filter((s) => s.trim().length > 0)
    : [];

  const isTargetReached = targetSeconds > 0 && elapsedSeconds >= targetSeconds;

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: palette.canvas }]}
      edges={['top', 'left', 'right']}
    >
      <HeaderBar
        title=""
        onBack={() => navigation.goBack()}
        showDivider={false}
        rightAction={
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={handleShare}
              style={styles.headerIconBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Share2 size={18} color={palette.textPrimary} strokeWidth={1.75} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                triggerHaptic();
                navigation.navigate('Form', { recipe, isDuplicate: true });
              }}
              style={styles.headerIconBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Copy size={18} color={palette.textPrimary} strokeWidth={1.75} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                triggerHaptic();
                navigation.navigate('Form', { recipe });
              }}
              style={styles.headerIconBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Pencil size={18} color={palette.textPrimary} strokeWidth={1.75} />
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
            {recipe.rating ? ` · ★ ${recipe.rating}/5` : ''}
          </Typography>

          <Typography variant="display" color="primary" style={styles.recipeTitle}>
            {recipe.name}
          </Typography>

          {recipe.tags && recipe.tags.length > 0 ? (
            <View style={styles.tagsRow}>
              {recipe.tags.map((tag) => (
                <View
                  key={tag}
                  style={[styles.tagBadge, { backgroundColor: palette.surfaceSubdued }]}
                >
                  <Typography variant="caption" color="secondary">
                    #{tag}
                  </Typography>
                </View>
              ))}
            </View>
          ) : null}

          <View style={styles.statusActionsRow}>
            <TouchableOpacity
              onPress={handleToggleTried}
              activeOpacity={0.7}
              style={styles.statusRow}
            >
              {recipe.isTried ? (
                <View style={styles.statusInline}>
                  <Check size={15} color={palette.statusSuccess} strokeWidth={2.25} />
                  <Typography variant="subheadlineMedium" color="success" style={styles.statusText}>
                    Sudah dicoba
                    {recipe.brewCount ? ` (${recipe.brewCount}×)` : ''}
                  </Typography>
                </View>
              ) : (
                <View style={styles.statusInline}>
                  <Clock size={15} color={palette.textTertiary} strokeWidth={1.75} />
                  <Typography variant="subheadline" color="secondary" style={styles.statusText}>
                    Belum dicoba
                  </Typography>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleLogBrew}
              style={[styles.logBrewPill, { backgroundColor: palette.accentLight }]}
            >
              <Typography variant="caption" color="accent" style={styles.logBrewText}>
                + Catat Seduh{lastBrewLabel ? ` · ${lastBrewLabel}` : ''}
              </Typography>
            </TouchableOpacity>
          </View>
        </View>

        {recipe.imageUri ? (
          <Image source={{ uri: recipe.imageUri }} style={styles.heroImage} />
        ) : null}

        <View style={[styles.sectionDivider, { backgroundColor: palette.divider }]} />

        {/* Ingredients Table */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Typography variant="overline" color="secondary">
              Bahan-Bahan
            </Typography>
            <View style={styles.scaleRow}>
              {([0.5, 1, 2] as const).map((mult) => {
                const isActive = scaleMultiplier === mult;
                return (
                  <TouchableOpacity
                    key={mult}
                    onPress={() => {
                      triggerHaptic();
                      setScaleMultiplier(mult);
                    }}
                    style={[
                      styles.scalePill,
                      { backgroundColor: isActive ? palette.ink : palette.surfaceSubdued },
                    ]}
                  >
                    <Typography
                      variant="caption"
                      tabular
                      style={[
                        styles.scaleText,
                        { color: isActive ? palette.textInverse : palette.textSecondary },
                      ]}
                    >
                      {mult}×
                    </Typography>
                  </TouchableOpacity>
                );
              })}
              {hasCheckedItems ? (
                <TouchableOpacity
                  onPress={() => {
                    triggerHaptic();
                    setCheckedIngredients([]);
                    setCheckedSteps([]);
                  }}
                  style={styles.resetCheckBtn}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                >
                  <Typography variant="caption" color="accent">
                    Reset
                  </Typography>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>

          {recipe.ingredients.map((item, index) => {
            const key = item.id || String(index);
            const isChecked = checkedIngredients.includes(key);
            return (
              <TouchableOpacity
                key={key}
                activeOpacity={0.7}
                onPress={() => toggleIngredientCheck(key)}
                style={[
                  styles.ingredientRow,
                  { borderBottomColor: palette.divider },
                  index === recipe.ingredients.length - 1 && styles.ingredientRowLast,
                ]}
              >
                <View
                  style={[
                    styles.checkCircle,
                    { borderColor: palette.borderStrong },
                    isChecked && {
                      backgroundColor: palette.statusSuccess,
                      borderColor: palette.statusSuccess,
                    },
                  ]}
                >
                  {isChecked && <Check size={11} color={palette.textInverse} strokeWidth={2.75} />}
                </View>
                <Typography
                  variant="bodyMedium"
                  color={isChecked ? 'tertiary' : 'primary'}
                  tabular
                  style={[styles.measureText, isChecked && styles.strikethrough]}
                >
                  {formatScaledAmount(item.amount, scaleMultiplier)} {item.unit}
                </Typography>
                <Typography
                  variant="body"
                  color={isChecked ? 'tertiary' : 'primary'}
                  style={[styles.ingredientName, isChecked && styles.strikethrough]}
                >
                  {item.name}
                </Typography>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={[styles.sectionDivider, { backgroundColor: palette.divider }]} />

        {/* Compact Brew Timer with Target Presets */}
        <View style={styles.timerContainer}>
          <View style={styles.timerStrip}>
            <View>
              <Typography variant="overline" color="secondary">
                Brew Timer{isTargetReached ? ' · Selesai!' : ''}
              </Typography>
              <Typography
                variant="h1"
                color={isTargetReached ? 'success' : 'primary'}
                tabular
                style={styles.timerDigits}
              >
                {formatTimer(elapsedSeconds)}
              </Typography>
            </View>

            <View style={styles.timerControls}>
              <TouchableOpacity
                onPress={() => {
                  triggerHaptic();
                  setIsTimerRunning((prev) => !prev);
                }}
                style={[
                  styles.timerBtn,
                  { backgroundColor: isTimerRunning ? palette.surfaceSubdued : palette.ink },
                ]}
                activeOpacity={0.8}
              >
                {isTimerRunning ? (
                  <Pause size={16} color={palette.textPrimary} strokeWidth={2} />
                ) : (
                  <Play size={16} color={palette.textInverse} strokeWidth={2} />
                )}
                <Typography
                  variant="caption"
                  color={isTimerRunning ? 'primary' : 'inverse'}
                  style={styles.timerBtnText}
                >
                  {isTimerRunning ? 'Jeda' : 'Mulai'}
                </Typography>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  triggerHaptic();
                  setIsTimerRunning(false);
                  setElapsedSeconds(0);
                }}
                style={styles.timerResetBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <RotateCcw size={16} color={palette.textSecondary} strokeWidth={1.75} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.presetRow}>
            <Typography variant="caption" color="tertiary" style={styles.presetLabel}>
              Target:
            </Typography>
            {TIMER_PRESETS.map((preset) => {
              const active = targetSeconds === preset.seconds;
              return (
                <TouchableOpacity
                  key={preset.label}
                  onPress={() => {
                    triggerHaptic();
                    setTargetSeconds(preset.seconds);
                  }}
                  style={[
                    styles.presetChip,
                    { backgroundColor: active ? palette.ink : palette.surfaceSubdued },
                  ]}
                >
                  <Typography
                    variant="caption"
                    tabular
                    style={{ color: active ? palette.textInverse : palette.textSecondary }}
                  >
                    {preset.label}
                  </Typography>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={[styles.sectionDivider, { backgroundColor: palette.divider }]} />

        {/* Brewing Steps */}
        <View style={styles.section}>
          <Typography variant="overline" color="secondary" style={styles.sectionLabel}>
            Langkah Seduh
          </Typography>

          {stepItems.length > 0 ? (
            stepItems.map((step, index) => {
              const isChecked = checkedSteps.includes(index);
              return (
                <TouchableOpacity
                  key={index}
                  activeOpacity={0.7}
                  onPress={() => toggleStepCheck(index)}
                  style={styles.stepRow}
                >
                  <Typography
                    variant="bodyMedium"
                    color={isChecked ? 'tertiary' : 'accent'}
                    tabular
                    style={styles.stepNum}
                  >
                    {index + 1}.
                  </Typography>
                  <Typography
                    variant="body"
                    color={isChecked ? 'tertiary' : 'primary'}
                    style={[styles.stepText, isChecked && styles.strikethrough]}
                  >
                    {step}
                  </Typography>
                </TouchableOpacity>
              );
            })
          ) : (
            <Typography variant="callout" color="tertiary">
              Belum ada langkah yang dicatat.
            </Typography>
          )}
        </View>

        {/* Barista Notes */}
        {recipe.notes ? (
          <>
            <View style={[styles.sectionDivider, { backgroundColor: palette.divider }]} />
            <View style={styles.section}>
              <Typography variant="overline" color="secondary" style={styles.sectionLabel}>
                Catatan
              </Typography>
              <View style={[styles.notesBlock, { borderLeftColor: palette.accent }]}>
                <Typography variant="body" color="secondary" style={styles.notesText}>
                  {recipe.notes}
                </Typography>
              </View>
            </View>
          </>
        ) : null}

        {/* Quiet Destructive Action at bottom */}
        <View style={[styles.footerActions, { borderTopColor: palette.divider }]}>
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
          <Pressable
            style={[styles.modalCard, { backgroundColor: palette.surface }]}
            onPress={(e) => e.stopPropagation()}
          >
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

const palette = staticPalette;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconBtn: {
    padding: spacing.xs,
    marginLeft: spacing.sm,
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
    marginBottom: spacing.sm,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.md,
  },
  tagBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.round,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  statusActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
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
  logBrewPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.round,
  },
  logBrewText: {
    fontWeight: '600',
  },
  heroImage: {
    width: '100%',
    height: 220,
    borderRadius: radii.lg,
    marginBottom: spacing.xl,
  },
  sectionDivider: {
    height: strokes.hairline,
    marginBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionLabel: {
    marginBottom: spacing.md,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  scaleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scalePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.sm,
    marginLeft: 4,
  },
  scaleText: {
    fontWeight: '600',
  },
  resetCheckBtn: {
    marginLeft: spacing.sm,
  },
  checkCircle: {
    width: 18,
    height: 18,
    borderRadius: radii.round,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  strikethrough: {
    textDecorationLine: 'line-through',
  },
  timerContainer: {
    marginBottom: spacing.xl,
  },
  timerStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  timerDigits: {
    marginTop: 2,
  },
  timerControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radii.round,
  },
  timerBtnText: {
    marginLeft: 6,
    fontWeight: '600',
  },
  timerResetBtn: {
    marginLeft: spacing.sm,
    padding: spacing.sm,
  },
  presetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  presetLabel: {
    marginRight: spacing.xs,
  },
  presetChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.sm,
    marginRight: 6,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: strokes.hairline,
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
    paddingLeft: spacing.md,
  },
  notesText: {
    lineHeight: 23,
  },
  footerActions: {
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: strokes.hairline,
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
