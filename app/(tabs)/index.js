import { useContext, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { CoffeeContext } from '../../context/CoffeeContext';
import { router } from 'expo-router';

export default function BrewingTodoScreen() {
  const { todos, toggleTodo, deleteTodo, getProgress, getTotalTodos, getCompletedTodos } =
    useContext(CoffeeContext);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleDelete = (id) => {
    Alert.alert('Hapus Tugas', 'Apakah Anda yakin ingin menghapus tugas ini?', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus', style: 'destructive', onPress: () => deleteTodo(id) },
    ]);
  };

  const renderTodoItem = ({ item }) => (
    <TouchableOpacity style={styles.todoItem} onPress={() => toggleTodo(item.id)}>
      <View style={styles.todoContent}>
        <View style={styles.todoTextContainer}>
          <View
            style={[
              styles.checkbox,
              item.completed && styles.checkboxChecked,
            ]}
          />
          <Text
            style={[
              styles.todoText,
              item.completed && styles.todoTextCompleted,
            ]}
          >
            {item.recipeName}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(item.id)}
        >
          <Text style={styles.deleteText}>Hapus</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (todos.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>Belum Ada Tugas</Text>
        <Text style={styles.emptySubtitle}>
          Belum ada seduhan yang dijadwalkan. Tambah resep baru untuk memulai!
        </Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/(tabs)/add')}
        >
          <Text style={styles.addButtonText}>+ Tambah Resep</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Seduh Hari Ini</Text>
      </View>

      <View style={styles.statsContainer}>
        <Text style={styles.statsLabel}>Progress Minggu Ini</Text>
        <View style={styles.statsRow}>
          <Text style={styles.statsNumber}>{getCompletedTodos()}</Text>
          <Text style={styles.statsSeparator}>/</Text>
          <Text style={styles.statsNumber}>{getTotalTodos()}</Text>
        </View>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${getProgress()}%` },
            ]}
          />
        </View>
        <Text style={styles.progressPercent}>{getProgress()}%</Text>
      </View>

      <FlatList
        data={todos}
        renderItem={renderTodoItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
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
  statsContainer: {
    padding: 20,
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginTop: 15,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  statsLabel: {
    fontSize: 14,
    color: '#8A5D3B',
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  statsNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2B1E16',
  },
  statsSeparator: {
    fontSize: 24,
    color: '#D4A373',
    marginHorizontal: 5,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#D4A373',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8A5D3B',
    borderRadius: 4,
  },
  progressPercent: {
    fontSize: 12,
    color: '#8A5D3B',
    marginTop: 5,
    textAlign: 'right',
  },
  listContent: {
    padding: 15,
  },
  todoItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  todoContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  todoTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D4A373',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: '#8A5D3B',
    borderColor: '#8A5D3B',
  },
  todoText: {
    fontSize: 16,
    color: '#2B1E16',
    flex: 1,
  },
  todoTextCompleted: {
    textDecorationLine: 'line-through',
    color: '#8A5D3B',
  },
  deleteButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FAF7F2',
    borderRadius: 8,
  },
  deleteText: {
    color: '#8A5D3B',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
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
    marginBottom: 30,
  },
  addButton: {
    backgroundColor: '#8A5D3B',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FAF7F2',
  },
});
