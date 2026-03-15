import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type PlusButtonProps = {
	onPress: () => void;
	style?: object;
	iconColor?: string;
	backgroundColor?: string;
};

const PlusButton: React.FC<PlusButtonProps> = ({ onPress, style, iconColor = '#fff', backgroundColor = '#007bff' }) => (
	<TouchableOpacity
		style={[styles.fab, { backgroundColor }, style]}
		onPress={onPress}
		activeOpacity={0.8}
	>
		<MaterialCommunityIcons name="plus" size={28} color={iconColor} />
	</TouchableOpacity>
);

const styles = StyleSheet.create({
	fab: {
		position: 'absolute',
		right: 20,
		bottom: 30,
		width: 56,
		height: 56,
		borderRadius: 28,
		alignItems: 'center',
		justifyContent: 'center',
		elevation: 4,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.3,
		shadowRadius: 3,
	},
});

export default PlusButton;
