// En-tête réutilisable avec un titre et un bouton "ajouter" à droite.
// Utilisé sur plusieurs écrans de listes (biens, devis, factures, etc.).
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface HeaderWithAddButtonProps {
  title: string;
  onAdd: () => void;
  colors: any;
  style?: object;
  buttonLabel?: string;
}

const HeaderWithAddButton: React.FC<HeaderWithAddButtonProps> = ({ title, onAdd, colors, style, buttonLabel }) => (
  <View style={[styles.headerSticky, { backgroundColor: colors.surface }, style]}> 
    <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
    <TouchableOpacity style={[styles.addBtn, { backgroundColor: colors.primary }]} onPress={onAdd}>
      <MaterialCommunityIcons name="plus" size={22} color={colors.surface} />
      {buttonLabel && <Text style={[styles.btnLabel, { color: colors.surface, marginLeft: 6 }]}>{buttonLabel}</Text>}
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  headerSticky: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderColor: '#eee',
    zIndex: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    paddingVertical: 8,
    paddingHorizontal: 18,
    elevation: 2,
  },
  btnLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HeaderWithAddButton;
