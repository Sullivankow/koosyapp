import React from 'react';
import { View, Text } from 'react-native';

/**
 * Composant d'affichage d'un message de succès
 * Props :
 * - message : texte à afficher
 */
const SuccesMessage = ({ message }: { message: string }) => {
  if (!message) return null;
  return (
    <View style={{ backgroundColor: '#43a047', padding: 10, borderRadius: 8, margin: 10 }}>
      <Text style={{ color: '#fff', fontWeight: 'bold', textAlign: 'center', fontSize: 16 }}>{message}</Text>
    </View>
  );
};

export default SuccesMessage;