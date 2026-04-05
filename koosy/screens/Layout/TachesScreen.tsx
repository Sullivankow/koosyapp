// Écran listant les tâches de l'utilisateur.
// - S'appuie sur le hook `useTaches` pour charger et mettre à jour les tâches
// - Permet de filtrer entre tâches "à faire" et "terminées"
// - Offre des actions rapides (marquer terminée, revenir à "à faire", supprimer, tout supprimer).
import BadgeStatus from '../../ui/BadgeStatus';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import AddTachesModal from '../../components/modals/AddTachesModal';

import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import styles from './styles/TachesScreen.styles';
import { useTaches } from '../../hooks/useTaches';
import { useGlobalRefresh } from '../../contexts/GlobalRefreshContext';

const getContrastTextColor = (hexColor: string) => {
  const sanitized = hexColor.replace('#', '');
  if (!/^[0-9a-fA-F]{6}$/.test(sanitized)) return '#fff';
  const r = parseInt(sanitized.slice(0, 2), 16);
  const g = parseInt(sanitized.slice(2, 4), 16);
  const b = parseInt(sanitized.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? '#111' : '#fff';
};

// Écran principal des tâches
function TachesScreen() {
  const { colors } = useTheme();
  const activeStatusTextColor = getContrastTextColor(colors.primary);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'à faire' | 'terminée'>('à faire');
  const { lastRefresh } = useGlobalRefresh();

  // Utilisation du hook personnalisé pour la gestion des tâches
  const {
    taches,
    error,
    successMsg,
    handleDelete,
    handleMarkTerminee,
    handleMarkStatut,
    handleDeleteAllTerminees,
    fetchTaches,
  } = useTaches();

  // Rafraîchir les tâches quand le signal global change
  useEffect(() => {
    fetchTaches();
  }, [lastRefresh]);

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
      {/* Header sticky avec bouton + */}
      <View style={[styles.headerSticky, { backgroundColor: colors.surface }]}> 
        <Text style={[styles.title, { color: colors.text }]}>Mes tâches</Text>
        <TouchableOpacity style={[styles.addBtn, { backgroundColor: colors.primary }]} onPress={() => setModalVisible(true)}>
          <MaterialCommunityIcons name="plus" size={22} color={colors.surface} />
        </TouchableOpacity>
      </View>
      {/* Onglets */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[
            styles.tabBtn,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
            selectedTab === 'à faire' && {
              backgroundColor: colors.primary,
              borderColor: colors.primary,
            },
          ]}
          onPress={() => setSelectedTab('à faire')}
        >
          <Text
            style={[
              styles.tabText,
              { color: selectedTab === 'à faire' ? activeStatusTextColor : colors.text },
            ]}
          >
            À faire
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabBtn,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
            selectedTab === 'terminée' && {
              backgroundColor: colors.primary,
              borderColor: colors.primary,
            },
          ]}
          onPress={() => setSelectedTab('terminée')}
        >
          <Text
            style={[
              styles.tabText,
              { color: selectedTab === 'terminée' ? activeStatusTextColor : colors.text },
            ]}
          >
            Terminée
          </Text>
        </TouchableOpacity>
      </View>
      {/* Titre bleu sous les onglets, comme sur ReservationScreen */}
      <Text style={{ fontSize: 26, fontWeight: 'bold', color: colors.primary, margin: 18, marginTop: 8, marginBottom: 8 }}>
        {selectedTab === 'à faire' ? 'Tâches à faire' : 'Tâches terminées'}
      </Text>
      {/* Liste des tâches */}
      <FlatList
        data={sortedTaches}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
        ListEmptyComponent={<Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 40 }}>Aucune tâche</Text>}
        renderItem={({ item }) => {
          const dateAffichee = item.dateEcheance ? formatDateFr(item.dateEcheance) : '';
          return (
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, borderLeftWidth: 6, borderLeftColor: colors.primary }]}> 
              {/* Header avec titre et corbeille */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={[styles.cardTitle, { color: colors.primary }]}>{item.titre}</Text>
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
                  <MaterialCommunityIcons name="delete" size={20} color={colors.primary} />
                </TouchableOpacity>
              </View>
              {/* Titre du bien associé */}
              {item.bienTitre ? (
                <Text style={[styles.cardBien, { color: colors.primary }]}>Bien : {item.bienTitre}</Text>
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
                  <BadgeStatus statut={'à faire'} style={{ backgroundColor: colors.primary }} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleMarkTerminee(item.id)}
                  activeOpacity={0.7}
                  disabled={item.statut === 'terminée'}
                  style={{ opacity: item.statut === 'terminée' ? 1 : 0.5 }}
                >
                  <BadgeStatus statut={'terminée'} style={{ backgroundColor: colors.primary }} />
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
            backgroundColor: colors.primary,
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
          <Text style={{ color: activeStatusTextColor, fontWeight: 'bold', fontSize: 13 }}>Tout supprimer</Text>
        </TouchableOpacity>
      )}
      {/* Bouton pour ouvrir le modal d'ajout de tâche */}

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
