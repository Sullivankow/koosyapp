import { createContext } from 'react';

export const AppContext = createContext<{ setIsLoggedIn: (v: boolean) => void } | undefined>(undefined);
