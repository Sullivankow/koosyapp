import React from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

/**
 * Barre de recherche et tri pour la liste des biens
 * Props :
 * - value : texte de recherche
 * - onChange : callback pour modifier la recherche
 * - sortOrder : 'asc' ou 'desc' pour l'ordre de tri
 * - onToggleSort : callback pour changer l'ordre de tri
 * - colors : palette de couleurs du thème
 */
const BiensSearchBar = ({ value, onChange, sortOrder, onToggleSort, colors }: any) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 8, marginTop: 18 }}>
    <TextInput
      style={{
        flex: 1,
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        color: colors.text
      }}
      placeholder="Rechercher un bien..."
      placeholderTextColor={colors.textSecondary}
      value={value}
      onChangeText={onChange}
    />
    <TouchableOpacity
      style={{ marginLeft: 8, padding: 8, backgroundColor: colors.primary, borderRadius: 8 }}
      onPress={onToggleSort}
    >
      <MaterialCommunityIcons
        name={sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'}
        size={24}
        color={colors.surface}
      />
    </TouchableOpacity>
  </View>
);

export default BiensSearchBar;