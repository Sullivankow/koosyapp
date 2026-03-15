import BadgeStatus from '../../components/BadgeStatus';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import AddTachesModal from '../../components/AddTachesModal';
import PlusButton from '../../components/PlusButton';
import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import styles from './TachesScreen.styles';
import { useTaches } from '../../hooks/useTaches';

// Écran principal des tâches
function TachesScreen() {
  const { colors } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'à faire' | 'terminée'>('à faire');

  // Utilisation du hook personnalisé pour la gestion des tâches
  const {
    taches,
    loading,
    error,
    successMsg,
    handleDelete,
    handleMarkTerminee,
    handleMarkStatut,
    handleDeleteAllTerminees,
    setSuccessMsg,
    fetchTaches,
  } = useTaches();

  // Formatage simple de la date en DD/MM/YYYY
  function formatDateFr(dateStr?: string) {
    if (!dateStr) return '';
    const isoMatch = dateStr.match(/^\d{4}-(\d{2})-(\d{2})/);
    if (isoMatch) {
      const [, y, m, d] = isoMatch;
      return `${d}/${m}/${y}`;
    }
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  // Tri des tâches : statut (à faire, en cours, terminée) puis date d'échéance (plus proche d'abord)
  const statutOrder: Record<string, number> = { 'à faire': 0, 'en cours': 1, 'terminée': 2 };
  // Filtrage selon l'onglet sélectionné
  const filteredTaches = taches.filter(t =>
    selectedTab === 'à faire' ? t.statut !== 'terminée' : t.statut === 'terminée'
  );
  const sortedTaches = [...filteredTaches].sort((a, b) => {
    if (statutOrder[a.statut] !== statutOrder[b.statut]) {
      return statutOrder[a.statut] - statutOrder[b.statut];
    }
    const dateA = a.dateEcheance ? new Date(a.dateEcheance) : new Date(8640000000000000);
    const dateB = b.dateEcheance ? new Date(b.dateEcheance) : new Date(8640000000000000);
    return dateA.getTime() - dateB.getTime();
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      {/* Affichage du message de succès */}
      {successMsg && (
        <View style={styles.successMsgBox}>
          <Text style={styles.successMsgText}>{successMsg}</Text>
        </View>
      )}
      {/* Affichage d'une erreur éventuelle */}
      {error && (
        <View style={styles.successMsgBox}>
          <Text style={[styles.successMsgText, { color: colors.error }]}>{error}</Text>
        </View>
      )}
      {/* Titre principal */}
      <Text style={styles.pageTitle}>Mes tâches</Text>
      {/* Onglets */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tabBtn, selectedTab === 'à faire' && styles.tabBtnActive]}
          onPress={() => setSelectedTab('à faire')}
        >
          <Text style={[styles.tabText, selectedTab === 'à faire' && styles.tabTextActive]}>À faire</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, selectedTab === 'terminée' && styles.tabBtnTermineeActive]}
          onPress={() => setSelectedTab('terminée')}
        >
          <Text style={[styles.tabText, selectedTab === 'terminée' && styles.tabTextActive]}>Terminée</Text>
        </TouchableOpacity>
      </View>
      {/* Liste des tâches */}
      <FlatList
        data={sortedTaches}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
        ListEmptyComponent={<Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 40 }}>Aucune tâche</Text>}
        renderItem={({ item }) => {
          const dateAffichee = item.dateEcheance ? formatDateFr(item.dateEcheance) : '';
          // Couleur de bordure gauche selon le statut
          const statutColor = {
            'à faire': '#FF7043',
            'en cours': '#FFA726',
            'terminée': '#43A047',
          };
          return (
            <View style={[styles.card, { backgroundColor: '#fff', borderLeftWidth: 6, borderLeftColor: statutColor[item.statut] || colors.primary }]}> 
              {/* Header avec titre et corbeille */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={[styles.cardTitle, { color: '#000' }]}>{item.titre}</Text>
                <TouchableOpacity
                  style={{ padding: 4 }}
                  onPress={() => {
                    Alert.alert(
                      'Confirmation',
                      'Voulez-vous vraiment supprimer cette tâche ?',
                      [
                        { text: 'Annuler', style: 'cancel' },
                        {
                          text: 'Supprimer',
                          style: 'destructive',
                          onPress: () => handleDelete(item.id),
                        },
                      ]
                    );
                  }}
                >
                  <MaterialCommunityIcons name="delete" size={20} color={colors.error} />
                </TouchableOpacity>
              </View>
              {/* Titre du bien associé */}
              {item.bienTitre ? (
                <Text style={[styles.cardBien, { color: '#1976D2' }]}>Bien : {item.bienTitre}</Text>
              ) : null}
              <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>{item.description}</Text>
              {dateAffichee ? (
                <Text style={[styles.cardDate, { color: colors.textSecondary }]}>Échéance : {dateAffichee}</Text>
              ) : null}
              {/* Les deux badges côte à côte, toujours visibles */}
              <View style={[styles.cardActions, { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 }]}> 
                <TouchableOpacity
                  onPress={() => handleMarkStatut(item.id, 'à faire')}
                  activeOpacity={0.7}
                  disabled={item.statut === 'à faire'}
                  style={{ opacity: item.statut === 'à faire' ? 1 : 0.5 }}
                >
                  <BadgeStatus statut={'à faire'} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleMarkTerminee(item.id)}
                  activeOpacity={0.7}
                  disabled={item.statut === 'terminée'}
                  style={{ opacity: item.statut === 'terminée' ? 1 : 0.5 }}
                >
                  <BadgeStatus statut={'terminée'} />
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />
      {/* Bouton suppression toutes les tâches terminées en bas */}
      {selectedTab === 'terminée' && (
        <TouchableOpacity
          style={{
            backgroundColor: '#e53935',
            paddingVertical: 8,
            paddingHorizontal: 18,
            borderRadius: 20,
            alignSelf: 'center',
            marginBottom: 24,
            minWidth: 0,
            alignItems: 'center',
          }}
          onPress={handleDeleteAllTerminees}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 13 }}>Tout supprimer</Text>
        </TouchableOpacity>
      )}
      {/* Bouton pour ouvrir le modal d'ajout de tâche */}
      <PlusButton onPress={() => setModalVisible(true)} backgroundColor={colors.primary} iconColor={colors.surface} />
      {/* Modal d'ajout de tâche */}
      <AddTachesModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          fetchTaches(); // Rafraîchir la liste après ajout
        }}
        onSuccess={() => {
          setModalVisible(false);
          fetchTaches();
        }}
      />
    </View>
  );
}

export default TachesScreen;
