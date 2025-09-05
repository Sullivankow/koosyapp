import AsyncStorage from '@react-native-async-storage/async-storage';

// Type de session utilisateur
export type Session = {
  email: string;
  token: string;
};

// Génère un token aléatoire (UUID simple)
export function generateToken(): string {
  return 'koosy_' + Math.random().toString(36).slice(2, 18);
}

// Sauvegarde la session (email + token)
export async function saveSession(email: string, token: string): Promise<void> {
  await AsyncStorage.setItem('koosy_session', JSON.stringify({ email, token }));
}

// Récupère la session stockée
export async function getSession(): Promise<Session | null> {
  const data = await AsyncStorage.getItem('koosy_session');
  if (!data) return null;
  try {
    return JSON.parse(data) as Session;
  } catch {
    return null;
  }
}

// Efface la session
export async function clearSession(): Promise<void> {
  await AsyncStorage.removeItem('koosy_session');
}
