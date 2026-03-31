import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

const palettes = [
	{
		key: 'bluegreen',
		name: 'Bleu-vert',
		colors: ['#009688', '#F4F7FA', '#82B1FF'],
	},
	{
		key: 'red',
		name: 'Rouge',
		colors: ['#e53935', '#ffebee', '#ff5252'],
	},
	{
		key: 'pink',
		name: 'Rose',
		colors: ['#C2185B', '#FFF0F6', '#F06292'],
	},
	{
		key: 'greenviolet',
		name: 'Vert/Violet',
		colors: ['#43A047', '#F3F7F3', '#7C4DFF'],
	},
	{
		key: 'orange',
		name: 'Orange',
		colors: ['#FF9800', '#FFF8E1', '#FFB74D'],
	},
];

const ThemeScreen = () => {
	const { setPalette, colors } = useTheme();
	// Trouver la palette active
	const activePalette = palettes.find(p => colors.primary === p.colors[0]);
	return (
		<ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}> 
			<Text style={[styles.title, { color: colors.text }]}>Choix du thème</Text>
			<View style={styles.grid}>
				{palettes.map((palette) => (
					<TouchableOpacity
						key={palette.key}
						style={[
							styles.paletteCard,
							activePalette?.key === palette.key && { borderColor: colors.primary, borderWidth: 3 },
						]}
						onPress={() => setPalette(palette.key)}
						activeOpacity={0.8}
					>
						<View style={styles.colorsRow}>
							{palette.colors.map((c, i) => (
								<View key={i} style={[styles.colorDot, { backgroundColor: c }]} />
							))}
						</View>
						<Text style={[styles.paletteName, { color: colors.text }]}>{palette.name}</Text>
						{activePalette?.key === palette.key && (
							<Text style={[styles.selected, { color: colors.primary }]}>Sélectionné</Text>
						)}
					</TouchableOpacity>
				))}
			</View>
		</ScrollView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'flex-start',
		backgroundColor: '#fff',
		padding: 24,
	},
	title: {
		fontSize: 24,
		fontWeight: 'bold',
		marginBottom: 24,
	},
	grid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'center',
		gap: 16,
	},
	paletteCard: {
		width: 120,
		height: 120,
		backgroundColor: '#fff',
		borderRadius: 16,
		margin: 8,
		alignItems: 'center',
		justifyContent: 'center',
		elevation: 3,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		borderWidth: 2,
		borderColor: '#eee',
	},
	colorsRow: {
		flexDirection: 'row',
		marginBottom: 10,
	},
	colorDot: {
		width: 24,
		height: 24,
		borderRadius: 12,
		marginHorizontal: 2,
		borderWidth: 1,
		borderColor: '#ddd',
	},
	paletteName: {
		fontSize: 16,
		fontWeight: '600',
		marginTop: 4,
	},
	selected: {
		marginTop: 6,
		fontSize: 13,
		fontWeight: 'bold',
	},
});

export default ThemeScreen;
