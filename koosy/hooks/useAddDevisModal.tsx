import React, { useState } from 'react';
import { createDevis } from '../utils/api';
import AddDevisModal from '../components/AddDevisModal';
import { Entreprise } from '../models/models';

export const useAddDevisModal = (entreprises: Entreprise[]) => {
  const [visible, setVisible] = useState(false);
  // Initialisation à [] pour éviter l'erreur de typage
  const [lastDevis, setLastDevis] = useState<any[]>([]);

  const open = () => setVisible(true);
  const close = () => setVisible(false);

  const handleSubmit = async (devis: any) => {
    try {
      // On envoie seulement l'id de l'entreprise au backend
      const payload = {
        ...devis,
        entreprise: devis.entreprise?.id ?? devis.entreprise // si déjà un id, sinon objet
      };
      const res = await createDevis(payload);
      setLastDevis({ ...devis, id: res.id });
      setVisible(false);
      alert('Le devis a bien été créé !');
    } catch (e: any) {
      const msg = typeof e === 'object' && e !== null && 'message' in e ? (e as any).message : String(e);
      alert("Erreur lors de la création du devis : " + msg);
    }
  };

  const modal = (
    <AddDevisModal
      isOpen={visible}
      onClose={close}
      onSubmit={handleSubmit}
      entreprises={entreprises}
    />
  );

  return { open, close, modal, lastDevis };
};
