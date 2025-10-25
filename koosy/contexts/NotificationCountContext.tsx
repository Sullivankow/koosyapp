import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { getNotificationsUnreadCount } from '../utils/api';

type NotificationContextType = {
	unread: number;
	refresh: () => Promise<void>;
	setUnread: (n: number) => void;
};

const NotificationCountContext = createContext<NotificationContextType>({
	unread: 0,
	refresh: async () => {},
	setUnread: () => {},
});

export const useNotificationCount = () => useContext(NotificationCountContext);

// API calls are forwarded through apiFetch (uses BASE_URL and stored token)

export const NotificationCountProvider = ({ children }: { children: ReactNode }) => {
	const [unread, setUnreadState] = useState<number>(0);

	const setUnread = (n: number) => {
		setUnreadState(n);
		// iOS system badge
		try {
			if (Constants.platform?.ios) {
				Notifications.setBadgeCountAsync(n).catch(() => {});
			}
		} catch (e) {
			// ignore
		}
	};

	const refresh = async () => {
				try {
					const json = await getNotificationsUnreadCount();
					if (json && typeof json.unread === 'number') setUnread(json.unread);
				} catch (err) {
					console.warn('Could not refresh notifications unread count', err);
				}
	};

	useEffect(() => {
		// load initial count
		refresh();

		// listener when notification received in foreground
		const sub1 = Notifications.addNotificationReceivedListener(() => {
			refresh();
		});

		// listener when user taps a notification (background/closed)
		const sub2 = Notifications.addNotificationResponseReceivedListener(response => {
			// response.notification.request.content.data may contain notificationId
			// We simply refresh the counter; navigation should be handled by a root component
			refresh();
		});

		return () => {
			try { sub1.remove(); } catch {}
			try { sub2.remove(); } catch {}
		};
	}, []);

	return (
		<NotificationCountContext.Provider value={{ unread, refresh, setUnread }}>
			{children}
		</NotificationCountContext.Provider>
	);
};

