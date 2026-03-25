import React from 'react';
import { View, TouchableOpacity, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

/**
 * Composant ButtonAction
 * Affiche les boutons d'action principaux (éditer/sauvegarder, annuler, supprimer) pour une carte Bien.
 * Props :
 *   - isEditing : booléen, mode édition ou non
 *   - colors : palette de couleurs pour le thème
 *   - onEditPress : callback pour éditer/sauvegarder
 *   - onCancelEdit : callback pour annuler l'édition
 *   - onDelete : callback pour supprimer (reçoit l'id du bien)
 *   - bienId : identifiant du bien (pour suppression)
 */
interface ButtonActionProps {
  isEditing: boolean;
  colors: any;
  onEditPress: () => void;
  onCancelEdit: () => void;
  onDelete: (bienId: string) => void;
  bienId: string;
}

const ButtonAction: React.FC<ButtonActionProps> = ({ isEditing, colors, onEditPress, onCancelEdit, onDelete, bienId }) => (
  <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12 }}>
    {/* Bouton éditer ou sauvegarder */}
    <TouchableOpacity style={{ backgroundColor: isEditing ? colors.primary : colors.secondary, borderRadius: 24, padding: 12, marginRight: 8 }} onPress={onEditPress}>
      <MaterialCommunityIcons name={isEditing ? 'content-save' : 'pencil'} size={20} color={colors.surface} />
    </TouchableOpacity>
    {/* Bouton annuler en mode édition */}
    {isEditing ? (
      <TouchableOpacity style={{ backgroundColor: colors.error, borderRadius: 24, padding: 12, marginRight: 8 }} onPress={onCancelEdit}>
        <MaterialCommunityIcons name="close" size={20} color={colors.surface} />
      </TouchableOpacity>
    ) : (
      // Bouton supprimer hors édition
      <TouchableOpacity
        style={{ backgroundColor: colors.error, borderRadius: 24, padding: 12, marginRight: 8 }}
        onPress={() => {
          Alert.alert(
            'Confirmation',
            'Êtes-vous sûr de vouloir supprimer ce bien ?',
            [
              { text: 'Annuler', style: 'cancel' },
              { text: 'Supprimer', style: 'destructive', onPress: () => onDelete(bienId) },
            ]
          );
        }}
      >
        <MaterialCommunityIcons name="delete" size={20} color={colors.surface} />
      </TouchableOpacity>
    )}
  </View>
);

export default ButtonAction;