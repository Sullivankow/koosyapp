import { useState, useEffect } from 'react';
import { getFactures, deleteFacture } from '../utils/api';
import { getSession } from '../utils/session';
import type { Facture } from '../models/models';

/**
 * Hook personnalisé pour gérer la liste des factures, le token PDF et l'aperçu PDF.
 * lastFacture sert uniquement de "clé de rafraîchissement" : à chaque changement,
 * la liste des factures est rechargée depuis l'API.
 * Fournit les états et fonctions pour manipuler les factures dans l'application.
 */
export function useFactureManager(lastFacture?: unknown) {
  // Liste des factures
  const [factures, setFactures] = useState<Facture[]>([]);
  // Token JWT pour l'authentification PDF
  const [pdfToken, setPdfToken] = useState<string | null>(null);
  // État pour l'aperçu PDF (id de la facture à prévisualiser)
  const [previewId, setPreviewId] = useState<number | null>(null);

  // Récupère la liste des factures à chaque changement de lastFacture
  useEffect(() => {
    getFactures().then(setFactures).catch(() => setFactures([]));
  }, [lastFacture]);

  // Récupère le token JWT au montage du composant
  useEffect(() => {
    getSession().then(session => {
      setPdfToken(session?.token || null);
    });
  }, []);

  /**
   * Supprime une facture par son id
   * @param id identifiant de la facture à supprimer
   */
  const handleDeleteFacture = async (id: number) => {
    try {
      await deleteFacture(id);
      // Met à jour la liste après suppression
      setFactures(factures => factures.filter(f => f.id !== id));
    } catch {
      // Optionnel : gérer l'erreur de suppression
    }
  };

  /**
   * Ouvre l'aperçu PDF pour une facture donnée
   * @param item la facture à prévisualiser
   */
  const handlePreviewFacture = (item: Facture) => {
    setPreviewId(item.id ?? null);
  };

  return {
    factures,
    setFactures,
    pdfToken,
    setPdfToken,
    previewId,
    setPreviewId,
    handleDeleteFacture,
    handlePreviewFacture,
  };
}
