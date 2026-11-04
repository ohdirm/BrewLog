import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { Recipe, Ingredient, RecipeCategory } from '../types';
import { colors, spacing, typography } from '../theme/colors';

type Props = {
  route: RouteProp<RootStackParamList, 'Form'>;
  navigation: NativeStackNavigationProp<RootStackParamList, 'Form'>;
};

const FormScreen: React.FC<Props> = ({ route, navigation }) => {
  const { recipe } = route.params || {};

  const [name, setName] = useState(recipe?.name || '');
  const [category, setCategory] = useState<RecipeCategory>(recipe?.category || 'Kopi Panas');
  const [ingredients, setIngredients] = useState<Ingredient[]>(
    recipe?.ingredients || []
  );
  const [steps, setSteps] = useState(recipe?.steps || '');
  const [notes, setNotes] = useState(recipe?.notes || '');
  const [newIngredient, setNewIngredient] = useState({ name: '', amount: '', unit: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validasi input (nama wajib, minimal 1 bahan)
  const validate = (): boolean => {
    if (!name.trim()) {
      Alert.alert('Peringatan', 'Nama resep tidak boleh kosong');
      return false;
    }
    if (ingredients.length === 0) {
      Alert.alert('Peringatan', 'Minimal 1 bahan wajib diisi');
      return false;
    }
    return true;
  };

  // Tambah bahan baru
  const addIngredient = () => {
    if (!newIngredient.name.trim() || !newIngredient.amount.trim()) {
      Alert.alert('Peringatan', 'Nama dan jumlah bahan wajib diisi');
      return;
    }
    setIngredients([
      ...ingredients,
      {
        id: Date.now().toString(),
        name: newIngredient.name.trim(),
        amount: newIngredient.amount.trim(),
        unit: newIngredient.unit.trim() || 'pcs',
      },
    ]);
    setNewIngredient({ name: '', amount: '', unit: '' });
  };

  // Hapus bahan dari list
  const removeIngredient = (id: string) => {
    setIngredients(ingredients.filter((ing) => ing.id !== id));
  };

  // Simpan resep (tambah atau edit)
  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);

    // Simulasi loading
    await new Promise((res) => setTimeout(res, 800));

    if (recipe) {
      // Edit mode
      const success = await (navigation as any).parent?.getParam('updateRecipe', async () => {
        // Fallback: call parent update via context
        return false;
      })();
      if (success) navigation.goBack();
    } else {
      // Add mode
      const success = await (navigation as any).parent?.getParam('addRecipe', async () => {
        return false;
      })();
      if (success) navigation.goBack();
    }
    setIsSubmitting(false);
  };

  // Mock handlers (satu tempat di parent, tapi di form ini kita terima navigation props)
  // Karena React Navigation v6, kita akses via route.params dari parent component

  return (
    <KeyboardAvoidingView
      style={styles.wrapper}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <Text style={styles.title}>
          {recipe ? 'Edit Resep' : 'Tambah Resep Baru'}
        </Text>
        <Text style={styles.subtitle}>
          {recipe ? 'Perbarui resep favoritmu' : 'Catat racikan kopi favoritmu'}
        </Text>

        {/* Nama Resep */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nama Resep *</Text>
          <TextInput
            style={styles.input}
            placeholder="Contoh: Cold Brew Tanpa Asam"
            value={name}
            onChangeText={setName}
          />
        </View>

        {/* Kategori */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Kategori</Text>
          <View style={styles.segmentContainer}>
            {(['Kopi Panas', 'Kopi Dingin', 'Non-Kopi'] as RecipeCategory[]).map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.segmentButton,
                  category === cat && styles.segmentButtonActive,
                ]}
                onPress={() => setCategory(cat)}
              >
                <Text
                  style={[
                    styles.segmentButtonText,
                    category === cat && styles.segmentButtonTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Daftar Bahan */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Bahan (min. 1) *</Text>
          <View style={styles.ingredientInputRow}>
            <TextInput
              style={[styles.ingredientInput, { flex: 1 }]}
              placeholder="Nama bahan"
              value={newIngredient.name}
              onChangeText={(text) => setNewIngredient({ ...newIngredient, name: text })}
            />
            <TextInput
              style={[styles.ingredientInput, { flex: 1 }]}
              placeholder="Jumlah"
              value={newIngredient.amount}
              onChangeText={(text) => setNewIngredient({ ...newIngredient, amount: text })}
              keyboardType="numeric"
            />
            <TextInput
              style={[styles.ingredientInput, { flex: 0.7 }]}
              placeholder="Satuan"
              value={newIngredient.unit}
              onChangeText={(text) => setNewIngredient({ ...newIngredient, unit: text })}
            />
            <TouchableOpacity style={styles.addButton} onPress={addIngredient}>
              <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>
          </View>

          {/* List bahan yang sudah ditambahkan */}
          <FlatList
            data={ingredients}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.ingredientItem}>
                <Text style={styles.ingredientText}>
                  {item.amount} {item.unit} {item.name}
                </Text>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeIngredient(item.id)}
                >
                  <Text style={styles.removeButtonText}>❌</Text>
                </TouchableOpacity>
              </View>
            )}
            ListEmptyComponent={
              <Text style={styles.noIngredients}>Belum ada bahan ditambahkan</Text>
            }
          />
        </View>

        {/* Langkah Pembuatan */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Langkah Pembuatan</Text>
          <TextInput
            style={[styles.input, { height: 120 }]}
            placeholder="Deskripsikan cara membuatnya..."
            value={steps}
            onChangeText={setSteps}
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* Catatan Pribadi */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Catatan Pribadi (opsional)</Text>
          <TextInput
            style={[styles.input, { height: 80 }]}
            placeholder="Tips atau catatan khusus..."
            value={notes}
            onChangeText={setNotes}
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* Tombol Simpan */}
        <TouchableOpacity
          style={[styles.saveButton, isSubmitting && styles.saveButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Text style={styles.saveButtonText}>Menyimpan...</Text>
          ) : (
            <Text style={styles.saveButtonText}>{recipe ? 'Update Resep' : 'Simpan Resep'}</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    padding: spacing.lg,
    paddingBottom: 100,
  },
  title: {
    ...typography.h1,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: spacing.md,
    fontSize: 15,
    color: colors.text,
    minHeight: 48,
  },
  segmentContainer: {
    flexDirection: 'row',
    gap: spacing.xs,
    borderRadius: 10,
    overflow: 'hidden',
  },
  segmentButton: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  segmentButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  segmentButtonText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  segmentButtonTextActive: {
    color: colors.textLight,
  },
  ingredientInputRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  ingredientInput: {
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: spacing.md,
    fontSize: 14,
    color: colors.text,
  },
  addButton: {
    backgroundColor: colors.accent,
    borderRadius: 10,
    padding: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: colors.textLight,
    fontSize: 20,
    fontWeight: '700',
  },
  ingredientItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.xs,
  },
  ingredientText: {
    color: colors.text,
    fontSize: 14,
  },
  removeButton: {
    padding: 4,
  },
  removeButtonText: {
    color: colors.danger,
    fontSize: 16,
  },
  noIngredients: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
  saveButton: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: spacing.lg,
    height: 50,
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: colors.primaryLight,
  },
  saveButtonText: {
    color: colors.textLight,
    fontSize: 16,
    fontWeight: '700',
  },
});

export default FormScreen;
