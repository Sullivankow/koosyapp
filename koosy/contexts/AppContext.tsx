import { createContext, useContext } from 'react';

// Type décrivant ce que le contexte d'application met à disposition
type AppContextType = {
	// Fonction pour mettre à jour l'état de connexion global (login/logout)
	setIsLoggedIn: (v: boolean) => void;
};

// Contexte initialisé à undefined pour imposer l'utilisation via le provider défini ailleurs
export const AppContext = createContext<AppContextType | undefined>(undefined);

// Hook utilitaire pour consommer le contexte de l'application
export const useAppContext = (): AppContextType => {
	const ctx = useContext(AppContext);

	if (!ctx) {
		throw new Error('useAppContext must be used within an AppContext provider');
	}

	return ctx;
};
