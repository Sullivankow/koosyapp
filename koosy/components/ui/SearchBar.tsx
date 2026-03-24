import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  style?: object;
}

/**
 * Barre de recherche réutilisable
 * Props :
 *   - value : texte de la recherche
 *   - onChangeText : callback à chaque modification
 *   - placeholder : texte d'exemple
 *   - style : styles additionnels
 */
const SearchBar: React.FC<SearchBarProps> = ({ value, onChangeText, placeholder = 'Rechercher...', style }) => {
  return (
    <View style={[styles.container, style]}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#888"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: 4,
    paddingHorizontal: 0,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#222',
  },
});

export default SearchBar;
