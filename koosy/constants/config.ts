// Pour Expo Go : BASE_URL en dur ici // Pour build : BASE_URL dans env.d.ts et importé partout
export const BASE_URL = 'http://192.168.1.67:3000';

// Alias pour API_URL
export const API_URL = BASE_URL;

// Configuration Stripe (clé publique testable)
export const STRIPE_PUBLIC_KEY = process.env.EXPO_PUBLIC_STRIPE_KEY || 'pk_test_XXX...';

// ID des prix Stripe (à remplacer par tes IDs réels depuis le dashboard Stripe)
export const STRIPE_PRICES = {
	premium_monthly: 'price_1TJFwLJSftDSVI6f4pTsoVu8', // Mensuel test
	premium_yearly: 'price_1QzBcd456DEF456DEF',  // À remplacer
};
