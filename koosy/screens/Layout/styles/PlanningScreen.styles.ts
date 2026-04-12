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
			flexWrap: 'nowrap',
			justifyContent: 'center',
			alignItems: 'center',
			gap: 6,
			paddingHorizontal: 10,
			paddingTop: 10,
			paddingBottom: 10,
			borderBottomWidth: 1,
			borderBottomColor: colors.border,
			backgroundColor: colors.surface,
		},
		switchBtn: {
			flex: 1,
			minWidth: 0,
			borderWidth: 1,
			borderRadius: 999,
			paddingHorizontal: 6,
			paddingVertical: 6,
			alignItems: 'center',
			justifyContent: 'center',
		},
		switchText: {
			fontSize: 12,
			fontWeight: '700',
			textAlign: 'center',
		},
	});

