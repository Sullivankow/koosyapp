// Utilitaires de gestion de la session locale (email + token JWT)
// stockée dans AsyncStorage côté mobile.
import AsyncStorage from '@react-native-async-storage/async-storage';

// Type de session utilisateur
export type Session = {
  email: string;
  token: string;
  accessToken?: string;
  refreshToken?: string;
};

// Génère un token aléatoire (UUID simple).
// Utilisé dans les premières versions pour simuler un token, mais
// aujourd'hui le backend renvoie un vrai JWT (access_token).
export function generateToken(): string {
  return 'koosy_' + Math.random().toString(36).slice(2, 18);
}

// Sauvegarde la session (email + access token + refresh token)
export async function saveSession(email: string, accessToken: string, refreshToken?: string): Promise<void> {
  await AsyncStorage.setItem(
    'koosy_session',
    JSON.stringify({
      email,
      token: accessToken,
      accessToken,
      refreshToken: refreshToken ?? null,
    }),
  );
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
