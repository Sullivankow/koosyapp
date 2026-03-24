import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useNotificationCount } from '../../contexts/NotificationCountContext';

type Props = {
	size?: number;
	color?: string;
	style?: any;
};

export default function NotificationBell({ size = 28, color = '#000', style }: Props) {
	const navigation = useNavigation();
	const { unread } = useNotificationCount();

	const onPress = () => {
		// navigate to Notifications screen - adapte le nom de route si besoin
		// @ts-ignore
		navigation.navigate('NotificationsScreen');
	};

	return (
		<TouchableOpacity onPress={onPress} style={[styles.wrapper, style]}>
			<MaterialCommunityIcons name="bell-outline" size={size} color={color} />
			{unread > 0 && (
				<View style={styles.badge}>
					<Text style={styles.badgeText}>{unread > 99 ? '99+' : unread}</Text>
				</View>
			)}
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	wrapper: {
		paddingHorizontal: 6,
		paddingVertical: 4,
	},
	badge: {
		position: 'absolute',
		right: -6,
		top: -6,
		minWidth: 18,
		height: 18,
		borderRadius: 9,
		backgroundColor: '#E53935',
		alignItems: 'center',
		justifyContent: 'center',
		paddingHorizontal: 4,
	},
	badgeText: {
		color: 'white',
		fontSize: 11,
		fontWeight: '700',
	},
});
