import React from 'react';
import { View, Text } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

interface ProprioBoxProps {
  proprio?: {
    nom?: string;
    email?: string;
    telephone?: string;
  };
  colors: {
    secondary: string;
    text: string;
    textSecondary: string;
  };
  styles: any;
}

const ProprioBox: React.FC<ProprioBoxProps> = ({ proprio, colors, styles }) => (
  <View style={styles.proprioBox}>
    <View style={styles.avatarCircle}>
      <FontAwesome5 name="user-tie" size={18} color={colors.secondary} />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={{ color: colors.text, fontWeight: 'bold' }}>{proprio?.nom || 'N/A'}</Text>
      <Text style={{ color: colors.textSecondary }}>{proprio?.email || ''}</Text>
      <Text style={{ color: colors.textSecondary }}>{proprio?.telephone || ''}</Text>
    </View>
  </View>
);

export default React.memo(ProprioBox);