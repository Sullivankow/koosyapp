import { useState, useEffect } from 'react';
import { getDevis, deleteDevis } from '../utils/api';
import { getSession } from '../utils/session';
import type { Devis } from '../models/models';

/**
 * Hook personnalisé pour gérer la liste des devis, le token PDF et l'aperçu PDF.
 * lastDevis sert uniquement de "clé de rafraîchissement" : à chaque changement,
 * la liste des devis est rechargée depuis l'API.
 * Fournit les états et fonctions pour manipuler les devis dans l'application.
 */
export function useDevisManager(lastDevis?: unknown) {
  // Liste des devis
  const [devis, setDevis] = useState<Devis[]>([]);
  // Token JWT pour l'authentification PDF
  const [pdfToken, setPdfToken] = useState<string | null>(null);
  // État pour l'aperçu PDF (id du devis à prévisualiser)
  const [previewId, setPreviewId] = useState<number | null>(null);

  // Récupère la liste des devis à chaque changement de lastDevis
  useEffect(() => {
    getDevis().then(setDevis).catch(() => setDevis([]));
  }, [lastDevis]);

  // Récupère le token JWT au montage du composant
  useEffect(() => {
    getSession().then(session => {
      setPdfToken(session?.token || null);
    });
  }, []);

  /**
   * Supprime un devis par son id
   * @param id identifiant du devis à supprimer
   */
  const handleDeleteDevis = async (id: number) => {
    try {
      await deleteDevis(id);
      // Met à jour la liste après suppression
      setDevis(devis => devis.filter(d => d.id !== id));
    } catch {
      // Optionnel : gérer l'erreur de suppression
    }
  };

  /**
   * Ouvre l'aperçu PDF pour un devis donné
   * @param item le devis à prévisualiser
   */
  const handlePreviewDevis = (item: Devis) => {
    setPreviewId(item.id ?? null);
  };

  return {
    devis,
    setDevis,
    pdfToken,
    setPdfToken,
    previewId,
    setPreviewId,
    handleDeleteDevis,
    handlePreviewDevis,
  };
}
