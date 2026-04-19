import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

const onboardingData = [
	{
		image: require('../assets/business.png'),
		title: 'Gérez votre activité',
		description: "Koosy centralise la gestion de vos prestations et simplifie le suivi de votre activité."
	},
	{
		image: require('../assets/booking.png'),
		title: 'Suivi des prestations',
		description: 'Visualisez, organisez et suivez facilement toutes vos prestations en un seul endroit.'
	},
	{
		image: require('../assets/finance.png'),
		title: 'Maîtrisez vos finances',
		description: 'Visualisez vos revenus, dépenses et statistiques financières en temps réel.'
	},
	{
		image: require('../assets/invoice.png'),
		title: 'Facturation simplifiée',
		description: 'Créez et envoyez vos factures en quelques clics, sans effort.'
	},
];

const { width } = Dimensions.get('window');

function OnBoarding({ onFinish }: { onFinish?: () => void }) {
	const [page, setPage] = useState(0);
	const { colors } = useTheme();

	const handleNext = () => {
		if (page < onboardingData.length - 1) {
			setPage(page + 1);
		} else if (onFinish) {
			onFinish();
		}
	};

	const handlePrev = () => {
		if (page > 0) setPage(page - 1);
	};

	return (
		<View style={styles.container}>
			<Image source={onboardingData[page].image} style={styles.image} resizeMode="contain" />
			<Text style={styles.title}>{onboardingData[page].title}</Text>
			<Text style={styles.description}>{onboardingData[page].description}</Text>
			<View style={styles.pagination}>
				{onboardingData.map((_, idx) => (
					<View key={idx} style={[styles.dot, page === idx && { backgroundColor: colors.primary }]} />
				))}
			</View>
			<View style={styles.buttons}>
				{page > 0 && (
					<TouchableOpacity onPress={handlePrev} style={[styles.button, { backgroundColor: colors.primary }] }>
						<Text style={styles.buttonText}>Précédent</Text>
					</TouchableOpacity>
				)}
				<TouchableOpacity onPress={handleNext} style={[styles.button, { backgroundColor: colors.primary }] }>
					<Text style={styles.buttonText}>{page === onboardingData.length - 1 ? 'Commencer' : 'Suivant'}</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#fff',
		padding: 24,
	},
	image: {
		width: width * 0.7,
		height: width * 0.7,
		marginBottom: 24,
	},
	title: {
		fontSize: 24,
		fontWeight: 'bold',
		marginBottom: 12,
		textAlign: 'center',
	},
	description: {
		fontSize: 16,
		color: '#555',
		textAlign: 'center',
		marginBottom: 24,
	},
	pagination: {
		flexDirection: 'row',
		marginBottom: 24,
	},
	dot: {
		width: 10,
		height: 10,
		borderRadius: 5,
		backgroundColor: '#ccc',
		marginHorizontal: 5,
	},
	activeDot: {
		backgroundColor: '#007AFF',
	},
	buttons: {
		flexDirection: 'row',
		justifyContent: 'center',
		width: '100%',
	},
	button: {
		backgroundColor: '#007AFF', // sera écrasé par le style dynamique
		paddingVertical: 10,
		paddingHorizontal: 24,
		borderRadius: 8,
		marginHorizontal: 8,
	},
	buttonText: {
		color: '#fff',
		fontWeight: 'bold',
		fontSize: 16,
	},
});

export default OnBoarding;
