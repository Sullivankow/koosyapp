import React, { useState } from 'react';
import { ApiError, createDevis, getMe } from '../utils/api';
import AddDevisModal from '../components/modals/AddDevisModal';
import SubscriptionPaywallModal from '../components/modals/SubscriptionPaywallModal';
import { Entreprise } from '../models/models';

// Type minimal pour ce que le hook expose au reste de l'application
type UseAddDevisModalResult = {
  open: () => void;
  close: () => void;
  modal: React.ReactNode;
  // Dernier devis créé (ou null tant qu'aucun devis n'a été créé via ce hook)
  lastDevis: any | null;
};

// Hook personnalisé pour gérer l'ouverture du modal de création de devis
export const useAddDevisModal = (entreprises: Entreprise[]): UseAddDevisModalResult => {
  // Contrôle de la visibilité de la modale
  const [visible, setVisible] = useState(false);
  // Stocke le dernier devis créé via ce hook
  const [lastDevis, setLastDevis] = useState<any | null>(null);
  const [paywallVisible, setPaywallVisible] = useState(false);

  // Nouvelle logique : vérifie l’abonnement avant d’ouvrir la modale
  const open = async () => {
    try {
      const me = await getMe();
      if (me?.abonnement === 'premium') {
        setVisible(true);
      } else {
        setPaywallVisible(true);
      }
    } catch {
      setPaywallVisible(true);
    }
  };
  const close = () => setVisible(false);

  // Soumission du formulaire de création de devis
  const handleSubmit = async (devis: any) => {
    try {
      // On envoie seulement l'id de l'entreprise au backend
      const payload = {
        ...devis,
        entreprise: devis.entreprise?.id ?? devis.entreprise,
      };

      const res = await createDevis(payload);

      setLastDevis({ ...devis, id: res.id });
      setVisible(false);
      alert('Le devis a bien été créé !');
    } catch (e: any) {
      // Construction d'un message d'erreur lisible quel que soit le type de l'exception
      const msg =
        typeof e === 'object' && e !== null && 'message' in e
          ? (e as any).message
          : String(e);
      alert('Erreur lors de la création du devis : ' + msg);
    }
  };

  // Instance de la modale, prête à être rendue dans un composant parent
  const modal = (
    <>
      <AddDevisModal
        isOpen={visible}
        onClose={close}
        onSubmit={handleSubmit}
        entreprises={entreprises}
      />
      <SubscriptionPaywallModal
        isOpen={paywallVisible}
        onClose={() => setPaywallVisible(false)}
        onSubscribe={() => {
          setPaywallVisible(false);
        }}
        price={14.99}
        periodLabel="mois"
      />
    </>
  );

  return { open, close, modal, lastDevis };
};
