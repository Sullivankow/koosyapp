import AsyncStorage from '@react-native-async-storage/async-storage';

export type User = {
  email: string;
  password: string;
};

const STORAGE_KEY = 'koosy_users';

// Initialise avec 2 utilisateurs par défaut
export async function initDefaultUsers() {
  const users: User[] = [
    { email: 'demo1@koosy.com', password: 'azerty123' },
    { email: 'demo2@koosy.com', password: 'koosy2025' },
  ];
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

export async function getUsers(): Promise<User[]> {
  const data = await AsyncStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data) as User[];
  } catch {
    return [];
  }
}

export async function addUser(user: User): Promise<void> {
  const users = await getUsers();
  users.push(user);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

export async function userExists(email: string): Promise<boolean> {
  const users = await getUsers();
  return users.some(u => u.email === email);
}

export async function checkCredentials(email: string, password: string): Promise<boolean> {
  const users = await getUsers();
  return users.some(u => u.email === email && u.password === password);
}
