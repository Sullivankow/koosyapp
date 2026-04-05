	import { StyleSheet } from 'react-native';

	const styles = StyleSheet.create({
		headerSticky: {
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'space-between',
			paddingHorizontal: 16,
			paddingVertical: 14,
			borderBottomWidth: 1,
			borderColor: '#eee',
			zIndex: 10,
		},
		title: {
			fontSize: 26,
			fontWeight: 'bold',
		},
		addBtn: {
			flexDirection: 'row',
			alignItems: 'center',
			borderRadius: 24,
			paddingVertical: 8,
			paddingHorizontal: 18,
			elevation: 2,
		},
	container: { flex: 1 },
	pageTitle: {
		fontSize: 26,
		fontWeight: 'bold',
		color: '#fff',
		textAlign: 'center',
		marginTop: 28,
		marginBottom: 8,
		letterSpacing: 0.5,
	},
	tabsContainer: {
		flexDirection: 'row',
		justifyContent: 'center',
		marginTop: 16,
		marginBottom: 8,
		gap: 8,
	},
	tabBtn: {
		flex: 1,
		paddingVertical: 10,
		backgroundColor: '#eee',
		borderWidth: 1,
		borderColor: '#ddd',
		borderRadius: 16,
		marginHorizontal: 4,
		alignItems: 'center',
	},
	tabBtnActive: {
		backgroundColor: '#FF7043',
	},
	tabBtnTermineeActive: {
		backgroundColor: '#43A047',
	},
	tabText: {
		color: '#888',
		fontWeight: 'bold',
		fontSize: 15,
	},
	tabTextActive: {
		color: '#fff',
	},
	card: {
		borderRadius: 12,
		marginBottom: 16,
		padding: 16,
		// Ajout de la bordure gauche colorée
		borderLeftWidth: 6,
		borderLeftColor: '#FF7043', // Couleur par défaut, sera override dynamiquement
		backgroundColor: '#fff',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.08,
		shadowRadius: 4,
		elevation: 2,
	},
	cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
	cardTitle: { fontSize: 18, fontWeight: 'bold' },
	cardDesc: { fontSize: 14, marginBottom: 6 },
	cardBien: { fontSize: 13, fontWeight: 'bold', marginBottom: 2 },
	cardDate: { fontSize: 12, marginBottom: 2 },
	statutBadge: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
	cardActions: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
	actionBtn: { padding: 8, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.04)' },
	fab: { position: 'absolute', right: 24, bottom: 24, width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', elevation: 4 },
	successMsgBox: {
		backgroundColor: '#43A047',
		paddingVertical: 10,
		paddingHorizontal: 24,
		borderRadius: 18,
		alignSelf: 'center',
		marginTop: 18,
		marginBottom: 2,
		zIndex: 10,
	},
	successMsgText: {
		color: '#fff',
		fontWeight: 'bold',
		fontSize: 15,
		textAlign: 'center',
	},
});

export default styles;
