// Grille d’actions rapides sur l’écran d’accueil (ajout de bien, tâches,
// réservations, prestations, accès aux devis et factures).
import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';


interface QuickActionsGridProps {
  colors: any;
  styles: any;
  onAddBien: () => void;
  onAddTache: () => void;
  onAddReservation: () => void;
  onAddPrestation: () => void;
  onAddDevis: () => void;
  onAddFacture?: () => void;
  onGoToRepertoireProprietaire?: () => void;
}

const QuickActionsGrid: React.FC<QuickActionsGridProps> = ({ colors, styles, onAddBien, onAddTache, onAddReservation, onAddPrestation, onAddDevis, onAddFacture, onGoToRepertoireProprietaire }) => (
  <View style={styles.quickActionsGrid}>
    <View style={styles.quickActionsRow}>
      <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.primary }]} onPress={onAddBien}>
        <View style={styles.centerContent}>
          <MaterialCommunityIcons name="plus-circle" size={24} color={colors.surface} style={styles.icon} />
          <Text style={[styles.actionText, { color: colors.surface }]}>Ajouter un bien</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.primary }]} onPress={onAddTache}>
        <View style={styles.centerContent}>
          <MaterialCommunityIcons name="playlist-plus" size={24} color={colors.surface} style={styles.icon} />
          <Text style={[styles.actionText, { color: colors.surface }]}>Mes tâches</Text>
        </View>
      </TouchableOpacity>
    </View>
    <View style={styles.quickActionsRow}>
      <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.primary }]} onPress={onAddReservation}>
        <View style={styles.centerContent}>
          <MaterialCommunityIcons name="calendar-plus" size={24} color={colors.surface} style={styles.icon} />
          <Text style={[styles.actionText, { color: colors.surface }]}>Ajouter une résa</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.primary }]} onPress={onAddPrestation}> 
        <View style={styles.centerContent}>
          <FontAwesome5 name="user-plus" size={22} color={colors.surface} style={styles.icon} />
          <Text style={[styles.actionText, { color: colors.surface }]}>Ajouter une prestation</Text>
        </View>
      </TouchableOpacity>
    </View>
    <View style={styles.quickActionsRow}>
      <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.primary }]} onPress={onAddDevis}> 
        <View style={styles.centerContent}>
          <MaterialCommunityIcons name="file-document-edit" size={24} color={colors.surface} style={styles.icon} />
          <Text style={[styles.actionText, { color: colors.surface }]}>Mes devis</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.actionBtn, { backgroundColor: colors.primary }]}
        onPress={onAddFacture}
        disabled={!onAddFacture}
      >
        <View style={styles.centerContent}>
          <MaterialCommunityIcons name="file-document-outline" size={24} color={colors.surface} style={styles.icon} />
          <Text style={[styles.actionText, { color: colors.surface }]}>Mes factures</Text>
        </View>
      </TouchableOpacity>
    </View>
    {/* Bouton Répertoire Propriétaire supprimé */}
  </View>
);

export default QuickActionsGrid;
