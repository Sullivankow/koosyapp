import { useState, useEffect } from 'react';
import { apiFetchMyEntreprise } from '../utils/api';
import { Entreprise } from '../models/models';

// Hook pour récupérer la liste des entreprises de l'utilisateur connecté
export function useEntreprises() {
  const [entreprises, setEntreprises] = useState<Entreprise[]>([]);
  useEffect(() => {
    apiFetchMyEntreprise()
      .then((data) => {
        if (Array.isArray(data)) setEntreprises(data);
        else if (data) setEntreprises([data]);
        else setEntreprises([]);
      })
      .catch(() => setEntreprises([]));
  }, []);
  return entreprises;
}
