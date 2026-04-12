import { useEffect, useState } from 'react';
import { getChiffreAffaire, getChargesSummary } from '../utils/api';
import dayjs from 'dayjs';
import { useChiffreAffaireRefresh } from '../contexts/ChiffreAffaireRefreshContext';

/**
 * Hook pour charger et exposer différents indicateurs de chiffre d'affaires :
 * - caMois : CA du mois courant
 * - caGlobal : CA global depuis 2000
 * - caAnnee : CA de l'année en cours
 * - caMoisN1 : CA du mois précédent
 * - caJour : CA du jour courant (se réinitialise à minuit)
 * Les valeurs sont recalculées à chaque changement de refreshKey ou de jour.
 */
export function useChiffreAffaire() {
  const [caMois, setCaMois] = useState(0);
  const [caGlobal, setCaGlobal] = useState(0);
  const [caAnnee, setCaAnnee] = useState(0);
  const [caMoisN1, setCaMoisN1] = useState(0);
  const [caJour, setCaJour] = useState(0); // CA du jour
  const [caJourN1, setCaJourN1] = useState(0); // CA jour N-1 (hier)
  const [caAnneeN1, setCaAnneeN1] = useState(0); // CA année N-1 (YTD)
  const [caMoisN2, setCaMoisN2] = useState(0); // CA mois N-2
  const [margeMois, setMargeMois] = useState(0);
  const [margeGlobal, setMargeGlobal] = useState(0);
  const [margeAnnee, setMargeAnnee] = useState(0);
  const [margeMoisN1, setMargeMoisN1] = useState(0);
  const [margeJour, setMargeJour] = useState(0); // Marge du jour
  const [margeJourN1, setMargeJourN1] = useState(0); // Marge jour N-1
  const [margeAnneeN1, setMargeAnneeN1] = useState(0); // Marge année N-1 (YTD)
  const [margeMoisN2, setMargeMoisN2] = useState(0); // Marge mois N-2
  const [lastLoadedDate, setLastLoadedDate] = useState<string>(dayjs().format('YYYY-MM-DD'));
  const { refreshKey } = useChiffreAffaireRefresh();

  useEffect(() => {
    const now = dayjs();
    const todayDate = now.format('YYYY-MM-DD');
    
    // Recharger les données si c'est un nouveau jour ou si refreshKey a changé
    const shouldReload = lastLoadedDate !== todayDate;

    // Plages pour mois, année, mois n-1
    const fromMois = now.startOf('month').format('YYYY-MM-DD');
    const toMois = now.endOf('month').format('YYYY-MM-DD');
    const fromAnnee = now.startOf('year').format('YYYY-MM-DD');
    const toAnnee = now.format('YYYY-MM-DD');
    const prevMonth = now.subtract(1, 'month');
    const fromMoisN1 = prevMonth.startOf('month').format('YYYY-MM-DD');
    const toMoisN1 = prevMonth.endOf('month').format('YYYY-MM-DD');
    const prevPrevMonth = now.subtract(2, 'month');
    const fromMoisN2 = prevPrevMonth.startOf('month').format('YYYY-MM-DD');
    const toMoisN2 = prevPrevMonth.endOf('month').format('YYYY-MM-DD');

    // Période année N-1 (YTD): du 1er janv N-1 au même jour N-1
    const nowN1 = now.subtract(1, 'year');
    const fromAnneeN1 = nowN1.startOf('year').format('YYYY-MM-DD');
    const toAnneeN1 = nowN1.format('YYYY-MM-DD');

    // Plage pour le jour J (aujourd'hui)
    const jourDate = now.format('YYYY-MM-DD');
    const jourN1Date = now.subtract(1, 'day').format('YYYY-MM-DD');
    
    const loadChiffreAffaire = async () => {
      // Appels parallèles: vue actuelle + vue N-1, revenus et charges
      const [
        moisData,
        globalData,
        anneeData,
        moisN1Data,
        jourData,
        jourN1Data,
        anneeN1Data,
        moisN2Data,
        chargesMoisData,
        chargesGlobalData,
        chargesAnneeData,
        chargesMoisN1Data,
        chargesJourData,
        chargesJourN1Data,
        chargesAnneeN1Data,
        chargesMoisN2Data,
      ] = await Promise.all([
        getChiffreAffaire(fromMois, toMois),
        getChiffreAffaire('2000-01-01', now.format('YYYY-MM-DD')),
        getChiffreAffaire(fromAnnee, toAnnee),
        getChiffreAffaire(fromMoisN1, toMoisN1),
        getChiffreAffaire(jourDate, jourDate), // Jour J
        getChiffreAffaire(jourN1Date, jourN1Date), // Jour N-1
        getChiffreAffaire(fromAnneeN1, toAnneeN1), // Année N-1 (YTD)
        getChiffreAffaire(fromMoisN2, toMoisN2), // Mois N-2
        getChargesSummary(fromMois, toMois),
        getChargesSummary('2000-01-01', now.format('YYYY-MM-DD')),
        getChargesSummary(fromAnnee, toAnnee),
        getChargesSummary(fromMoisN1, toMoisN1),
        getChargesSummary(jourDate, jourDate), // Charges jour J
        getChargesSummary(jourN1Date, jourN1Date), // Charges jour N-1
        getChargesSummary(fromAnneeN1, toAnneeN1), // Charges année N-1 (YTD)
        getChargesSummary(fromMoisN2, toMoisN2), // Charges mois N-2
      ]);

      // Extraction des revenus
      const revenueMois = Number(moisData?.global?.total_euros ?? 0);
      const revenueGlobal = Number(globalData?.global?.total_euros ?? 0);
      const revenueAnnee = Number(anneeData?.global?.total_euros ?? 0);
      const revenueMoisN1 = Number(moisN1Data?.global?.total_euros ?? 0);
      const revenueJour = Number(jourData?.global?.total_euros ?? 0);
      const revenueJourN1 = Number(jourN1Data?.global?.total_euros ?? 0);
      const revenueAnneeN1 = Number(anneeN1Data?.global?.total_euros ?? 0);
      const revenueMoisN2 = Number(moisN2Data?.global?.total_euros ?? 0);
      
      // Extraction des charges
      const chargesMois = Number(chargesMoisData?.global?.total_euros ?? 0);
      const chargesGlobal = Number(chargesGlobalData?.global?.total_euros ?? 0);
      const chargesAnnee = Number(chargesAnneeData?.global?.total_euros ?? 0);
      const chargesMoisN1 = Number(chargesMoisN1Data?.global?.total_euros ?? 0);
      const chargesJour = Number(chargesJourData?.global?.total_euros ?? 0);
      const chargesJourN1 = Number(chargesJourN1Data?.global?.total_euros ?? 0);
      const chargesAnneeN1 = Number(chargesAnneeN1Data?.global?.total_euros ?? 0);
      const chargesMoisN2 = Number(chargesMoisN2Data?.global?.total_euros ?? 0);

      // Mise à jour de l'état
      setCaMois(revenueMois);
      setCaGlobal(revenueGlobal);
      setCaAnnee(revenueAnnee);
      setCaMoisN1(revenueMoisN1);
      setCaJour(revenueJour);
      setCaJourN1(revenueJourN1);
      setCaAnneeN1(revenueAnneeN1);
      setCaMoisN2(revenueMoisN2);
      setMargeMois(revenueMois - chargesMois);
      setMargeGlobal(revenueGlobal - chargesGlobal);
      setMargeAnnee(revenueAnnee - chargesAnnee);
      setMargeMoisN1(revenueMoisN1 - chargesMoisN1);
      setMargeJour(revenueJour - chargesJour);
      setMargeJourN1(revenueJourN1 - chargesJourN1);
      setMargeAnneeN1(revenueAnneeN1 - chargesAnneeN1);
      setMargeMoisN2(revenueMoisN2 - chargesMoisN2);
      
      // Mettre à jour la date chargée si c'est un nouveau jour
      if (shouldReload) {
        setLastLoadedDate(todayDate);
      }
    };

    loadChiffreAffaire();
  }, [refreshKey, lastLoadedDate]);

  return {
    caMois,
    caGlobal,
    caAnnee,
    caMoisN1,
    caJour,
    caJourN1,
    caAnneeN1,
    caMoisN2,
    margeMois,
    margeGlobal,
    margeAnnee,
    margeMoisN1,
    margeJour,
    margeJourN1,
    margeAnneeN1,
    margeMoisN2,
  };
}