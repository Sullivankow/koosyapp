import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { getPrestations } from '../../utils/api';
import { Prestation } from '../../models/models';
import AddPrestationModal from '../../components/AddPrestationModal';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const statutColor: Record<string, string> = {
	'confirmée': '#43A047',
	'en attente': '#FF7043',
	'annulée': '#B71C1C',
	'terminée': '#1976D2',
};

const TABS: Array<'en attente' | 'confirmée' | 'terminée' | 'annulée'> = ['en attente', 'confirmée', 'terminée', 'annulée'];

const PrestationsScreen: React.FC = () => {
	const { colors } = useTheme();
	const [prestations, setPrestations] = useState<Prestation[]>([]);
	const [loading, setLoading] = useState(true);
	const [modalVisible, setModalVisible] = useState(false);
	const [tab, setTab] = useState<'en attente' | 'confirmée' | 'terminée' | 'annulée'>('en attente');

	const fetchPrestations = async () => {
		setLoading(true);
		try {
			const data = await getPrestations();
			setPrestations(data);
		} catch {
			setPrestations([]);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchPrestations();
	}, [modalVisible]);

	return (
		<View style={{ flex: 1, backgroundColor: colors.background }}>
			<Text style={{ fontSize: 32, fontWeight: 'bold', color: '#fff', marginTop: 32, marginBottom: 8, textAlign: 'center', letterSpacing: 0.5 }}>
				Mes prestations
			</Text>
			<View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 18, marginBottom: 8 }}>
				{TABS.map(s => (
					<TouchableOpacity
						key={s}
						style={{
							paddingHorizontal: 22,
							paddingVertical: 10,
							borderRadius: 20,
							marginHorizontal: 8,
							backgroundColor: tab === s ? statutColor[s] : colors.surface,
							borderWidth: 1,
							borderColor: tab === s ? statutColor[s] : colors.border,
						}}
						onPress={() => setTab(s)}
					>
						<Text style={{ color: tab === s ? '#fff' : colors.text, fontWeight: 'bold' }}>{s.charAt(0).toUpperCase() + s.slice(1)}</Text>
					</TouchableOpacity>
				))}
			</View>
			{loading ? (
				<ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
			) : (
				<ScrollView style={{ flex: 1, width: '100%' }} contentContainerStyle={{ paddingBottom: 32 }}>
					  <Text style={[styles.title, { color: colors.primary }]}>Prestations {tab}</Text>
					{prestations.filter(p => p.status === tab).length === 0 ? (
						<Text style={{ textAlign: 'center', color: colors.textSecondary, marginTop: 24 }}>Aucune prestation {tab}</Text>
					) : (
						prestations.filter(p => p.status === tab).map((p: Prestation) => (
							<View key={p.id} style={[styles.card, { borderLeftColor: statutColor[p.status] || colors.primary }]}> 
								<Text style={styles.cardTitle}>{p.bien?.nom || 'Bien inconnu'}</Text>
								<Text style={{ color: '#111', fontWeight: 'bold', fontSize: 16 }}>{p.description || 'Sans description'}</Text>
								<Text style={{ color: colors.textSecondary, fontSize: 14 }}>Montant : {(p.amount_cents / 100).toFixed(2)} €</Text>
								<Text style={{ color: colors.textSecondary, fontSize: 14 }}>Date : {p.date_prestation}</Text>
								<Text style={{ color: colors.textSecondary, fontSize: 14 }}>Créée le : {p.created_at?.slice(0, 10)}</Text>
								<View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 4 }}>
									<Text style={{
										backgroundColor: statutColor[p.status] || colors.primary,
										color: '#fff',
										borderRadius: 12,
										paddingHorizontal: 12,
										paddingVertical: 4,
										fontWeight: 'bold',
										fontSize: 13,
										marginRight: 8
									}}>{p.status.charAt(0).toUpperCase() + p.status.slice(1)}</Text>
								</View>
							</View>
						))
					)}
					<TouchableOpacity style={[styles.fab, { backgroundColor: colors.primary }]} onPress={() => setModalVisible(true)}>
						<MaterialCommunityIcons name="plus" size={28} color={colors.surface} />
					</TouchableOpacity>
					<AddPrestationModal
						visible={modalVisible}
						onClose={() => setModalVisible(false)}
						onSuccess={fetchPrestations}
					/>
				</ScrollView>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	title: { fontSize: 26, fontWeight: 'bold', margin: 18 },
	card: { borderRadius: 16, padding: 16, marginBottom: 18, elevation: 2, backgroundColor: '#fff', borderLeftWidth: 6 },
	cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
	fab: { position: 'absolute', right: 24, bottom: 24, width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', elevation: 4 },
});

export default PrestationsScreen;