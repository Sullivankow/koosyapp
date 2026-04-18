// Fonctions d'agrégation pour le tableau de bord admin
import { fetchUsersTotal } from './usersApi';
import { fetchUsersList } from './usersApi';
import { fetchBiensTotal } from './biensApi';
import { fetchReservationsUpcomingTotal, fetchReservationsTotal } from './reservationsApi';
import { fetchTachesAFaireTotal } from './tachesApi';
import { fetchDevisTotal } from './devisApi';
import { fetchFacturesTotal } from './facturesApi';
import { fetchProprietairesTotal } from './propretaireApi';

export type DashboardStats = {
	usersTotal: number | null;
	biensTotal: number | null;
	reservationsUpcomingTotal: number | null;
	reservationsTotal: number | null;
	tachesAFaireTotal: number | null;
	devisTotal: number | null;
	facturesTotal: number | null;
	proprietairesTotal: number | null;
  subscriptionsTotal: number | null;
  premiumSubscriptionsTotal: number | null;
  gratuitSubscriptionsTotal: number | null;
  betaUsersTotal: number | null;
};


export async function fetchDashboardStats(): Promise<DashboardStats> {
  const usersList = await fetchUsersList();
  const subscriptionsTotal = usersList ? usersList.length : null;
  const premiumSubscriptionsTotal = usersList
    ? usersList.filter((u) => u.abonnement === 'premium').length
    : null;
  const gratuitSubscriptionsTotal = usersList
    ? usersList.filter((u) => u.abonnement === 'gratuit').length
    : null;
  const betaUsersTotal = usersList
    ? usersList.filter((u) => {
        if (!u.betaAccessUntil) return false;
        const betaDate = new Date(u.betaAccessUntil);
        return !Number.isNaN(betaDate.getTime()) && betaDate.getTime() >= Date.now();
      }).length
    : null;

  const [
    usersTotal,
    biensTotal,
    reservationsUpcomingTotal,
    reservationsTotal,
    tachesAFaireTotal,
    devisTotal,
    facturesTotal,
    proprietairesTotal,
  ] = await Promise.all([
    fetchUsersTotal(),
    fetchBiensTotal(),
    fetchReservationsUpcomingTotal(7),
    fetchReservationsTotal(),
    fetchTachesAFaireTotal(),
    fetchDevisTotal(),
    fetchFacturesTotal(),
    fetchProprietairesTotal(),
  ]);

  return {
    usersTotal,
    biensTotal,
    reservationsUpcomingTotal,
    reservationsTotal,
    tachesAFaireTotal,
    devisTotal,
    facturesTotal,
    proprietairesTotal,
    subscriptionsTotal,
    premiumSubscriptionsTotal,
    gratuitSubscriptionsTotal,
    betaUsersTotal,
  };
}
