import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import {
  Plus,
  X,
  ImagePlus,
  ArrowUp,
  ArrowDown,
  Star,
  Calculator,
} from 'lucide-react-native';
import { RootStackParamList } from '../types/navigation';
import { Ingredient, RecipeCategory } from '../types';
import { palette as staticPalette, spacing, radii, strokes, layout } from '../theme/tokens';
import {
  Typography,
  Input,
  Button,
  HeaderBar,
} from '../components/common';
import { useRecipes } from '../context/RecipeContext';
import { useTheme } from '../context/ThemeContext';
import { triggerHaptic, triggerHapticNotification } from '../utils/haptics';
import { calculateWaterFromRatio } from '../utils/recipeMath';

type Props = {
  route: RouteProp<RootStackParamList, 'Form'>;
  navigation: NativeStackNavigationProp<RootStackParamList, 'Form'>;
};

const CATEGORIES: RecipeCategory[] = ['Kopi Panas', 'Kopi Dingin', 'Non-Kopi'];

const FormScreen: React.FC<Props> = ({ route, navigation }) => {
  const { recipe, isDuplicate } = route.params || {};
  const isEditMode = Boolean(recipe && !isDuplicate);
  const { addRecipe, updateRecipe } = useRecipes();
  const { palette } = useTheme();

  const initialName = recipe
    ? isDuplicate
      ? `${recipe.name} (Salinan)`
      : recipe.name
    : '';

  const [name, setName] = useState(initialName);
  const [category, setCategory] = useState<RecipeCategory>(recipe?.category || 'Kopi Panas');
  const [ingredients, setIngredients] = useState<Ingredient[]>(
    recipe?.ingredients
      ? recipe.ingredients.map((i, idx) => ({ ...i, id: i.id || `${Date.now()}_${idx}` }))
      : []
  );
  const [steps, setSteps] = useState(recipe?.steps || '');
  const [notes, setNotes] = useState(recipe?.notes || '');
  const [imageUri, setImageUri] = useState<string | undefined>(recipe?.imageUri);
  const [rating, setRating] = useState<number>(recipe?.rating || 0);
  const [tags, setTags] = useState<string[]>(recipe?.tags || []);
  const [tagInput, setTagInput] = useState('');

  // Ingredient add/edit state
  const [editingIngId, setEditingIngId] = useState<string | null>(null);
  const [ingName, setIngName] = useState('');
  const [ingAmount, setIngAmount] = useState('');
  const [ingUnit, setIngUnit] = useState('g');

  // Ratio calculator state
  const [showCalc, setShowCalc] = useState(false);
  const [calcCoffee, setCalcCoffee] = useState('15');
  const [calcRatio, setCalcRatio] = useState('15');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; ingredients?: string }>({});
  const bypassUnsavedPrompt = useRef(false);

  const hasUnsavedChanges =
    name.trim() !== initialName.trim() ||
    steps.trim() !== (recipe?.steps || '').trim() ||
    notes.trim() !== (recipe?.notes || '').trim() ||
    imageUri !== recipe?.imageUri ||
    rating !== (recipe?.rating || 0) ||
    ingredients.length !== (recipe?.ingredients?.length || 0);

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (bypassUnsavedPrompt.current || !hasUnsavedChanges) {
        return;
      }
      e.preventDefault();
      Alert.alert(
        'Buang Perubahan?',
        'Perubahan pada resep ini belum disimpan. Yakin ingin keluar?',
        [
          { text: 'Tetap di Sini', style: 'cancel' },
          {
            text: 'Buang',
            style: 'destructive',
            onPress: () => navigation.dispatch(e.data.action),
          },
        ]
      );
    });
    return unsubscribe;
  }, [navigation, hasUnsavedChanges]);

  const calculatedWater = calculateWaterFromRatio(
    Number(calcCoffee.replace(',', '.')),
    Number(calcRatio.replace(',', '.'))
  );

  const handleApplyRatio = () => {
    if (calculatedWater <= 0) {
      Alert.alert('Perhatian', 'Masukkan berat kopi dan rasio yang valid.');
      return;
    }
    triggerHaptic();
    const now = Date.now();
    setIngredients((prev) => [
      ...prev,
      { id: `${now}_c`, name: 'Biji kopi', amount: calcCoffee.trim(), unit: 'g' },
      { id: `${now}_w`, name: 'Air seduh', amount: String(calculatedWater), unit: 'ml' },
    ]);
    setShowCalc(false);
    if (errors.ingredients) {
      setErrors((prev) => ({ ...prev, ingredients: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    if (!name.trim()) newErrors.name = 'Nama resep wajib diisi';
    if (ingredients.length === 0) newErrors.ingredients = 'Tambahkan minimal 1 bahan';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveIngredient = () => {
    if (!ingName.trim() || !ingAmount.trim()) {
      Alert.alert('Perhatian', 'Isi nama bahan dan takaran terlebih dahulu.');
      return;
    }

    triggerHaptic();
    if (editingIngId) {
      setIngredients((prev) =>
        prev.map((item) =>
          item.id === editingIngId
            ? {
                ...item,
                name: ingName.trim(),
                amount: ingAmount.trim(),
                unit: ingUnit.trim() || 'g',
              }
            : item
        )
      );
      setEditingIngId(null);
    } else {
      setIngredients((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          name: ingName.trim(),
          amount: ingAmount.trim(),
          unit: ingUnit.trim() || 'g',
        },
      ]);
    }

    setIngName('');
    setIngAmount('');
    if (errors.ingredients) {
      setErrors((prev) => ({ ...prev, ingredients: undefined }));
    }
  };

  const handleStartEditIngredient = (item: Ingredient) => {
    triggerHaptic();
    setEditingIngId(item.id);
    setIngName(item.name);
    setIngAmount(item.amount);
    setIngUnit(item.unit);
  };

  const handleMoveIngredient = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= ingredients.length) return;
    triggerHaptic();
    const copy = [...ingredients];
    const temp = copy[index];
    copy[index] = copy[target];
    copy[target] = temp;
    setIngredients(copy);
  };

  const handleRemoveIngredient = (id: string) => {
    triggerHaptic();
    if (editingIngId === id) {
      setEditingIngId(null);
      setIngName('');
      setIngAmount('');
    }
    setIngredients((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddTag = () => {
    const clean = tagInput.trim().replace(/^#/, '');
    if (!clean) return;
    if (!tags.some((t) => t.toLowerCase() === clean.toLowerCase())) {
      triggerHaptic();
      setTags((prev) => [...prev, clean]);
    }
    setTagInput('');
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Izin Diperlukan',
        'Izinkan akses galeri foto untuk menambahkan foto hasil seduhan.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      triggerHaptic();
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    triggerHapticNotification();

    try {
      if (isEditMode && recipe) {
        const success = await updateRecipe({
          ...recipe,
          name: name.trim(),
          category,
          ingredients,
          steps: steps.trim(),
          notes: notes.trim(),
          imageUri,
          tags,
          rating: rating > 0 ? rating : undefined,
        });
        setIsSubmitting(false);
        if (success) {
          bypassUnsavedPrompt.current = true;
          navigation.goBack();
        } else {
          Alert.alert('Error', 'Gagal memperbarui resep.');
        }
      } else {
        const success = await addRecipe({
          name: name.trim(),
          category,
          ingredients,
          steps: steps.trim(),
          notes: notes.trim(),
          imageUri,
          tags,
          rating: rating > 0 ? rating : undefined,
          isTried: false,
          isFavorite: false,
        });
        setIsSubmitting(false);
        if (success) {
          bypassUnsavedPrompt.current = true;
          navigation.goBack();
        } else {
          Alert.alert('Error', 'Gagal menyimpan resep.');
        }
      }
    } catch {
      setIsSubmitting(false);
      Alert.alert('Error', 'Terjadi kesalahan sistem.');
    }
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: palette.canvas }]}
      edges={['top', 'left', 'right']}
    >
      <HeaderBar
        title={isEditMode ? 'Edit Resep' : isDuplicate ? 'Duplikat Resep' : 'Resep Baru'}
        onBack={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Category Picker */}
          <View style={styles.section}>
            <Typography variant="subheadlineMedium" color="primary" style={styles.label}>
              Kategori
            </Typography>
            <View style={[styles.segmentContainer, { backgroundColor: palette.surfaceSubdued }]}>
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => {
                      triggerHaptic();
                      setCategory(cat);
                    }}
                    style={[
                      styles.segmentButton,
                      isSelected && { backgroundColor: palette.surface },
                    ]}
                  >
                    <Typography
                      variant="caption"
                      style={[
                        styles.segmentText,
                        { color: isSelected ? palette.textPrimary : palette.textSecondary },
                        isSelected && styles.segmentTextActive,
                      ]}
                    >
                      {cat}
                    </Typography>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Recipe Photo */}
          <View style={styles.section}>
            <Typography variant="subheadlineMedium" color="primary" style={styles.label}>
              Foto Hasil Seduhan (Opsional)
            </Typography>
            {imageUri ? (
              <View style={styles.imagePreviewWrapper}>
                <Image source={{ uri: imageUri }} style={styles.imagePreview} />
                <TouchableOpacity
                  onPress={() => {
                    triggerHaptic();
                    setImageUri(undefined);
                  }}
                  style={styles.removeImageBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <X size={16} color={palette.textInverse} strokeWidth={2.25} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={handlePickImage}
                activeOpacity={0.75}
                style={[
                  styles.imagePickerBox,
                  { backgroundColor: palette.surfaceSubdued, borderColor: palette.borderStrong },
                ]}
              >
                <ImagePlus size={20} color={palette.textSecondary} strokeWidth={1.75} />
                <Typography variant="callout" color="secondary" style={styles.imagePickerText}>
                  Pilih foto dari galeri
                </Typography>
              </TouchableOpacity>
            )}
          </View>

          {/* Recipe Name */}
          <Input
            label="Nama Resep"
            placeholder="Contoh: V60 Ethiopia Guji"
            value={name}
            onChangeText={(text) => {
              setName(text);
              if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
            }}
            error={errors.name}
          />

          {/* Ingredients + Ratio Calculator */}
          <View style={styles.section}>
            <View style={styles.ingHeaderRow}>
              <Typography variant="subheadlineMedium" color="primary">
                Bahan-Bahan (Ketuk untuk edit)
              </Typography>
              <TouchableOpacity
                onPress={() => {
                  triggerHaptic();
                  setShowCalc((prev) => !prev);
                }}
                style={styles.calcToggle}
              >
                <Calculator size={14} color={palette.accent} strokeWidth={2} />
                <Typography variant="caption" color="accent" style={styles.calcToggleText}>
                  {showCalc ? 'Tutup Rasio' : 'Kalkulator Rasio'}
                </Typography>
              </TouchableOpacity>
            </View>

            {showCalc ? (
              <View style={[styles.calcBox, { backgroundColor: palette.surfaceSubdued }]}>
                <View style={styles.calcInputsRow}>
                  <View style={styles.calcHalf}>
                    <Input
                      label="Kopi (g)"
                      value={calcCoffee}
                      onChangeText={setCalcCoffee}
                      keyboardType="numeric"
                      containerStyle={styles.compactInput}
                    />
                  </View>
                  <View style={styles.calcHalf}>
                    <Input
                      label="Rasio (1 : X)"
                      value={calcRatio}
                      onChangeText={setCalcRatio}
                      keyboardType="numeric"
                      containerStyle={styles.compactInput}
                    />
                  </View>
                </View>
                <View style={styles.calcResultRow}>
                  <Typography variant="subheadlineMedium" color="primary" tabular>
                    Air dibutuhkan: {calculatedWater} ml
                  </Typography>
                  <TouchableOpacity onPress={handleApplyRatio}>
                    <Typography variant="caption" color="accent" style={styles.applyRatioText}>
                      + Isi ke Bahan
                    </Typography>
                  </TouchableOpacity>
                </View>
              </View>
            ) : null}

            {ingredients.length > 0 && (
              <View style={[styles.ingredientsList, { borderColor: palette.divider }]}>
                {ingredients.map((item, index) => {
                  const isEditingThis = editingIngId === item.id;
                  return (
                    <View
                      key={item.id}
                      style={[
                        styles.ingredientRow,
                        index === ingredients.length - 1 && styles.ingredientRowLast,
                        { borderBottomColor: palette.divider },
                        isEditingThis && { backgroundColor: palette.accentLight },
                      ]}
                    >
                      <TouchableOpacity
                        style={styles.ingTapArea}
                        onPress={() => handleStartEditIngredient(item)}
                      >
                        <Typography variant="bodyMedium" color="primary" tabular style={styles.ingMeasure}>
                          {item.amount} {item.unit}
                        </Typography>
                        <Typography variant="body" color="secondary" style={styles.ingName}>
                          {item.name}
                        </Typography>
                      </TouchableOpacity>

                      <View style={styles.ingRowActions}>
                        <TouchableOpacity
                          onPress={() => handleMoveIngredient(index, -1)}
                          disabled={index === 0}
                          style={styles.moveBtn}
                        >
                          <ArrowUp
                            size={14}
                            color={index === 0 ? palette.textTertiary : palette.textSecondary}
                            strokeWidth={2}
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleMoveIngredient(index, 1)}
                          disabled={index === ingredients.length - 1}
                          style={styles.moveBtn}
                        >
                          <ArrowDown
                            size={14}
                            color={
                              index === ingredients.length - 1
                                ? palette.textTertiary
                                : palette.textSecondary
                            }
                            strokeWidth={2}
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleRemoveIngredient(item.id)}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                          style={styles.removeIngBtn}
                        >
                          <X size={16} color={palette.textTertiary} strokeWidth={2} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            {errors.ingredients && (
              <Typography variant="caption" color="danger" style={styles.errorText}>
                {errors.ingredients}
              </Typography>
            )}

            <View style={styles.addRow}>
              <View style={styles.inputFlexName}>
                <Input
                  placeholder="Nama bahan"
                  value={ingName}
                  onChangeText={setIngName}
                  containerStyle={styles.compactInput}
                />
              </View>
              <View style={styles.inputFlexAmount}>
                <Input
                  placeholder="Jml"
                  value={ingAmount}
                  onChangeText={setIngAmount}
                  keyboardType="numeric"
                  containerStyle={styles.compactInput}
                />
              </View>
              <View style={styles.inputFlexUnit}>
                <Input
                  placeholder="g"
                  value={ingUnit}
                  onChangeText={setIngUnit}
                  containerStyle={styles.compactInput}
                />
              </View>
            </View>

            <View style={styles.ingActionRow}>
              <View style={styles.ingSaveBtnFlex}>
                <Button
                  variant="secondary"
                  size="compact"
                  icon={<Plus size={15} color={palette.textPrimary} strokeWidth={2} />}
                  onPress={handleSaveIngredient}
                >
                  {editingIngId ? 'Simpan Perubahan Bahan' : 'Tambah Bahan'}
                </Button>
              </View>
              {editingIngId ? (
                <TouchableOpacity
                  onPress={() => {
                    setEditingIngId(null);
                    setIngName('');
                    setIngAmount('');
                  }}
                  style={styles.cancelEditBtn}
                >
                  <Typography variant="caption" color="secondary">
                    Batal
                  </Typography>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>

          {/* Rating & Tags */}
          <View style={styles.section}>
            <Typography variant="subheadlineMedium" color="primary" style={styles.label}>
              Rating Rasa (Opsional)
            </Typography>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => {
                    triggerHaptic();
                    setRating((prev) => (prev === star ? 0 : star));
                  }}
                  style={styles.starBtn}
                >
                  <Star
                    size={22}
                    color={star <= rating ? palette.statusStar : palette.textTertiary}
                    fill={star <= rating ? palette.statusStar : 'transparent'}
                    strokeWidth={1.75}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Typography variant="subheadlineMedium" color="primary" style={styles.label}>
              Tag (Opsional)
            </Typography>
            <View style={styles.tagInputRow}>
              <View style={styles.tagInputFlex}>
                <Input
                  placeholder="Misal: Arabica, Pagi, Manis"
                  value={tagInput}
                  onChangeText={setTagInput}
                  onSubmitEditing={handleAddTag}
                  returnKeyType="done"
                  containerStyle={styles.compactInput}
                />
              </View>
              <TouchableOpacity
                onPress={handleAddTag}
                style={[styles.tagAddBtn, { backgroundColor: palette.surfaceSubdued }]}
              >
                <Plus size={18} color={palette.textPrimary} strokeWidth={2} />
              </TouchableOpacity>
            </View>

            {tags.length > 0 && (
              <View style={styles.tagsWrap}>
                {tags.map((t) => (
                  <TouchableOpacity
                    key={t}
                    onPress={() => {
                      triggerHaptic();
                      setTags((prev) => prev.filter((item) => item !== t));
                    }}
                    style={[styles.tagChip, { backgroundColor: palette.surfaceSubdued }]}
                  >
                    <Typography variant="caption" color="secondary">
                      #{t} ×
                    </Typography>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Steps */}
          <Input
            label="Langkah Seduh"
            placeholder={'1. Giling 15g biji kopi\n2. Tuang 45ml blooming 30 detik\n3. Tuang bertahap hingga 225ml'}
            value={steps}
            onChangeText={setSteps}
            multiline
            numberOfLines={4}
            style={styles.multilineInput}
            helper="Pisahkan tiap langkah dengan baris baru."
          />

          {/* Notes */}
          <Input
            label="Catatan (Opsional)"
            placeholder="Catatan rasa, ukuran gilingan, atau suhu air..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            style={styles.multilineInput}
          />

          <View style={styles.submitSection}>
            <Button
              variant="primary"
              size="default"
              loading={isSubmitting}
              onPress={handleSubmit}
            >
              {isEditMode ? 'Simpan Perubahan' : 'Simpan Resep'}
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const palette = staticPalette;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.canvas,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.lg,
    paddingBottom: spacing.huge,
  },
  section: {
    marginBottom: spacing.lg,
  },
  label: {
    marginBottom: spacing.xs,
  },
  segmentContainer: {
    flexDirection: 'row',
    borderRadius: radii.md,
    padding: 3,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.sm,
  },
  segmentText: {
    fontWeight: '500',
  },
  segmentTextActive: {
    fontWeight: '600',
  },
  ingHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  calcToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  calcToggleText: {
    marginLeft: 4,
    fontWeight: '600',
  },
  calcBox: {
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  calcInputsRow: {
    flexDirection: 'row',
    marginHorizontal: -4,
  },
  calcHalf: {
    flex: 1,
    marginHorizontal: 4,
  },
  calcResultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  applyRatioText: {
    fontWeight: '600',
  },
  ingredientsList: {
    marginBottom: spacing.md,
    borderTopWidth: strokes.hairline,
    borderBottomWidth: strokes.hairline,
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
  ingTapArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ingMeasure: {
    width: 78,
  },
  ingName: {
    flex: 1,
    marginRight: spacing.xs,
  },
  ingRowActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moveBtn: {
    padding: 4,
    marginLeft: 2,
  },
  removeIngBtn: {
    padding: 4,
    marginLeft: 4,
  },
  errorText: {
    marginBottom: spacing.sm,
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  inputFlexName: {
    flex: 2.1,
    marginRight: 6,
  },
  inputFlexAmount: {
    flex: 1,
    marginRight: 6,
  },
  inputFlexUnit: {
    flex: 0.85,
  },
  compactInput: {
    marginBottom: spacing.xs,
  },
  ingActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ingSaveBtnFlex: {
    flex: 1,
  },
  cancelEditBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starBtn: {
    marginRight: spacing.sm,
    paddingVertical: 4,
  },
  tagInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagInputFlex: {
    flex: 1,
    marginRight: spacing.sm,
  },
  tagAddBtn: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  tagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.xs,
  },
  tagChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.round,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  multilineInput: {
    minHeight: 88,
    textAlignVertical: 'top',
    paddingTop: spacing.sm,
  },
  submitSection: {
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  imagePickerBox: {
    height: 84,
    borderRadius: radii.md,
    borderWidth: strokes.hairline,
    borderStyle: 'dashed',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePickerText: {
    marginLeft: spacing.sm,
  },
  imagePreviewWrapper: {
    position: 'relative',
    borderRadius: radii.md,
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: 190,
    borderRadius: radii.md,
  },
  removeImageBtn: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 28,
    height: 28,
    borderRadius: radii.round,
    backgroundColor: 'rgba(26, 23, 21, 0.72)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default FormScreen;
