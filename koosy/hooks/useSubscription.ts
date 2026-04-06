import { useState, useCallback } from 'react';
import { getSession } from '../utils/session';

let WebBrowser: any;
try {
	WebBrowser = require('expo-web-browser');
} catch (e) {
	// Fallback si expo-web-browser n'est pas disponible
	console.warn('expo-web-browser non disponible, utilisant fallback');
	WebBrowser = { openBrowserAsync: async (url: string) => ({ type: 'cancel' }) };
}

import { API_URL } from '../constants/config';

export const useSubscription = (token: string) => {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const resolveToken = useCallback(async (): Promise<string> => {
		if (token) return token;
		const session = await getSession();
		return session?.token || '';
	}, [token]);

	// Récupérer l'abonnement actuel
	const getMySubscription = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);
			const authToken = await resolveToken();
			if (!authToken) throw new Error('Veuillez vous connecter d\'abord');

			const response = await fetch(`${API_URL}/subscriptions/me`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${authToken}`,
				},
			});

			if (!response.ok) throw new Error('Erreur lors de la récupération');
			return await response.json();
		} catch (err: any) {
			setError(err.message);
			return null;
		} finally {
			setLoading(false);
		}
	}, [resolveToken]);

	// Vérifier si l'utilisateur a accès à la version pro
	const hasProAccess = useCallback(async (): Promise<boolean> => {
		const subscription = await getMySubscription();
		if (!subscription) return false;
		return ['trialing', 'active'].includes(subscription.status);
	}, [getMySubscription]);

	// Créer une session checkout et ouvrir le lien
	const startCheckout = useCallback(
		async (priceId: string, successUrl?: string, cancelUrl?: string) => {
			try {
				setLoading(true);
				setError(null);
				const authToken = await resolveToken();
				if (!authToken) throw new Error('Veuillez vous connecter d\'abord');

				// Créer la session checkout
				const checkoutResponse = await fetch(`${API_URL}/subscriptions/checkout`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${authToken}`,
					},
					body: JSON.stringify({
						priceId,
						amount: 9.99, // À adapter selon le plan
						currency: 'EUR',
						successUrl: successUrl || 'http://localhost:5173/dashboard?session_id={CHECKOUT_SESSION_ID}',
						cancelUrl: cancelUrl || 'http://localhost:5173/subscribe',
						trialDays: 7,
					}),
				});

				if (!checkoutResponse.ok) {
					const raw = await checkoutResponse.text();
					let message = `Erreur checkout (${checkoutResponse.status})`;
					try {
						const parsed = raw ? JSON.parse(raw) : null;
						if (parsed?.message) {
							message = Array.isArray(parsed.message)
								? parsed.message.join(', ')
								: String(parsed.message);
						}
					} catch {
						if (raw) message = raw;
					}
					throw new Error(message);
				}

				const { checkoutUrl } = await checkoutResponse.json();

				// Ouvrir le lien dans le navigateur système
				if (checkoutUrl) {
					const result = await WebBrowser.openBrowserAsync(checkoutUrl);

					// Optionnel: attendre le résultat et rafraîchir l'abonnement
					if (result.type === 'success') {
						// L'utilisateur a complété le paiement
						// Le webhook va mettre à jour la BD
						// On peut attendre 2-3 secondes puis rafraîchir
						setTimeout(() => {
							getMySubscription();
						}, 3000);
					}

					return result;
				}
			} catch (err: any) {
				setError(err.message);
			} finally {
				setLoading(false);
			}
		},
		[resolveToken, getMySubscription],
	);

	// Annuler l'abonnement
	const cancelSubscription = useCallback(
		async (immediate: boolean = false) => {
			try {
				setLoading(true);
				setError(null);
				const authToken = await resolveToken();
				if (!authToken) throw new Error('Veuillez vous connecter d\'abord');

				const response = await fetch(`${API_URL}/subscriptions/cancel`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${authToken}`,
					},
					body: JSON.stringify({ immediate }),
				});

				if (!response.ok) throw new Error('Erreur lors de l\'annulation');
				return await response.json();
			} catch (err: any) {
				setError(err.message);
				return null;
			} finally {
				setLoading(false);
			}
		},
		[resolveToken],
	);

	return {
		loading,
		error,
		getMySubscription,
		hasProAccess,
		startCheckout,
		cancelSubscription,
	};
};
