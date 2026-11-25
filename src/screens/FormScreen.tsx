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
import { Plus, X } from 'lucide-react-native';
import { RootStackParamList } from '../types/navigation';
import { Ingredient, RecipeCategory } from '../types';
import { palette, spacing, radii, strokes, layout } from '../theme/tokens';
import {
  Typography,
  Input,
  Button,
  HeaderBar,
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

  const [ingName, setIngName] = useState('');
  const [ingAmount, setIngAmount] = useState('');
  const [ingUnit, setIngUnit] = useState('g');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; ingredients?: string }>({});

  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    if (!name.trim()) newErrors.name = 'Nama resep wajib diisi';
    if (ingredients.length === 0)
      newErrors.ingredients = 'Tambahkan minimal 1 bahan';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddIngredient = () => {
    if (!ingName.trim() || !ingAmount.trim()) {
      Alert.alert('Perhatian', 'Isi nama bahan dan takaran terlebih dahulu.');
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
          Alert.alert('Error', 'Gagal memperbarui resep.');
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
          Alert.alert('Error', 'Gagal menyimpan resep.');
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
        title={recipe ? 'Edit Resep' : 'Resep Baru'}
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

          {/* Ingredients */}
          <View style={styles.section}>
            <Typography variant="subheadlineMedium" color="primary" style={styles.label}>
              Bahan-Bahan
            </Typography>

            {ingredients.length > 0 && (
              <View style={styles.ingredientsList}>
                {ingredients.map((item, index) => (
                  <View
                    key={item.id}
                    style={[
                      styles.ingredientRow,
                      index === ingredients.length - 1 && styles.ingredientRowLast,
                    ]}
                  >
                    <Typography variant="bodyMedium" color="primary" tabular style={styles.ingMeasure}>
                      {item.amount} {item.unit}
                    </Typography>
                    <Typography variant="body" color="secondary" style={styles.ingName}>
                      {item.name}
                    </Typography>
                    <TouchableOpacity
                      onPress={() => handleRemoveIngredient(item.id)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <X size={16} color={palette.textTertiary} strokeWidth={2} />
                    </TouchableOpacity>
                  </View>
                ))}
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

            <Button
              variant="secondary"
              size="compact"
              icon={<Plus size={15} color={palette.textPrimary} strokeWidth={2} />}
              onPress={handleAddIngredient}
            >
              Tambah Bahan
            </Button>
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
              {recipe ? 'Simpan Perubahan' : 'Simpan Resep'}
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
  },
  segmentText: {
    color: palette.textSecondary,
    fontWeight: '500',
  },
  segmentTextActive: {
    color: palette.textPrimary,
    fontWeight: '600',
  },
  ingredientsList: {
    marginBottom: spacing.md,
    borderTopWidth: strokes.hairline,
    borderTopColor: palette.divider,
    borderBottomWidth: strokes.hairline,
    borderBottomColor: palette.divider,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: strokes.hairline,
    borderBottomColor: palette.divider,
  },
  ingredientRowLast: {
    borderBottomWidth: 0,
  },
  ingMeasure: {
    width: 82,
  },
  ingName: {
    flex: 1,
    marginRight: spacing.sm,
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
  multilineInput: {
    minHeight: 88,
    textAlignVertical: 'top',
    paddingTop: spacing.sm,
  },
  submitSection: {
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
});

export default FormScreen;
