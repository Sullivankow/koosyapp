import { useEffect, useState } from 'react';
import { getChiffreAffaire } from '../utils/api';
import dayjs from 'dayjs';
import { useChiffreAffaireRefresh } from '../contexts/ChiffreAffaireRefreshContext';

/**
 * Hook pour charger et exposer différents indicateurs de chiffre d'affaires :
 * - caMois : CA du mois courant
 * - caGlobal : CA global depuis 2000
 * - caAnnee : CA de l'année en cours
 * - caMoisN1 : CA du mois précédent
 * Les valeurs sont recalculées à chaque changement de refreshKey (contexte ChiffreAffaireRefreshContext).
 */
export function useChiffreAffaire() {
  const [caMois, setCaMois] = useState(0);
  const [caGlobal, setCaGlobal] = useState(0);
  const [caAnnee, setCaAnnee] = useState(0); // Ajout CA année
  const [caMoisN1, setCaMoisN1] = useState(0); // CA mois précédent
  const { refreshKey } = useChiffreAffaireRefresh();

  useEffect(() => {
    const now = dayjs();
    const fromMois = now.startOf('month').format('YYYY-MM-DD');
    const toMois = now.endOf('month').format('YYYY-MM-DD');
    const fromAnnee = now.startOf('year').format('YYYY-MM-DD');
    const toAnnee = now.format('YYYY-MM-DD');
    // Calcul période mois n-1
    const prevMonth = now.subtract(1, 'month');
    const fromMoisN1 = prevMonth.startOf('month').format('YYYY-MM-DD');
    const toMoisN1 = prevMonth.endOf('month').format('YYYY-MM-DD');
    const loadChiffreAffaire = async () => {
      // Le backend renvoie déjà un CA filtré sur les prestations terminées.
      const moisData = await getChiffreAffaire(fromMois, toMois);
      const globalData = await getChiffreAffaire('2000-01-01', now.format('YYYY-MM-DD'));
      const anneeData = await getChiffreAffaire(fromAnnee, toAnnee);
      const moisN1Data = await getChiffreAffaire(fromMoisN1, toMoisN1);

      setCaMois(Number(moisData?.global?.total_euros ?? 0));
      setCaGlobal(Number(globalData?.global?.total_euros ?? 0));
      setCaAnnee(Number(anneeData?.global?.total_euros ?? 0));
      setCaMoisN1(Number(moisN1Data?.global?.total_euros ?? 0));
    };

    loadChiffreAffaire();
  }, [refreshKey]);

  return { caMois, caGlobal, caAnnee, caMoisN1 };
}