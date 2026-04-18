import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import * as Notifications from 'expo-notifications';
import { AppState } from 'react-native';
import Constants from 'expo-constants';
import { getNotificationsUnreadCount } from '../utils/api';

// Type décrivant les données et fonctions exposées par le contexte de notifications
type NotificationContextType = {
	// Nombre de notifications non lues
	unread: number;
	// Fonction pour rafraîchir le compteur en appelant l'API
	refresh: () => Promise<void>;
	// Setter explicite pour modifier le compteur et synchroniser le badge iOS
	setUnread: (n: number) => void;
};

// Contexte initialisé avec des valeurs par défaut neutres
// (les vraies valeurs sont fournies par le provider)
const NotificationCountContext = createContext<NotificationContextType>({
	unread: 0,
	refresh: async () => {},
	setUnread: () => {},
});

// Hook utilitaire pour consommer facilement le contexte dans les composants
export const useNotificationCount = () => useContext(NotificationCountContext);

// Les appels API sont délégués à apiFetch (BASE_URL + token stocké)

// Provider qui gère le compteur de notifications non lues et les listeners système
export const NotificationCountProvider = ({ children }: { children: ReactNode }) => {
	// État local du nombre de notifications non lues
	const [unread, setUnreadState] = useState<number>(0);

	// Met à jour le compteur local et le badge système iOS
	const setUnread = (n: number) => {
		setUnreadState(n);
		// Mise à jour du badge d'icône sous iOS
		try {
			if (Constants.platform?.ios) {
				Notifications.setBadgeCountAsync(n).catch(() => {});
			}
		} catch (e) {
			// On ignore toute erreur liée au badge pour ne pas bloquer l'app
		}
	};

	// Récupère le nombre de notifications non lues via l'API
	const refresh = async () => {
		try {
			const json = await getNotificationsUnreadCount();
			if (json && typeof json.unread === 'number') setUnread(json.unread);
		} catch (err) {
			// En production, on ignore les erreurs de rafraîchissement
		}
	};

	useEffect(() => {
		// Chargement initial du compteur au montage
		refresh();

		// Listener déclenché quand une notification est reçue en premier plan
		const sub1 = Notifications.addNotificationReceivedListener(() => {
			refresh();
		});

		// Listener déclenché quand l'utilisateur clique sur une notification (app en arrière-plan/fermée)
		const sub2 = Notifications.addNotificationResponseReceivedListener(response => {
			// response.notification.request.content.data peut contenir un notificationId
			// Ici on se contente de rafraîchir le compteur ; la navigation se fait plus haut dans l'arborescence
			refresh();
		});

		// Si une notif arrive quand l'app est en arrière-plan, on resynchronise au retour au premier plan.
		const sub3 = AppState.addEventListener('change', (state) => {
			if (state === 'active') {
				void refresh();
			}
		});

		// Nettoyage des listeners au démontage du provider
		return () => {
			try {
				sub1.remove();
			} catch {}
			try {
				sub2.remove();
			} catch {}
			try {
				sub3.remove();
			} catch {}
		};
	}, []);

	return (
		<NotificationCountContext.Provider value={{ unread, refresh, setUnread }}>
			{children}
		</NotificationCountContext.Provider>
	);
};

