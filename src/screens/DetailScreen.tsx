import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { colors, spacing, typography } from '../theme/colors';
import { useRecipes } from '../context/RecipeContext';

type Props = {
  route: RouteProp<RootStackParamList, 'Detail'>;
  navigation: NativeStackNavigationProp<RootStackParamList, 'Detail'>;
};

const DetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { recipeId } = route.params;
  const { recipes, toggleTried, toggleFavorite, deleteRecipe } = useRecipes();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const recipe = recipes.find((r) => r.id === recipeId);

  if (!recipe) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Resep tidak ditemukan</Text>
      </View>
    );
  }

  // Toggle status sudah dicoba
  const handleToggleTried = async () => {
    await toggleTried(recipe.id);
  };

  // Toggle status favorit
  const handleToggleFavorite = async () => {
    await toggleFavorite(recipe.id);
  };

  // Konfirmasi dan hapus
  const handleDelete = async () => {
    setShowDeleteModal(false);
    Alert.alert('Hapus Resep', `Yakin ingin menghapus "${recipe.name}"?`, [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: async () => {
          const success = await deleteRecipe(recipe.id);
          if (success) {
            navigation.goBack();
          } else {
            Alert.alert('Gagal', 'Gagal menghapus resep');
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header: nama + status */}
        <View style={styles.header}>
          <Text style={styles.recipeName}>{recipe.name}</Text>
          <View style={styles.statusRow}>
            {/* Toggle favorit */}
            <TouchableOpacity style={styles.statusButton} onPress={handleToggleFavorite}>
              <Text style={[styles.star, recipe.isFavorite && styles.starFilled]}>
                {recipe.isFavorite ? '⭐' : '☆'}
              </Text>
              <Text style={styles.statusText}>Favorit</Text>
            </TouchableOpacity>

            {/* Toggle sudah dicoba */}
            <TouchableOpacity style={styles.statusButton} onPress={handleToggleTried}>
              <Text style={[styles.check, recipe.isTried && styles.checkActive]}>
                {recipe.isTried ? '✅' : '⏳'}
              </Text>
              <Text style={styles.statusText}>{recipe.isTried ? 'Dicoba' : 'Belum'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Kategori */}
        <View style={styles.categoryContainer}>
          <Text style={styles.categoryBadge}>{recipe.category}</Text>
        </View>

        {/* Daftar Bahan */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bahan-Bahan</Text>
          <FlatList
            data={recipe.ingredients}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.ingredientRow}>
                <Text style={styles.ingredientAmount}>
                  {item.amount} {item.unit}
                </Text>
                <Text style={styles.ingredientName}>{item.name}</Text>
              </View>
            )}
            ListEmptyComponent={<Text style={styles.emptyText}>-</Text>}
          />
        </View>

        {/* Langkah Pembuatan */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Langkah Pembuatan</Text>
          <Text style={styles.stepsText}>{recipe.steps || '-'}</Text>
        </View>

        {/* Catatan Pribadi */}
        {recipe.notes ? (
          <View style={[styles.section, styles.notesSection]}>
            <Text style={styles.sectionTitle}>Catatan Pribadi</Text>
            <Text style={styles.notesText}>{recipe.notes}</Text>
          </View>
        ) : null}

        {/* Tombol Edit & Hapus */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => navigation.navigate('Form', { recipe })}
          >
            <Text style={styles.actionButtonText}>✏️ Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => setShowDeleteModal(true)}
          >
            <Text style={styles.actionButtonText}>🗑️ Hapus</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal Konfirmasi Hapus */}
      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Hapus Resep</Text>
            <Text style={styles.modalText}>
              Yakin ingin menghapus resep "{recipe.name}"? Tindakan ini tidak bisa dibatalkan.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setShowDeleteModal(false)}
              >
                <Text style={styles.modalButtonTextCancel}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={handleDelete}
              >
                <Text style={styles.modalButtonTextConfirm}>Hapus</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  containerError: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  errorText: {
    color: colors.danger,
    fontSize: 16,
  },
  header: {
    padding: spacing.lg,
    backgroundColor: colors.primary,
  },
  recipeName: {
    ...typography.h1,
    color: colors.textLight,
    marginBottom: spacing.md,
  },
  statusRow: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  statusButton: {
    alignItems: 'center',
  },
  star: {
    fontSize: 24,
    marginBottom: 4,
  },
  starFilled: {
    color: colors.star,
  },
  check: {
    fontSize: 24,
    marginBottom: 4,
  },
  checkActive: {
    color: colors.success,
  },
  statusText: {
    color: colors.textLight,
    fontSize: 11,
    fontWeight: '600',
  },
  categoryContainer: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  categoryBadge: {
    fontSize: 12,
    color: colors.primary,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    fontWeight: '700',
  },
  section: {
    padding: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptyText: {
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  ingredientAmount: {
    color: colors.primaryLight,
    fontWeight: '700',
    marginRight: spacing.sm,
    minWidth: 60,
  },
  ingredientName: {
    color: colors.text,
    fontSize: 14,
  },
  stepsText: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'justify',
  },
  notesSection: {
    backgroundColor: colors.inputBg,
    borderRadius: 12,
  },
  notesText: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.lg,
    paddingHorizontal: spacing.md,
    marginTop: 20,
  },
  actionButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
  },
  editButton: {
    backgroundColor: colors.accent,
  },
  deleteButton: {
    backgroundColor: colors.danger,
  },
  actionButtonText: {
    color: colors.textLight,
    fontSize: 15,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.lg,
    width: '80%',
    maxWidth: 320,
  },
  modalTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
  },
  modalButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: colors.border,
  },
  modalButtonConfirm: {
    backgroundColor: colors.danger,
  },
  modalButtonTextCancel: {
    color: colors.text,
    fontSize: 14,
  },
  modalButtonTextConfirm: {
    color: colors.textLight,
    fontSize: 14,
  },
});

export default DetailScreen;
