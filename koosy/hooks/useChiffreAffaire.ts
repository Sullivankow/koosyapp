import { useEffect, useState } from 'react';
import { getChiffreAffaire } from '../utils/api';
import dayjs from 'dayjs';
import { useChiffreAffaireRefresh } from '../contexts/ChiffreAffaireRefreshContext';

export function useChiffreAffaire() {
  const [caMois, setCaMois] = useState(0);
  const [caGlobal, setCaGlobal] = useState(0);
  const [caAnnee, setCaAnnee] = useState(0); // Ajout CA année
  const { refreshKey } = useChiffreAffaireRefresh();

  useEffect(() => {
    const now = dayjs();
    const fromMois = now.startOf('month').format('YYYY-MM-DD');
    const toMois = now.endOf('month').format('YYYY-MM-DD');
    const fromAnnee = now.startOf('year').format('YYYY-MM-DD');
    const toAnnee = now.format('YYYY-MM-DD');
    // Teste plusieurs statuts pour trouver celui qui correspond
    const tryStatuses = async () => {
      const statuses = ['Terminée', 'terminée', 'completed', 'confirmed'];
      let caMoisVal = 0;
      let caGlobalVal = 0;
      let caAnneeVal = 0;
      for (const status of statuses) {
        const moisData = await getChiffreAffaire(fromMois, toMois, status);
        const globalData = await getChiffreAffaire('2000-01-01', now.format('YYYY-MM-DD'), status);
        const anneeData = await getChiffreAffaire(fromAnnee, toAnnee, status);
        if (moisData?.global?.total_euros > 0) caMoisVal = moisData.global.total_euros;
        if (globalData?.global?.total_euros > 0) caGlobalVal = globalData.global.total_euros;
        if (anneeData?.global?.total_euros > 0) caAnneeVal = anneeData.global.total_euros;
        if (caMoisVal > 0 || caGlobalVal > 0 || caAnneeVal > 0) break;
      }
      setCaMois(caMoisVal);
      setCaGlobal(caGlobalVal);
      setCaAnnee(caAnneeVal);
    };
    tryStatuses();
  }, [refreshKey]);

  return { caMois, caGlobal, caAnnee };
}