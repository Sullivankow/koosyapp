import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useSubscription } from '../../hooks/useSubscription';
import { STRIPE_PRICES } from '../../constants/config';

const getOnColor = (hexColor: string): string => {
	const hex = hexColor.replace('#', '');
	if (hex.length !== 6) return '#FFFFFF';
	const r = parseInt(hex.slice(0, 2), 16);
	const g = parseInt(hex.slice(2, 4), 16);
	const b = parseInt(hex.slice(4, 6), 16);
	const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
	return luminance > 0.6 ? '#0F172A' : '#FFFFFF';
};

interface SubscriptionPaywallModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSubscribe?: () => void;
	userToken?: string;
	price?: number;
	periodLabel?: string;
}

const SubscriptionPaywallModal: React.FC<SubscriptionPaywallModalProps> = ({
	isOpen,
	onClose,
	onSubscribe,
	userToken = '',
	price = 14.99,
	periodLabel = 'mois',
}) => {
	const { colors } = useTheme();
	const { loading, error, startCheckout } = useSubscription(userToken);
	const [isProcessing, setIsProcessing] = useState(false);

	const onPrimary = getOnColor(colors.primary);
	const heroBadgeBg = onPrimary === '#0F172A' ? 'rgba(15,23,42,0.12)' : 'rgba(255,255,255,0.18)';
	const heroSubtitleColor = onPrimary === '#0F172A' ? 'rgba(15,23,42,0.82)' : 'rgba(255,255,255,0.92)';

	const features = [
		'Création illimitée de biens',
		'Création illimitée de propriétaires',
		'Création illimitée de devis',
		'Création illimitée de factures',
		'Export PDF illimité',
		'Ajout des charges simplifié',
		'Calcul de la marge en temps réel',
		'Support prioritaire',
	];

	const handleSubscribeClick = async () => {
		setIsProcessing(true);
		try {
			// Lancer le checkout Stripe
			const result = await startCheckout(STRIPE_PRICES.premium_monthly);

			// Fermer seulement si le navigateur Stripe a bien ete ouvert.
			if (result) {
				onSubscribe?.();
			}
		} catch (err) {
			Alert.alert('Erreur', 'Impossible de démarrer le paiement');
		} finally {
			setIsProcessing(false);
		}
	};

	if (error) {
		return (
			<Modal visible={isOpen} animationType="fade" transparent onRequestClose={onClose}>
				<View style={styles.overlay}>
					<View style={[styles.card, { backgroundColor: colors.surface }]}>
						<Text style={[styles.errorText, { color: colors.text }]}>
							Erreur: {error}
						</Text>
						<TouchableOpacity onPress={onClose} style={styles.secondaryAction}>
							<Text style={[styles.secondaryActionText, { color: colors.textSecondary }]}>
								Fermer
							</Text>
						</TouchableOpacity>
					</View>
				</View>
			</Modal>
		);
	}

	return (
		<Modal visible={isOpen} animationType="fade" transparent onRequestClose={onClose}>
			<View style={styles.overlay}>
				<View
					style={[
						styles.card,
						{
							backgroundColor: colors.surface,
							borderColor: colors.border,
							shadowColor: colors.shadow,
						},
					]}
				>
					<TouchableOpacity onPress={onClose} style={styles.closeButton}>
						<MaterialCommunityIcons name="close" size={22} color={colors.textSecondary} />
					</TouchableOpacity>

					<View style={[styles.hero, { backgroundColor: colors.primary }]}> 
						<Text style={[styles.heroBadge, { backgroundColor: heroBadgeBg, color: onPrimary }]}>OFFRE PRO</Text>
						<Text style={[styles.heroTitle, { color: onPrimary }]}>Passez au plan premium</Text>
						<Text style={[styles.heroSubtitle, { color: heroSubtitleColor }]}>Debloquez toutes les fonctionnalites de Koosy</Text>
					</View>

					<ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
						<View style={[styles.priceBlock, { borderColor: colors.border, backgroundColor: colors.background }]}>
							<Text style={[styles.priceValue, { color: colors.text }]}>{price.toFixed(2).replace('.', ',')}</Text>
							<Text style={[styles.priceCurrency, { color: colors.textSecondary }]}>€</Text>
							<Text style={[styles.pricePeriod, { color: colors.textSecondary }]}>/{periodLabel}</Text>
						</View>

						<View style={styles.featureList}>
							{features.map((feature) => (
								<View key={feature} style={styles.featureRow}>
									<View style={[styles.featureIcon, { backgroundColor: colors.secondary }]}> 
										<MaterialCommunityIcons name="check" size={14} color={colors.surface} />
									</View>
									<Text style={[styles.featureText, { color: colors.text }]}>{feature}</Text>
								</View>
							))}
						</View>

						<View style={[styles.highlight, { backgroundColor: colors.background, borderColor: colors.border }]}> 
							<MaterialCommunityIcons name="rocket-launch" size={18} color={colors.primary} />
							<Text style={[styles.highlightText, { color: colors.text }]}>Passez pro en 1 clic et continuez votre creation sans interruption.</Text>
						</View>

						<TouchableOpacity
							activeOpacity={0.9}
							onPress={handleSubscribeClick}
							disabled={loading || isProcessing}
							style={[styles.subscribeButton, { backgroundColor: colors.primary }]}
						>
							{loading || isProcessing ? (
								<ActivityIndicator color={onPrimary} size="small" />
							) : (
								<>
									<MaterialCommunityIcons name="crown" size={18} color={onPrimary} />
									<Text style={[styles.subscribeButtonText, { color: onPrimary }]}>S'abonner maintenant</Text>
								</>
							)}
						</TouchableOpacity>

						<TouchableOpacity onPress={onClose} style={styles.secondaryAction} disabled={loading || isProcessing}>
							<Text style={[styles.secondaryActionText, { color: colors.textSecondary }]}>Continuer plus tard</Text>
						</TouchableOpacity>
					</ScrollView>
				</View>
			</View>
		</Modal>
	);
};

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		backgroundColor: 'rgba(0, 0, 0, 0.45)',
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: 16,
	},
	card: {
		width: '100%',
		maxWidth: 420,
		borderRadius: 24,
		borderWidth: 1,
		overflow: 'hidden',
		elevation: 10,
		shadowOpacity: 0.25,
		shadowRadius: 14,
		shadowOffset: { width: 0, height: 8 },
		maxHeight: '90%',
	},
	closeButton: {
		position: 'absolute',
		top: 12,
		right: 12,
		zIndex: 2,
		width: 32,
		height: 32,
		borderRadius: 16,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: 'rgba(255, 255, 255, 0.92)',
	},
	hero: {
		paddingTop: 28,
		paddingBottom: 20,
		paddingHorizontal: 20,
	},
	heroBadge: {
		alignSelf: 'flex-start',
		fontSize: 11,
		fontWeight: '700',
		paddingHorizontal: 10,
		paddingVertical: 4,
		borderRadius: 999,
		marginBottom: 12,
		letterSpacing: 0.4,
	},
	heroTitle: {
		fontSize: 24,
		lineHeight: 28,
		fontWeight: '800',
	},
	heroSubtitle: {
		marginTop: 6,
		fontSize: 14,
	},
	body: {
		paddingHorizontal: 18,
		paddingTop: 16,
		paddingBottom: 22,
		gap: 14,
	},
	priceBlock: {
		flexDirection: 'row',
		alignItems: 'flex-end',
		justifyContent: 'center',
		borderWidth: 1,
		borderRadius: 16,
		paddingVertical: 12,
		paddingHorizontal: 14,
	},
	priceCurrency: {
		fontSize: 12,
		fontWeight: '700',
		marginRight: 4,
		marginBottom: 8,
	},
	priceValue: {
		fontSize: 38,
		fontWeight: '800',
		letterSpacing: -0.5,
	},
	pricePeriod: {
		fontSize: 14,
		fontWeight: '600',
		marginBottom: 8,
		marginLeft: 4,
	},
	featureList: {
		gap: 10,
	},
	featureRow: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	featureIcon: {
		width: 20,
		height: 20,
		borderRadius: 10,
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: 10,
	},
	featureText: {
		fontSize: 14,
		fontWeight: '600',
		flex: 1,
	},
	highlight: {
		borderWidth: 1,
		borderRadius: 14,
		paddingVertical: 10,
		paddingHorizontal: 12,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	highlightText: {
		flex: 1,
		fontSize: 12,
		lineHeight: 18,
		fontWeight: '500',
	},
	subscribeButton: {
		borderRadius: 14,
		paddingVertical: 14,
		alignItems: 'center',
		justifyContent: 'center',
		flexDirection: 'row',
		gap: 8,
	},
	subscribeButtonText: {
		fontSize: 15,
		fontWeight: '800',
		letterSpacing: 0.2,
	},
	secondaryAction: {
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 4,
	},
	secondaryActionText: {
		fontSize: 13,
		fontWeight: '600',
	},
	errorText: {
		fontSize: 14,
		fontWeight: '600',
		textAlign: 'center',
		paddingVertical: 16,
		paddingHorizontal: 20,
	},
});

export default SubscriptionPaywallModal;
