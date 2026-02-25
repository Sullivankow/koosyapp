import { useState } from 'react';

/**
 * Hook pour gérer un message de succès temporaire.
 * @param duration Durée d'affichage du message en ms (par défaut 2000)
 */
export function useSuccessMessage(duration: number = 2000) {
  const [successMsg, setSuccessMsg] = useState<string>('');

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), duration);
  };

  return { successMsg, showSuccess };
}
