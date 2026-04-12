import { StyleSheet } from 'react-native';

// Styles de l'écran planning basés sur les couleurs du thème courant.
export const createPlanningScreenStyles = (colors: {
	background: string;
	surface: string;
	border: string;
	primary: string;
}) =>
	StyleSheet.create({
		container: {
			flex: 1,
		},
		header: {
			flexDirection: 'row',
			alignItems: 'center',
			gap: 8,
			paddingHorizontal: 16,
			paddingVertical: 12,
			borderBottomWidth: 1,
			borderBottomColor: colors.border,
			backgroundColor: colors.surface,
		},
		title: {
			fontSize: 18,
			fontWeight: '700',
			color: colors.primary,
		},
		switchRow: {
			flexDirection: 'row',
			justifyContent: 'center',
			alignItems: 'center',
			gap: 10,
			paddingHorizontal: 16,
			paddingTop: 10,
			paddingBottom: 10,
			borderBottomWidth: 1,
			borderBottomColor: colors.border,
			backgroundColor: colors.surface,
		},
		switchBtn: {
			minWidth: 112,
			borderWidth: 1,
			borderRadius: 999,
			paddingHorizontal: 16,
			paddingVertical: 7,
			alignItems: 'center',
			justifyContent: 'center',
		},
		switchText: {
			fontSize: 13,
			fontWeight: '700',
			textAlign: 'center',
		},
	});

