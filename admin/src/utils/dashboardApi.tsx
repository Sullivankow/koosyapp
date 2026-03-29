// Fonctions d'agrégation pour le tableau de bord admin
import { fetchUsersTotal } from './usersApi';
import { fetchBiensTotal } from './biensApi';
import { fetchReservationsUpcomingTotal, fetchReservationsTotal } from './reservationsApi';
import { fetchTachesAFaireTotal } from './tachesApi';
import { fetchDevisTotal } from './devisApi';
import { fetchFacturesTotal } from './facturesApi';

export type DashboardStats = {
	usersTotal: number | null;
	biensTotal: number | null;
	reservationsUpcomingTotal: number | null;
	reservationsTotal: number | null;
	tachesAFaireTotal: number | null;
	devisTotal: number | null;
	facturesTotal: number | null;
};

export async function fetchDashboardStats(): Promise<DashboardStats> {
	const [
		usersTotal,
		biensTotal,
		reservationsUpcomingTotal,
		reservationsTotal,
		tachesAFaireTotal,
		devisTotal,
		facturesTotal,
	] = await Promise.all([
		fetchUsersTotal(),
		fetchBiensTotal(),
		fetchReservationsUpcomingTotal(7),
		fetchReservationsTotal(),
		fetchTachesAFaireTotal(),
		fetchDevisTotal(),
		fetchFacturesTotal(),
	]);

	return {
		usersTotal,
		biensTotal,
		reservationsUpcomingTotal,
		reservationsTotal,
		tachesAFaireTotal,
		devisTotal,
		facturesTotal,
	};
}
