// Modale de sélection de statut pour un bien ou une entité
// - Affiche la liste des statuts possibles
// - Permet de choisir un statut et le remonter au parent via onSelect
// - Met en surbrillance le statut actuellement sélectionné

import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

// Type des valeurs possibles de statut
export type StatusValue = 'disponible' | 'occupé';

// Représentation d'une option de statut affichée dans la modale
interface StatusOption {
  label: string;
  value: StatusValue;
}

interface StatusModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (status: StatusValue) => void;
  currentStatus?: StatusValue;
}

// Liste des statuts proposés à l'utilisateur
const STATUS_OPTIONS: StatusOption[] = [
  { label: 'Disponible', value: 'disponible' },
  { label: 'Occupé', value: 'occupé' },
];

const StatusModal: React.FC<StatusModalProps> = ({ visible, onClose, onSelect, currentStatus }) => {
  const { colors } = useTheme();
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.surface }]}> 
          <Text style={styles.title}>Choisir le statut</Text>
            {STATUS_OPTIONS.map(option => {
              const isSelected = currentStatus === option.value;
              return (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionBtn,
                    isSelected && { backgroundColor: `${colors.primary}22`, borderColor: colors.primary },
                  ]}
                  onPress={() => {
                    onSelect(option.value);
                    onClose();
                  }}
                >
                  <Text style={[styles.optionText, isSelected && { color: colors.primary, fontWeight: '700' }]}>{option.label}</Text>
                </TouchableOpacity>
              );
            })}
          <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
            <Text style={styles.cancelText}>Annuler</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    minWidth: 220,
    alignItems: 'center',
    elevation: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 18,
    color: '#333',
  },
  optionBtn: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f5f5f5',
    width: '100%',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
    color: '#222',
  },
  
  cancelBtn: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
  cancelText: {
    color: '#d32f2f',
    fontWeight: 'bold',
    fontSize: 15,
  },
});

export default StatusModal;
