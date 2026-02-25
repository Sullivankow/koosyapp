import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Hook pour récupérer les infos utilisateur (prénom, avatar).
 * @returns { userName, avatarUrl, refresh }
 */
export function useUserInfo() {
  const [userName, setUserName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  const fetchUserInfo = async () => {
    const data = await AsyncStorage.getItem('koosy_user');
    if (data) {
      try {
        const { prenom } = JSON.parse(data);
        setUserName(prenom);
        setAvatarUrl(`https://ui-avatars.com/api/?name=${encodeURIComponent(prenom)}&background=random`);
      } catch {
        setUserName('');
        setAvatarUrl('');
      }
    } else {
      setUserName('');
      setAvatarUrl('');
    }
  };

  useEffect(() => {
    fetchUserInfo();
  }, []);

  return { userName, avatarUrl, refresh: fetchUserInfo };
}
