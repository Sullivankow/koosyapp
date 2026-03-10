import { useEffect, useState } from 'react';
import { getChiffreAffaire } from '../utils/api';
import dayjs from 'dayjs';
import { useChiffreAffaireRefresh } from '../contexts/ChiffreAffaireRefreshContext';

export function useChiffreAffaire() {
  const [caMois, setCaMois] = useState(0);
  const [caGlobal, setCaGlobal] = useState(0);
  // Récupère la clé de rafraîchissement depuis le contexte
  const { refreshKey } = useChiffreAffaireRefresh();

  useEffect(() => {
    const now = dayjs();
    const fromMois = now.startOf('month').format('YYYY-MM-DD');
    const toMois = now.endOf('month').format('YYYY-MM-DD');
    // Teste plusieurs statuts pour trouver celui qui correspond
    const tryStatuses = async () => {
      const statuses = ['Terminée', 'terminée', 'completed', 'confirmed'];
      let caMoisVal = 0;
      let caGlobalVal = 0;
      for (const status of statuses) {
        const moisData = await getChiffreAffaire(fromMois, toMois, status);
        const globalData = await getChiffreAffaire('2000-01-01', now.format('YYYY-MM-DD'), status);
        if (moisData?.global?.total_euros > 0) caMoisVal = moisData.global.total_euros;
        if (globalData?.global?.total_euros > 0) caGlobalVal = globalData.global.total_euros;
        if (caMoisVal > 0 || caGlobalVal > 0) break;
      }
      setCaMois(caMoisVal);
      setCaGlobal(caGlobalVal);
    };
    tryStatuses();
  }, [refreshKey]); // Ajout de refreshKey comme dépendance

  return { caMois, caGlobal };
}