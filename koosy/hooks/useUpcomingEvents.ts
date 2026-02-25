import { useState, useEffect } from 'react';
import { getMe, getEventsUpcoming } from '../utils/api';

/**
 * Hook pour charger les événements à venir (arrivées, départs, réservations).
 * @param daysAhead Nombre de jours à regarder en avant (par défaut 7)
 * @param limit Nombre maximum d'événements à récupérer (par défaut 10)
 * @returns { events, loading, error, refresh }
 */
export function useUpcomingEvents(daysAhead = 7, limit = 10) {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const me = await getMe();
      const eventsEnabled = me?.settings?.eventsEnabled ?? true;
      if (eventsEnabled) {
        const res = await getEventsUpcoming(daysAhead, limit, 1);
        const items = Array.isArray(res) ? res : (res?.items ?? []);
        setEvents(items);
      } else {
        setEvents([]);
      }
    } catch (err) {
      setEvents([]);
      setError('Erreur lors du chargement des événements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { events, loading, error, refresh: fetchEvents };
}
