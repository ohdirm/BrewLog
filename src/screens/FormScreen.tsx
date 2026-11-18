import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Layers,
  ListOrdered,
  FileText,
  Plus,
  Trash2,
  Check,
} from 'lucide-react-native';
import { RootStackParamList } from '../types/navigation';
import { Ingredient, RecipeCategory } from '../types';
import { palette, spacing, radii, strokes, layout } from '../theme/tokens';
import {
  Typography,
  Input,
  Button,
  HeaderBar,
  SurfaceCard,
} from '../components/common';
import { useRecipes } from '../context/RecipeContext';
import { triggerHaptic, triggerHapticNotification } from '../utils/haptics';

type Props = {
  route: RouteProp<RootStackParamList, 'Form'>;
  navigation: NativeStackNavigationProp<RootStackParamList, 'Form'>;
};

const CATEGORIES: RecipeCategory[] = ['Kopi Panas', 'Kopi Dingin', 'Non-Kopi'];

const FormScreen: React.FC<Props> = ({ route, navigation }) => {
  const { recipe } = route.params || {};
  const { addRecipe, updateRecipe } = useRecipes();

  const [name, setName] = useState(recipe?.name || '');
  const [category, setCategory] = useState<RecipeCategory>(recipe?.category || 'Kopi Panas');
  const [ingredients, setIngredients] = useState<Ingredient[]>(recipe?.ingredients || []);
  const [steps, setSteps] = useState(recipe?.steps || '');
  const [notes, setNotes] = useState(recipe?.notes || '');

  // New Ingredient input fields
  const [ingName, setIngName] = useState('');
  const [ingAmount, setIngAmount] = useState('');
  const [ingUnit, setIngUnit] = useState('g');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; ingredients?: string }>({});

  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    if (!name.trim()) newErrors.name = 'Nama racikan wajib diisi';
    if (ingredients.length === 0)
      newErrors.ingredients = 'Tambahkan minimal 1 bahan racikan';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddIngredient = () => {
    if (!ingName.trim() || !ingAmount.trim()) {
      Alert.alert('Perhatian', 'Isi nama bahan dan takarannya terlebih dahulu.');
      return;
    }

    triggerHaptic();
    setIngredients((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        name: ingName.trim(),
        amount: ingAmount.trim(),
        unit: ingUnit.trim() || 'g',
      },
    ]);

    setIngName('');
    setIngAmount('');
    if (errors.ingredients) {
      setErrors((prev) => ({ ...prev, ingredients: undefined }));
    }
  };

  const handleRemoveIngredient = (id: string) => {
    triggerHaptic();
    setIngredients((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    triggerHapticNotification();

    try {
      if (recipe) {
        const success = await updateRecipe({
          ...recipe,
          name: name.trim(),
          category,
          ingredients,
          steps: steps.trim(),
          notes: notes.trim(),
        });
        setIsSubmitting(false);
        if (success) {
          navigation.goBack();
        } else {
          Alert.alert('Error', 'Gagal memperbarui resep. Coba lagi.');
        }
      } else {
        const success = await addRecipe({
          name: name.trim(),
          category,
          ingredients,
          steps: steps.trim(),
          notes: notes.trim(),
          isTried: false,
          isFavorite: false,
        });
        setIsSubmitting(false);
        if (success) {
          navigation.goBack();
        } else {
          Alert.alert('Error', 'Gagal menyimpan resep. Coba lagi.');
        }
      }
    } catch {
      setIsSubmitting(false);
      Alert.alert('Error', 'Terjadi kesalahan sistem.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <HeaderBar
        title={recipe ? 'Perbarui Resep' : 'Racik Resep Baru'}
        subtitle={recipe ? 'Ubah takaran & catatan' : 'Katalog seduhan personal'}
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
          {/* Category Picker Segment */}
          <View style={styles.section}>
            <Typography variant="subheadlineMedium" color="primary" style={styles.sectionLabel}>
              Kategori Minuman
            </Typography>
            <View style={styles.segmentContainer}>
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
                      isSelected && styles.segmentButtonActive,
                    ]}
                  >
                    <Typography
                      variant="caption"
                      style={[
                        styles.segmentText,
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

          {/* Recipe Name */}
          <View style={styles.section}>
            <Input
              label="Nama Racikan *"
              placeholder="Contoh: Japanese Iced Filter V60"
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
              }}
              error={errors.name}
            />
          </View>

          {/* Ingredients Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Layers size={16} color={palette.accent} strokeWidth={2} />
              <Typography variant="subheadlineMedium" color="primary" style={styles.sectionLabel}>
                Komposisi & Takaran *
              </Typography>
            </View>

            {/* List of current ingredients */}
            {ingredients.length > 0 ? (
              <SurfaceCard style={styles.ingredientsListCard}>
                {ingredients.map((item, index) => (
                  <View
                    key={item.id}
                    style={[
                      styles.ingredientItemRow,
                      index === ingredients.length - 1 && styles.ingredientItemRowLast,
                    ]}
                  >
                    <View style={styles.ingredientInfo}>
                      <Typography variant="bodyMedium" color="primary" tabular>
                        {item.amount} {item.unit}
                      </Typography>
                      <Typography variant="body" color="secondary" style={styles.ingredientNameText}>
                        {item.name}
                      </Typography>
                    </View>

                    <TouchableOpacity
                      onPress={() => handleRemoveIngredient(item.id)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      style={styles.removeIngBtn}
                    >
                      <Trash2 size={16} color={palette.statusDanger} strokeWidth={1.75} />
                    </TouchableOpacity>
                  </View>
                ))}
              </SurfaceCard>
            ) : null}

            {errors.ingredients && (
              <Typography variant="caption" color="danger" style={styles.errorText}>
                {errors.ingredients}
              </Typography>
            )}

            {/* Input to add new ingredient */}
            <SurfaceCard subdued style={styles.addIngredientCard}>
              <Typography variant="caption" color="secondary" style={styles.addCardTitle}>
                Tambah Bahan Baru
              </Typography>

              <View style={styles.addInputsGrid}>
                <View style={styles.inputFlexName}>
                  <Input
                    placeholder="Nama (misal: Biji Gayo)"
                    value={ingName}
                    onChangeText={setIngName}
                    containerStyle={styles.compactInputContainer}
                  />
                </View>
                <View style={styles.inputFlexAmount}>
                  <Input
                    placeholder="Takaran"
                    value={ingAmount}
                    onChangeText={setIngAmount}
                    keyboardType="numeric"
                    containerStyle={styles.compactInputContainer}
                  />
                </View>
                <View style={styles.inputFlexUnit}>
                  <Input
                    placeholder="g / ml"
                    value={ingUnit}
                    onChangeText={setIngUnit}
                    containerStyle={styles.compactInputContainer}
                  />
                </View>
              </View>

              <Button
                variant="secondary"
                size="compact"
                icon={<Plus size={16} color={palette.textPrimary} strokeWidth={2} />}
                onPress={handleAddIngredient}
                style={styles.addIngSubmitBtn}
              >
                Tambahkan Bahan
              </Button>
            </SurfaceCard>
          </View>

          {/* Steps */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <ListOrdered size={16} color={palette.accent} strokeWidth={2} />
              <Typography variant="subheadlineMedium" color="primary" style={styles.sectionLabel}>
                Langkah Seduh
              </Typography>
            </View>
            <Input
              placeholder={'1. Giling 15g biji kopi (medium)\n2. Basahi filter paper\n3. Tuang 45g blooming 30 detik\n4. Tuang sisa air hingga 225g'}
              value={steps}
              onChangeText={setSteps}
              multiline
              numberOfLines={4}
              style={styles.multilineInput}
              helper="Tip: Pisahkan tiap tahapan dengan baris baru."
            />
          </View>

          {/* Barista Notes */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <FileText size={16} color={palette.accent} strokeWidth={2} />
              <Typography variant="subheadlineMedium" color="primary" style={styles.sectionLabel}>
                Catatan Rasa & Brewing Notes (Opsional)
              </Typography>
            </View>
            <Input
              placeholder="Contoh: Note rasa floral jasmine dengan aftertaste brown sugar bersih. Waktu seduh total 2 menit 15 detik."
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              style={styles.multilineInput}
            />
          </View>

          {/* Submit Action */}
          <View style={styles.submitSection}>
            <Button
              variant="primary"
              size="default"
              loading={isSubmitting}
              onPress={handleSubmit}
              icon={<Check size={18} color={palette.textInverse} strokeWidth={2.5} />}
            >
              {recipe ? 'Simpan Pembaruan' : 'Simpan ke Katalog Resep'}
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

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
    paddingTop: spacing.md,
    paddingBottom: spacing.huge,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  sectionLabel: {
    marginLeft: 4,
    marginBottom: spacing.xs,
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: palette.surfaceSubdued,
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
  segmentButtonActive: {
    backgroundColor: palette.surface,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  segmentText: {
    color: palette.textSecondary,
    fontWeight: '500',
  },
  segmentTextActive: {
    color: palette.textPrimary,
    fontWeight: '700',
  },
  ingredientsListCard: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  ingredientItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: strokes.hairline,
    borderBottomColor: palette.divider,
  },
  ingredientItemRowLast: {
    borderBottomWidth: 0,
  },
  ingredientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  ingredientNameText: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  removeIngBtn: {
    padding: spacing.xs,
    marginLeft: spacing.sm,
  },
  errorText: {
    marginBottom: spacing.sm,
  },
  addIngredientCard: {
    padding: spacing.md,
  },
  addCardTitle: {
    marginBottom: spacing.sm,
    fontWeight: '600',
  },
  addInputsGrid: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  inputFlexName: {
    flex: 2,
    marginRight: 6,
  },
  inputFlexAmount: {
    flex: 1.1,
    marginRight: 6,
  },
  inputFlexUnit: {
    flex: 0.9,
  },
  compactInputContainer: {
    marginBottom: spacing.xs,
  },
  addIngSubmitBtn: {
    marginTop: spacing.xs,
  },
  multilineInput: {
    minHeight: 90,
    textAlignVertical: 'top',
    paddingTop: spacing.sm,
  },
  submitSection: {
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
});

export default FormScreen;
