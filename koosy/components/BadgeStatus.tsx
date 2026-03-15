import React from 'react';
import { Text, StyleSheet, View, ViewStyle } from 'react-native';
import { STATUS_CONFIG } from '../constants/Status';

type BadgeStatusProps = {
	statut: string;
	style?: ViewStyle;
};

const BadgeStatus: React.FC<BadgeStatusProps> = ({ statut, style }) => {
	const config = STATUS_CONFIG[statut] || { label: statut, color: '#888' };
	return (
		<View style={[styles.badge, { backgroundColor: config.color }, style]}>
			<Text style={styles.text}>{config.label}</Text>
		</View>
	);
};

const styles = StyleSheet.create({
	badge: {
		borderRadius: 10,
		paddingHorizontal: 7,
		paddingVertical: 2,
		alignSelf: 'flex-start',
		marginVertical: 1,
	},
	text: {
		color: '#fff',
		fontWeight: 'bold',
		fontSize: 11,
	},
});

export default BadgeStatus;
