// Badge coloré affichant le statut d'une entité (réservation, prestation, etc.)
// en se basant sur la configuration centralisée STATUS_CONFIG.
import React from 'react';
import { Text, StyleSheet, View, ViewStyle } from 'react-native';
import { STATUS_CONFIG } from '../constants/Status';

type BadgeStatusProps = {
	statut: string;
	style?: ViewStyle;
};

// Retourne une couleur de texte lisible selon la luminance du fond.
const getContrastTextColor = (hexColor: string) => {
	const sanitized = hexColor.replace('#', '');
	if (!/^[0-9a-fA-F]{6}$/.test(sanitized)) {
		return '#fff';
	}
	const r = parseInt(sanitized.slice(0, 2), 16);
	const g = parseInt(sanitized.slice(2, 4), 16);
	const b = parseInt(sanitized.slice(4, 6), 16);
	const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
	return luminance > 0.6 ? '#111' : '#fff';
};

const BadgeStatus: React.FC<BadgeStatusProps> = ({ statut, style }) => {
	const config = STATUS_CONFIG[statut] || { label: statut, color: '#888' };
	const overriddenBackground = typeof style?.backgroundColor === 'string' ? style.backgroundColor : undefined;
	const backgroundColor = overriddenBackground || config.color;
	const textColor = getContrastTextColor(backgroundColor);
	return (
		<View style={[styles.badge, { backgroundColor }, style]}>
			<Text style={[styles.text, { color: textColor }]}>{config.label}</Text>
		</View>
	);
};

const styles = StyleSheet.create({
	badge: {
		borderRadius: 12,
		paddingHorizontal: 12,
		paddingVertical: 4,
		alignSelf: 'flex-start',
		marginVertical: 2,
	},
	text: {
		fontWeight: 'bold',
		fontSize: 13,
	},
});

export default BadgeStatus;
