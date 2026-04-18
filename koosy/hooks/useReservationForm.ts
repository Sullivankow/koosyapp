import { useState } from 'react';
import dayjs from 'dayjs';
import { createReservation } from '../utils/reservationApi';

// Structure de l'état du formulaire de réservation
export type ReservationFormState = {
  bienId: string;
  locataireNom: string;
  locatairePrenom: string;
  locataireEmail: string;
  locataireTelephone: string;
  dateArrivee: string;
  dateDepart: string;
  heureArrivee: string;
  heureDepart: string;
  statut: 'confirmée' | 'en attente';
};

const initialForm: ReservationFormState = {
  bienId: '',
  locataireNom: '',
  locatairePrenom: '',
  locataireEmail: '',
  locataireTelephone: '',
  dateArrivee: '',
  dateDepart: '',
  heureArrivee: '',
  heureDepart: '',
  statut: 'en attente',
};
/**
 * Hook pour gérer le formulaire d'ajout de réservation :
 * - expose l'état du formulaire et son setter
 * - valide les champs obligatoires
 * - envoie la réservation au backend en formatant les dates
 * - permet de réagir au succès ou à l'erreur via des callbacks.
 */
export function useReservationForm(onSuccess?: () => void, onError?: (e: any) => void) {
  const [form, setForm] = useState<ReservationFormState>(initialForm);
  const [loading, setLoading] = useState(false);

  const resetForm = () => setForm(initialForm);

  const validate = () => {
    return (
      form.bienId &&
      form.locataireNom &&
      form.locatairePrenom &&
      form.locataireEmail &&
      form.dateArrivee &&
      form.dateDepart
    );
  };

  const handleAddReservation = async () => {
    if (!validate()) {
      alert('Merci de remplir tous les champs obligatoires.');
      return;
    }
    setLoading(true);
    try {
      const formatToFR = (iso: string) => {
        if (/^(\d{4})-(\d{2})-(\d{2})$/.test(iso)) {
          return dayjs(iso).format('DD/MM/YYYY');
        }
        return iso;
      };
      await createReservation({
        bienId: Number(form.bienId),
        locataireNom: form.locataireNom,
        locatairePrenom: form.locatairePrenom,
        locataireEmail: form.locataireEmail,
        locataireTelephone: form.locataireTelephone,
        dateDebut: formatToFR(form.dateArrivee),
        heureArrivee: form.heureArrivee,
        dateFin: formatToFR(form.dateDepart),
        heureDepart: form.heureDepart,
        statut: form.statut,
      });
      resetForm();
      if (onSuccess) onSuccess();
    } catch (e) {
      if (onError) onError(e);
      else alert("Erreur lors de l'ajout de la réservation");
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    setForm,
    loading,
    resetForm,
    handleAddReservation,
    validate,
  };
}
