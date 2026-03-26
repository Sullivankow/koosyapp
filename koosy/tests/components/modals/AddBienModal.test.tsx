// Exemple de fichier de test pour le composant AddBienModal
// NOTE : pour faire tourner ce test, il faudra configurer Jest
// et installer par exemple @testing-library/react-native.

import React from 'react';

// import { render } from '@testing-library/react-native';
// import { ThemeProvider } from '../../../contexts/ThemeContext';
// import { BienCountProvider } from '../../../contexts/BienCountContext';
// import AddBienModal from '../../../components/modals/AddBienModal';

// Petit test de base pour vérifier que Jest est bien configuré
// (à garder tant que la config de tests n'est pas finalisée).
describe('AddBienModal (tests de base)', () => {
  it('additionne correctement 1 + 1', () => {
    expect(1 + 1).toBe(2);
  });

  // Exemple de test de rendu (à activer une fois la lib de tests installée)
  // it('rend la modale en mode ajout', () => {
  //   const { getByText } = render(
  //     <ThemeProvider>
  //       <BienCountProvider>
  //         <AddBienModal visible={true} onClose={() => {}} />
  //       </BienCountProvider>
  //     </ThemeProvider>
  //   );
  //
  //   expect(getByText('Ajouter un bien')).toBeTruthy();
  // });
});
