import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useRef, useEffect, useState, useCallback, memo } from 'react';
import { View, Text, FlatList, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

const conseils = [
	"Koosy centralise le suivi de vos prestations chez les particuliers : gérez vos biens, tâches, clients propriétaires, devis, factures, chiffre d'affaires, planning et réservations voyageurs en un seul outil.",
	"1.En premier lieu, ajoutez d’abord un contact client dans la section Propriétaires.",
	"2.Ensuite, créez le bien concerné par la prestation et assignez-lui le contact client.",
	"3.Changez le statut de vos biens (Disponible ou Occupé) directement depuis la carte du bien pour mieux organiser votre activité.",
	"4.Créez votre prestation, sélectionnez le bien, puis définissez le statut de la prestation.",
	"5.Pour générer un devis ou une facture, renseignez vos informations d’entreprise dans Paramètres et créez le contact client au préalable.",
	"6.Pour calculer votre marge opérationnelle, saisissez vos charges dans la page Mes charges.",
	"7.Consultez le Planning Presta pour visualiser l’ensemble de vos prestations à venir.",
	"8.Le chiffre d’affaires est calculé uniquement sur les prestations ayant le statut Terminée.",
	"9.Suivez les prochaines arrivées et départs des voyageurs depuis la section Événements située en haut de cet écran.",
];

const ITEM_WIDTH = Dimensions.get('window').width - 40;

const ConseilItem = memo(({ item, colors }: { item: string; colors: any }) => (
	<View style={[styles.item, { backgroundColor: `${colors.primary}12`, borderColor: colors.primary }]}> 
		<Text style={[styles.text, { color: colors.primary }]}>{item}</Text>
	</View>
));

export default function ConseilsDéfilants() {
	const { colors } = useTheme();
	const flatListRef = useRef<FlatList>(null);
	const [index, setIndex] = useState(0);

	const renderItem = useCallback(
		({ item }: { item: string }) => <ConseilItem item={item} colors={colors} />,
		[colors]
	);

	const keyExtractor = useCallback((_: string, i: number) => i.toString(), []);

	useEffect(() => {
		// Utiliser la mise à jour fonctionnelle pour éviter de capturer une valeur
		// stale de `index` et scroller vers l'index calculé.
		const timer = setInterval(() => {
			setIndex((prev) => {
				const next = (prev + 1) % conseils.length;
				flatListRef.current?.scrollToIndex({ index: next, animated: true });
				return next;
			});
		}, 5000);
		return () => clearInterval(timer);
	}, []);

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<MaterialCommunityIcons name="lightbulb-on-outline" size={22} color={colors.primary} style={{ marginRight: 8 }} />
				<Text style={[styles.headerText, { color: colors.primary }]}>Conseil d'utilisation</Text>
			</View>
			<FlatList
				ref={flatListRef}
				data={conseils}
				keyExtractor={keyExtractor}
				renderItem={renderItem}
				horizontal
				pagingEnabled
				showsHorizontalScrollIndicator={false}
				scrollEnabled={false}
				getItemLayout={(_, i) => ({ length: ITEM_WIDTH, offset: ITEM_WIDTH * i, index: i })}
				style={{ width: ITEM_WIDTH }}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		width: '100%',
		alignItems: 'center',
		marginBottom: 18,
		marginTop: 8,
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 6,
	},
	headerText: {
		fontWeight: 'bold',
		fontSize: 16,
		letterSpacing: 0.2,
	},
	item: {
		width: ITEM_WIDTH,
		borderRadius: 16,
		paddingVertical: 16,
		paddingHorizontal: 18,
		justifyContent: 'center',
		alignItems: 'center',
		shadowColor: '#000',
		shadowOpacity: 0.08,
		shadowRadius: 4,
		elevation: 2,
		borderWidth: 1,
	},
	text: {
		fontWeight: '600',
		fontSize: 15,
		textAlign: 'center',
		lineHeight: 22,
	},
});
