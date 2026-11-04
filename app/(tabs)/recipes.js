import { useContext, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { CoffeeContext } from '../../context/CoffeeContext';

const METHOD_COLORS = {
  V60: '#E6D3A7',
  Espresso: '#8B4513',
  'French Press': '#A0522D',
  'Cold Brew': '#4B3621',
  'Aeropress': '#CD853F',
  'Chemex': '#F5DEB3',
};

export default function RecipesScreen() {
  const { recipes } = useContext(CoffeeContext);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRecipes = recipes.filter((recipe) => {
    const query = searchQuery.toLowerCase();
    return (
      recipe.name.toLowerCase().includes(query) ||
      recipe.method.toLowerCase().includes(query)
    );
  });

  const getMethodColor = (method) => {
    return METHOD_COLORS[method] || '#D4A373';
  };

  const renderRecipeCard = ({ item }) => (
    <View style={styles.recipeCard}>
      <View style={[styles.methodBadge, { backgroundColor: getMethodColor(item.method) }]}>
        <Text style={styles.methodText}>{item.method}</Text>
      </View>

      <Text style={styles.recipeName}>{item.name}</Text>

      <View style={styles.recipeInfo}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>☕ Kopi:</Text>
          <Text style={styles.infoValue}>{item.coffeeWeight}g</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>💧 Air:</Text>
          <Text style={styles.infoValue}>{item.waterVolume}ml</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Grinding:</Text>
          <Text style={styles.infoValue}>{item.grindSize}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Ratio:</Text>
          <Text style={styles.infoValue}>{item.ratio}</Text>
        </View>
      </View>

      <View style={styles.notesContainer}>
        <Text style={styles.notesLabel}>📝 Catatan:</Text>
        <Text style={styles.notesText}>{item.notes}</Text>
      </View>
    </View>
  );

  if (recipes.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>Belum Ada Resep</Text>
        <Text style={styles.emptySubtitle}>
          Belum ada resep tersimpan. Tambah resep baru untuk memulai!
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Resep Kopi</Text>
        <Text style={styles.subtitle}>{recipes.length} resep tersimpan</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Cari resep atau metode..."
          placeholderTextColor="#8A5D3B"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredRecipes}
        renderItem={renderRecipeCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              Tidak ada resep yang cocok dengan "{searchQuery}"
            </Text>
          </View>
        }
      />
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
  subtitle: {
    fontSize: 14,
    color: '#D4A373',
    marginTop: 4,
  },
  searchContainer: {
    padding: 15,
    backgroundColor: '#fff',
  },
  searchInput: {
    backgroundColor: '#FAF7F2',
    padding: 12,
    borderRadius: 10,
    fontSize: 16,
    color: '#2B1E16',
    borderColor: '#D4A373',
    borderWidth: 1,
  },
  listContent: {
    padding: 15,
  },
  recipeCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    marginBottom: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  methodBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 10,
  },
  methodText: {
    color: '#2B1E16',
    fontWeight: 'bold',
    fontSize: 14,
  },
  recipeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2B1E16',
    marginBottom: 12,
  },
  recipeInfo: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoLabel: {
    fontSize: 14,
    color: '#8A5D3B',
    fontWeight: '600',
    marginRight: 6,
  },
  infoValue: {
    fontSize: 14,
    color: '#2B1E16',
    flex: 1,
  },
  notesContainer: {
    backgroundColor: '#FAF7F2',
    padding: 10,
    borderRadius: 8,
  },
  notesLabel: {
    fontSize: 13,
    color: '#8A5D3B',
    fontWeight: '600',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 13,
    color: '#555',
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    backgroundColor: '#FAF7F2',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8A5D3B',
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#D4A373',
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#8A5D3B',
  },
});
