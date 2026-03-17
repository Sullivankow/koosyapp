import React, { useState } from 'react';
import AddDevisModal from '../components/AddDevisModal';
import { Entreprise } from '../models/models';

export const useAddDevisModal = (entreprises: Entreprise[]) => {
  const [visible, setVisible] = useState(false);
  const [lastDevis, setLastDevis] = useState(null);

  const open = () => setVisible(true);
  const close = () => setVisible(false);

  const handleSubmit = (devis: any) => {
    setLastDevis(devis);
    setVisible(false);
    // TODO: envoyer le devis au backend ici
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
