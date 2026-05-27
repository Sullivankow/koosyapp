import { useState, useEffect, useCallback } from 'react';
import { getBiens, updateBien, deleteBien, getImageUrl } from '../utils/bienApi';
import type { Bien } from '../models/models';

/**
 * Hook personnalisé pour gérer la liste des biens et les opérations associées
 * Fournit :
 * - biens : liste des biens
 * - fetchBiens : fonction pour rafraîchir la liste
 * - updateBienById : fonction pour mettre à jour un bien
 * - deleteBienById : fonction pour supprimer un bien
 * - loading : booléen de chargement
 * - error : message d'erreur éventuel
 */
export default function useBiens(deps: unknown[] = []) {
  const [biens, setBiens] = useState<Bien[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Récupération des biens depuis l'API
  const fetchBiens = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const biensData = await getBiens();
      // Mapping et sécurisation des données (reprend la logique de BiensScreen)
      const mappedBiens = biensData.map((bien: any) => {
        let photos: { uri: string }[] = [];

        if (bien.images && bien.images.length > 0) {
          photos = bien.images
            .map((img: any) => {
              const cleanedPath = img.url?.replace(/\\|\//g, '/');
              const uri = cleanedPath ? getImageUrl(cleanedPath) : '';
              return uri && uri.trim() !== '' ? { uri } : null;
            })
            .filter((img: any) => img && img.uri && img.uri.trim() !== '');
        }

        if (photos.length === 0) {
          photos = [require('../assets/house.jpg')];
        }

        return {
          ...bien,
          photos,
          proprio: (bien.proprietaireNom || bien.proprietaireEmail || bien.proprietaireTelephone)
            ? {
                nom: bien.proprietaireNom || 'N/A',
                email: bien.proprietaireEmail || '',
                telephone: bien.proprietaireTelephone || '',
              }
            : bien.proprietaire
            ? {
                nom: bien.proprietaire.nom || 'N/A',
                email: bien.proprietaire.email || '',
                telephone: bien.proprietaire.telephone || '',
              }
            : {
                nom: 'N/A',
                email: '',
                telephone: '',
              },
          locataires: Array.isArray(bien.locataires)
            ? bien.locataires.map((loc: any) => ({
                id: loc.id?.toString() || '',
                nom: loc.nom || 'N/A',
                dateArrivee: loc.dateArrivee || '',
                dateDepart: loc.dateDepart || '',
              }))
            : [],
          taches: Array.isArray(bien.taches)
            ? bien.taches.map((tache: any) => ({
                id: tache.id?.toString() || '',
                titre: tache.titre || 'N/A',
                statut: tache.statut || '',
                dateEcheance: tache.dateEcheance || '',
              }))
            : [],
          prestations: Array.isArray(bien.prestations)
            ? bien.prestations.map((prestation: any) => ({
                id: prestation.id,
                description: prestation.description || '',
                status: prestation.status || '',
                date_prestation: prestation.date_prestation || '',
                amount_cents: prestation.amount_cents ?? 0,
                currency: prestation.currency || 'EUR',
              }))
            : [],
        } as Bien;
      });

      setBiens(mappedBiens);
    } catch (err: any) {
      setError('Erreur lors de la récupération des biens');
    } finally {
      setLoading(false);
    }
  }, []);

  // Rafraîchit la liste à chaque changement de dépendances
  useEffect(() => {
    fetchBiens();
    // eslint-disable-next-line
  }, deps);

  // Mise à jour d'un bien
  const updateBienById = useCallback(async (id: string, payload: any) => {
    setLoading(true);
    setError(null);
    try {
      const res = await updateBien(id, payload);
      await fetchBiens();
      return res;
    } catch (err: any) {
      setError('Erreur lors de la mise à jour du bien');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchBiens]);

  // Suppression d'un bien
  const deleteBienById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await deleteBien(id);
      await fetchBiens();
    } catch (err: any) {
      setError('Erreur lors de la suppression du bien');
    } finally {
      setLoading(false);
    }
  }, [fetchBiens]);

  return {
    biens,
    fetchBiens,
    updateBienById,
    deleteBienById,
    loading,
    error,
    setBiens, // optionnel si besoin de manipuler directement
  };
}
