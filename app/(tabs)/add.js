import { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  SafeAreaView,
} from 'react-native';
import { CoffeeContext } from '../../context/CoffeeContext';
import { router } from 'expo-router';

const METHODS = ['V60', 'Espresso', 'French Press', 'Cold Brew', 'Aeropress', 'Chemex'];

export default function AddScreen() {
  const { addRecipe, addTodo } = useContext(CoffeeContext);
  const [recipe, setRecipe] = useState({
    name: '',
    method: 'V60',
    coffeeWeight: 15,
    waterVolume: 250,
    grindSize: 'Medium',
    ratio: '1:16',
    notes: '',
  });
  const [scheduleTodo, setScheduleTodo] = useState(false);

  const handleSave = async () => {
    if (!recipe.name.trim()) {
      Alert.alert('Error', 'Nama resep wajib diisi');
      return;
    }

    try {
      const newRecipe = await addRecipe(recipe);
      if (scheduleTodo) {
        await addTodo({
          recipeId: newRecipe.id,
          recipeName: newRecipe.name,
        });
      }
      Alert.alert('Berhasil', 'Resep berhasil disimpan');
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Gagal menyimpan resep');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tambah Resep Baru</Text>
      </View>

      <ScrollView contentContainerStyle={styles.formContent}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Nama Minuman</Text>
          <TextInput
            style={styles.input}
            placeholder="Contoh: V60 Ethiopian"
            placeholderTextColor="#8A5D3B"
            value={recipe.name}
            onChangeText={(text) => setRecipe({ ...recipe, name: text })}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Metode Seduh</Text>
          <View style={styles.methodSelector}>
            {METHODS.map((method) => (
              <TouchableOpacity
                key={method}
                style={[
                  styles.methodOption,
                  recipe.method === method && styles.methodOptionSelected,
                ]}
                onPress={() => setRecipe({ ...recipe, method })}
              >
                <Text
                  style={[
                    styles.methodText,
                    recipe.method === method && styles.methodTextSelected,
                  ]}
                >
                  {method}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.formRow}>
          <View style={styles.formGroupHalf}>
            <Text style={styles.label}>Kopi (g)</Text>
            <TextInput
              style={styles.input}
              placeholder="15"
              placeholderTextColor="#8A5D3B"
              value={String(recipe.coffeeWeight)}
              onChangeText={(text) =>
                setRecipe({ ...recipe, coffeeWeight: Number(text) || 0 })
              }
              keyboardType="numeric"
            />
          </View>

          <View style={styles.formGroupHalf}>
            <Text style={styles.label}>Air (ml)</Text>
            <TextInput
              style={styles.input}
              placeholder="250"
              placeholderTextColor="#8A5D3B"
              value={String(recipe.waterVolume)}
              onChangeText={(text) =>
                setRecipe({ ...recipe, waterVolume: Number(text) || 0 })
              }
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.formRow}>
          <View style={styles.formGroupHalf}>
            <Text style={styles.label}>Grind Size</Text>
            <TextInput
              style={styles.input}
              placeholder="Contoh: Medium-Fine"
              placeholderTextColor="#8A5D3B"
              value={recipe.grindSize}
              onChangeText={(text) => setRecipe({ ...recipe, grindSize: text })}
            />
          </View>

          <View style={styles.formGroupHalf}>
            <Text style={styles.label}>Ratio</Text>
            <TextInput
              style={styles.input}
              placeholder="Contoh: 1:16"
              placeholderTextColor="#8A5D3B"
              value={recipe.ratio}
              onChangeText={(text) => setRecipe({ ...recipe, ratio: text })}
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Catatan Rasa</Text>
          <TextInput
            style={[styles.input, styles.notesInput]}
            placeholder="Deskripsikan rasa, aroma, dan teknik seduh..."
            placeholderTextColor="#8A5D3B"
            value={recipe.notes}
            onChangeText={(text) => setRecipe({ ...recipe, notes: text })}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.formGroup}>
          <View style={styles.scheduleRow}>
            <Text style={styles.scheduleLabel}>Jadwalkan ke To-Do Hari Ini</Text>
            <Switch
              value={scheduleTodo}
              onValueChange={setScheduleTodo}
              trackColor={{ false: '#D4A373', true: '#8A5D3B' }}
              thumbColor="#FAF7F2"
            />
          </View>
          <Text style={styles.scheduleHint}>
            Jika diaktifkan, resep baru akan otomatis masuk ke checklist to-do
          </Text>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Simpan Resep</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F2',
  },
  header: {
    padding: 20,
    backgroundColor: '#2B1E16',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FAF7F2',
  },
  formContent: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  formGroupHalf: {
    flex: 1,
    marginRight: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8A5D3B',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FAF7F2',
    padding: 12,
    borderRadius: 10,
    fontSize: 16,
    color: '#2B1E16',
    borderColor: '#D4A373',
    borderWidth: 1,
  },
  notesInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  methodSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  methodOption: {
    backgroundColor: '#FAF7F2',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderColor: '#D4A373',
    borderWidth: 1,
  },
  methodOptionSelected: {
    backgroundColor: '#8A5D3B',
    borderColor: '#8A5D3B',
  },
  methodText: {
    color: '#2B1E16',
    fontSize: 14,
  },
  methodTextSelected: {
    color: '#FAF7F2',
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scheduleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2B1E16',
  },
  scheduleHint: {
    fontSize: 12,
    color: '#8A5D3B',
    marginTop: 5,
  },
  saveButton: {
    backgroundColor: '#8A5D3B',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FAF7F2',
  },
});
