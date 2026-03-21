import React, { useState } from 'react';
import { createFacture } from '../utils/api';
import AddFactureModal from '../components/AddFactureModal';
import { Entreprise } from '../models/models';

// Hook personnalisé pour gérer l'ouverture/fermeture de la modale de création de facture
// et l'envoi de la facture au backend
export const useAddFactureModal = (entreprises: Entreprise[]) => {
  const [visible, setVisible] = useState(false);
  // Initialisation à [] pour éviter l'erreur de typage
  const [lastFacture, setLastFacture] = useState<any[]>([]);

  const open = () => setVisible(true);
  const close = () => setVisible(false);

  // Soumission de la facture (appel API)
  // Convertit une date JJ/MM/AAAA en ISO (ou retourne undefined si vide)
  function toISO(dateStr: string) {
    if (!dateStr) return undefined;
    const [jour, mois, annee] = dateStr.split('/');
    if (!jour || !mois || !annee) return undefined;
    const d = new Date(Number(annee), Number(mois) - 1, Number(jour));
    return d.toISOString();
  }

  const handleSubmit = async (facture: any) => {
    try {
      // On envoie seulement l'id de l'entreprise au backend et on convertit les dates
      const payload = {
        ...facture,
        dateEmission: toISO(facture.dateEmission),
        dateEcheance: toISO(facture.dateEcheance),
        entreprise: facture.entreprise?.id ?? facture.entreprise
      };
      const res = await createFacture(payload);
      setLastFacture({ ...facture, id: res.id });
      setVisible(false);
      alert('La facture a bien été créée !');
    } catch (e: any) {
      const msg = typeof e === 'object' && e !== null && 'message' in e ? (e as any).message : String(e);
      alert("Erreur lors de la création de la facture : " + msg);
    }
  };

  // Composant modale prêt à être utilisé dans le screen
  const modal = (
    <AddFactureModal
      isOpen={visible}
      onClose={close}
      onSubmit={handleSubmit}
      entreprises={entreprises}
    />
  );

  return { open, close, modal, lastFacture };
};
