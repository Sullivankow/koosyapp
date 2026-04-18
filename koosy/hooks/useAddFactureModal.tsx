import React, { useState } from 'react';
import { ApiError, createFacture, getMe } from '../utils/api';
import AddFactureModal from '../components/modals/AddFactureModal';
import SubscriptionPaywallModal from '../components/modals/SubscriptionPaywallModal';
import { Entreprise } from '../models/models';

// Type minimal pour ce que le hook expose au reste de l'application
type UseAddFactureModalResult = {
  open: () => void;
  close: () => void;
  modal: React.ReactNode;
  // Dernière facture créée (ou null tant qu'aucune facture n'a été créée via ce hook)
  lastFacture: any | null;
};

// Convertit une date JJ/MM/AAAA en ISO (ou retourne undefined si vide ou invalide)
function toISO(dateStr: string | undefined): string | undefined {
  if (!dateStr) return undefined;
  const [jour, mois, annee] = dateStr.split('/');
  if (!jour || !mois || !annee) return undefined;
  const d = new Date(Number(annee), Number(mois) - 1, Number(jour));
  return d.toISOString();
}

// Hook personnalisé pour gérer l'ouverture/fermeture de la modale de création de facture
// et l'envoi de la facture au backend
export const useAddFactureModal = (entreprises: Entreprise[]): UseAddFactureModalResult => {
  const [visible, setVisible] = useState(false);
  // Stocke la dernière facture créée via ce hook
  const [lastFacture, setLastFacture] = useState<any | null>(null);
  const [paywallVisible, setPaywallVisible] = useState(false);

  // Nouvelle logique : vérifie l’abonnement avant d’ouvrir la modale
  const open = async () => {
    try {
      const me = await getMe();
      const hasBeta = me?.betaAccessUntil && new Date(me.betaAccessUntil).getTime() >= Date.now();
      if (me?.abonnement === 'premium' || hasBeta) {
        setVisible(true);
      } else {
        setPaywallVisible(true);
      }
    } catch {
      setPaywallVisible(true);
    }
  };
  const close = () => setVisible(false);

  // Soumission de la facture (appel API)
  const handleSubmit = async (facture: any) => {
    try {
      // On envoie seulement l'id de l'entreprise au backend et on convertit les dates
      const payload = {
        ...facture,
        dateEmission: toISO(facture.dateEmission),
        dateEcheance: toISO(facture.dateEcheance),
        entreprise: facture.entreprise?.id ?? facture.entreprise,
      };

      const res = await createFacture(payload);

      setLastFacture({ ...facture, id: res.id });
      setVisible(false);
      alert('La facture a bien été créée !');
    } catch (e: any) {
      const msg =
        typeof e === 'object' && e !== null && 'message' in e
          ? (e as any).message
          : String(e);
      alert('Erreur lors de la création de la facture : ' + msg);
    }
  };

  // Composant modale prêt à être utilisé dans le screen
  const modal = (
    <>
      <AddFactureModal
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

  return { open, close, modal, lastFacture };
};
