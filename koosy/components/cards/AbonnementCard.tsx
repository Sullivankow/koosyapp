import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import type { Subscription } from '../../models/models';

interface AbonnementCardProps {
	subscription: Subscription | null;
	loading?: boolean;
	error?: string | null;
	onClose?: () => void;
}

const statusLabel: Record<Subscription['status'], string> = {
	incomplete: 'En attente',
	trialing: 'Essai en cours',
	active: 'Actif',
	past_due: 'Paiement en retard',
	canceled: 'Résilié',
	unpaid: 'Impayé',
};

const formatDate = (value?: string | null) => {
	if (!value) return '-';
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString('fr-FR');
};

const formatMoney = (amount?: number | null, currency?: string) => {
	if (amount === undefined || amount === null) return '-';
	return `${Number(amount).toFixed(2)} ${currency || 'EUR'}`;
};

const Row = ({ label, value, colors }: { label: string; value: string; colors: ReturnType<typeof useTheme>['colors'] }) => (
	<View style={styles.row}>
		<Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
		<Text style={[styles.value, { color: colors.text }]}>{value}</Text>
	</View>
);

const AbonnementCard: React.FC<AbonnementCardProps> = ({ subscription, loading, error, onClose }) => {
	const { colors } = useTheme();

	return (
		<View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.shadow || colors.text }]}> 
			<View style={styles.header}>
				<View style={styles.headerTitle}>
					<MaterialCommunityIcons name="credit-card-outline" size={22} color={colors.primary} style={{ marginRight: 8 }} />
					<Text style={[styles.title, { color: colors.primary }]}>Mon abonnement</Text>
				</View>
				{onClose ? (
					<TouchableOpacity onPress={onClose} style={styles.closeBtn}>
						<MaterialCommunityIcons name="close" size={20} color={colors.text} />
					</TouchableOpacity>
				) : null}
			</View>

			{loading ? <Text style={[styles.message, { color: colors.textSecondary }]}>Chargement de l'abonnement...</Text> : null}
			{error ? <Text style={[styles.error, { color: colors.error }]}>{error}</Text> : null}

			{subscription ? (
				<>
					<View style={[styles.statusBadge, { backgroundColor: colors.primary }]}>
						<Text style={[styles.statusText, { color: colors.surface }]}>{statusLabel[subscription.status]}</Text>
					</View>
					<Row label="Statut" value={statusLabel[subscription.status]} colors={colors} />
					<Row label="Montant" value={formatMoney(subscription.amount, subscription.currency)} colors={colors} />
					<Row label="Début de période" value={formatDate(subscription.currentPeriodStart)} colors={colors} />
					<Row label="Prochaine échéance" value={formatDate(subscription.currentPeriodEnd)} colors={colors} />
					{subscription.trialEnd ? <Row label="Fin d'essai" value={formatDate(subscription.trialEnd)} colors={colors} /> : null}
					<Row label="Renouvellement auto" value={subscription.cancelAtPeriodEnd ? 'Oui, fin de période' : 'Non'} colors={colors} />
					{subscription.canceledAt ? <Row label="Date d'annulation" value={formatDate(subscription.canceledAt)} colors={colors} /> : null}
					<Row label="Créé le" value={formatDate(subscription.createdAt)} colors={colors} />
					<Row label="Mis à jour le" value={formatDate(subscription.updatedAt)} colors={colors} />
				</>
			) : (
				!loading && !error ? <Text style={[styles.message, { color: colors.textSecondary }]}>Aucune donnée d'abonnement disponible pour le moment.</Text> : null
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	card: {
		width: '90%',
		alignSelf: 'center',
		borderRadius: 18,
		padding: 20,
		marginBottom: 18,
		borderWidth: 1,
		shadowOpacity: 0.12,
		shadowRadius: 8,
		elevation: 4,
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 14,
	},
	headerTitle: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	title: {
		fontSize: 16,
		fontWeight: 'bold',
	},
	closeBtn: {
		padding: 6,
		borderRadius: 20,
	},
	statusBadge: {
		alignSelf: 'flex-start',
		paddingHorizontal: 12,
		paddingVertical: 5,
		borderRadius: 999,
		marginBottom: 10,
	},
	statusText: {
		fontWeight: 'bold',
		fontSize: 12,
	},
	row: {
		marginBottom: 8,
	},
	label: {
		fontSize: 12,
		textTransform: 'uppercase',
		letterSpacing: 0.4,
		marginBottom: 2,
	},
	value: {
		fontSize: 15,
		fontWeight: '600',
	},
	message: {
		fontSize: 14,
		lineHeight: 20,
	},
	error: {
		fontSize: 14,
		lineHeight: 20,
		marginBottom: 8,
	},
});

export default AbonnementCard;
