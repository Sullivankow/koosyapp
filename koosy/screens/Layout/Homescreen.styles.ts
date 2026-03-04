import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
	container: {
		alignItems: 'center',
		padding: 20,
	},
	avatarRow: {
		flexDirection: 'row',
		alignItems: 'center',
		width: '100%',
		marginBottom: 18,
	},
	avatar: {
		width: 56,
		height: 56,
		borderRadius: 28,
		backgroundColor: '#eee',
	},
	welcome: {
		fontSize: 22,
		fontWeight: 'bold',
		marginBottom: 2,
	},
	subtitle: {
		fontSize: 16,
		marginBottom: 20,
		textAlign: 'center',
	},
	topActions: {
		flexDirection: 'row',
		justifyContent: 'flex-end',
		alignItems: 'center',
		width: '100%',
		marginBottom: 10,
		gap: 10,
	},
	iconBtn: {
		borderRadius: 20,
		padding: 10,
		marginLeft: 10,
		alignItems: 'center',
		justifyContent: 'center',
	},
	summaryContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		width: '100%',
		marginBottom: 20,
	},
	summaryGrid: {
		width: '100%',
	},
	summaryRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 8,
	},
	summaryBox: {
		flex: 1,
		marginHorizontal: 6,
		borderRadius: 10,
		paddingVertical: 12,
		paddingHorizontal: 6,
		alignItems: 'center',
		elevation: 1,
		minWidth: 0,
	},
	summaryLabel: {
		fontSize: 13,
		marginBottom: 2,
	},
	summaryValue: {
		fontSize: 18,
		fontWeight: 'bold',
		textAlign: 'center',
	},
	eventBox: {
		width: '100%',
		borderRadius: 10,
		padding: 15,
		marginBottom: 20,
		alignItems: 'center',
		flexDirection: 'row',
		gap: 8,
	},
	eventText: {
		fontSize: 16,
		fontWeight: 'bold',
	},
	eventRow: {
		paddingVertical: 6,
		borderBottomWidth: 0.5,
		borderBottomColor: '#00000010',
		marginRight: 6,
	},
	eventRowTitle: {
		fontSize: 14,
		fontWeight: '600',
	},
	eventRowSubtitle: {
		fontSize: 12,
		marginTop: 2,
	},
	quickActionsGrid: {
		width: '100%',
		marginBottom: 20,
	},
	quickActionsRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		width: '100%',
		marginBottom: 12,
	},
	actionBtn: {
		flex: 1,
		marginHorizontal: 5,
		borderRadius: 10,
		paddingVertical: 18,
		paddingHorizontal: 8,
		alignItems: 'center',
		justifyContent: 'center',
		elevation: 2,
	},
	centerContent: {
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
	},
	icon: {
		marginBottom: 8,
	},
	actionText: {
		fontSize: 16,
		fontWeight: 'bold',
		textAlign: 'center',
	},
	/* styles pour la modale de notifications supprimés - modales restantes utilisent leurs propres styles */
});
