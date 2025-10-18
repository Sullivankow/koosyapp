import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface StatusModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (status: string) => void;
  currentStatus?: string;
}

const STATUS_OPTIONS = [
  { label: 'Disponible', value: 'disponible' },
  { label: 'Occupé', value: 'occupé' },
];

const StatusModal: React.FC<StatusModalProps> = ({ visible, onClose, onSelect, currentStatus }) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Choisir le statut</Text>
          {STATUS_OPTIONS.map(option => (
            <TouchableOpacity
              key={option.value}
              style={[styles.optionBtn, currentStatus === option.value && styles.selected]}
              onPress={() => { onSelect(option.value); onClose(); }}
            >
              <Text style={[styles.optionText, currentStatus === option.value && styles.selectedText]}>{option.label}</Text>
            </TouchableOpacity>
          ))}
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
  selected: {
    backgroundColor: '#00968822',
  },
  selectedText: {
    color: '#009688',
    fontWeight: 'bold',
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
