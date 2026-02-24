import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

const PrestationsScreen: React.FC = () => {
	const { colors } = useTheme();
	return (
		<View style={[styles.container, { backgroundColor: colors.background }]}> 
			<Text style={[styles.title, { color: colors.primary }]}>Prestations</Text>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
	},
	title: {
		fontSize: 22,
		fontWeight: 'bold',
	},
});

export default PrestationsScreen;