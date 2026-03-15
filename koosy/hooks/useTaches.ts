import { useState, useEffect, useCallback } from 'react';
import {
  getTaches,
  deleteTache,
  markTacheAsTerminee,
  updateTacheStatut,
  deleteAllTachesTerminees
} from '../utils/api';
import { useTacheCount } from '../contexts/TacheCountContext';

// Type pour une tâche
export type Tache = {
  id: string;
  titre: string;
  description: string;
  statut: 'à faire' | 'en cours' | 'terminée';
  dateEcheance?: string;
  bienTitre?: string;
};

/**
 * Hook personnalisé pour gérer l'état et les actions sur les tâches.
 * Centralise la récupération, la suppression, la mise à jour et le rafraîchissement des tâches.
 */
export function useTaches() {
  const [taches, setTaches] = useState<Tache[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const { refreshTacheCount } = useTacheCount();

  // Récupère et mappe les tâches depuis l'API
  const fetchTaches = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTaches();
      setTaches(data.map((t: any) => ({
        id: t.id?.toString() || '',
        titre: t.titre,
        description: t.description || '',
        statut: t.statut,
        dateEcheance: t.dateEcheance || '',
        bienTitre: t.bien?.nom || '',
      })));
    } catch (err: any) {
      setError('Erreur lors du chargement des tâches');
      setTaches([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Suppression d'une tâche
  const handleDelete = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await deleteTache(id);
      await fetchTaches();
    } catch {
      setError('Erreur lors de la suppression de la tâche');
    } finally {
      setLoading(false);
    }
  }, [fetchTaches]);

  // Marquer une tâche comme terminée
  const handleMarkTerminee = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await markTacheAsTerminee(id);
      await fetchTaches();
      await refreshTacheCount(); // Ajout du rafraîchissement du compteur
    } catch {
      setError('Erreur lors du changement de statut');
    } finally {
      setLoading(false);
    }
  }, [fetchTaches, refreshTacheCount]);

  // Mettre à jour le statut d'une tâche
  const handleMarkStatut = useCallback(async (id: string, statut: string) => {
    setLoading(true);
    setError(null);
    try {
      await updateTacheStatut(id, statut);
      await fetchTaches();
      await refreshTacheCount(); // Ajout du rafraîchissement du compteur
    } catch {
      setError('Erreur lors du changement de statut');
    } finally {
      setLoading(false);
    }
  }, [fetchTaches, refreshTacheCount]);

  // Supprimer toutes les tâches terminées
  const handleDeleteAllTerminees = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await deleteAllTachesTerminees();
      await fetchTaches();
      setSuccessMsg('Toutes les tâches terminées ont été supprimées.');
      setTimeout(() => setSuccessMsg(null), 2500);
    } catch {
      setError('Erreur lors de la suppression des tâches terminées');
    } finally {
      setLoading(false);
    }
  }, [fetchTaches]);

  // Chargement initial
  useEffect(() => {
    fetchTaches();
  }, [fetchTaches]);

  return {
    taches,
    loading,
    error,
    successMsg,
    fetchTaches,
    handleDelete,
    handleMarkTerminee,
    handleMarkStatut,
    handleDeleteAllTerminees,
    setSuccessMsg,
  };
}
