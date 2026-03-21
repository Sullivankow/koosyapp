// Composant React pour la création d'une facture
// Gère tous les champs nécessaires (numéro, dates, entreprise, lignes, conditions, notes)
// Calcule automatiquement les totaux (HT, TVA, TTC) à partir des lignes
// Permet d'ajouter/supprimer des lignes dynamiquement
// Utilise le thème pour les couleurs
// Appelle la fonction onSubmit avec la facture complète lors de la validation
// Les champs obligatoires sont vérifiés (ex : entreprise)
// Les dates sont saisies au format JJ/MM/AAAA (pas de datepicker ici)
// Le bouton "Créer" envoie la facture, "Annuler" ferme la modale sans rien faire
// Les styles sont adaptés pour une modale centrée et responsive

import React, { useState, useEffect } from 'react';
import { Facture, LigneFacture, Entreprise } from '../models/models';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, Modal, KeyboardAvoidingView, Dimensions } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface AddFactureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (facture: Partial<Facture>) => void;
  entreprises: Entreprise[];
}

// Valeurs par défaut pour une ligne de facture
const defaultLigne: Omit<LigneFacture, 'id'> = {
  description: '',
  quantite: 1,
  prixUnitaireHT: 0,
  tva: 20,
  totalLigneHT: 0,
  totalLigneTTC: 0,
};

const AddFactureModal: React.FC<AddFactureModalProps> = ({ isOpen, onClose, onSubmit, entreprises }) => {
  // Champs principaux de la facture
  const [numero, setNumero] = useState('');
  const [dateEmission, setDateEmission] = useState('');
  const [dateEcheance, setDateEcheance] = useState('');
  const [entreprise, setEntreprise] = useState<Entreprise | null>(null);
  // Lignes de la facture (tableau dynamique)
  const [lignes, setLignes] = useState([ { ...defaultLigne } ]);
  // Champs optionnels
  const [conditionsPaiement, setConditionsPaiement] = useState('');
  const [notes, setNotes] = useState('');
  // Gestion des erreurs
  const [error, setError] = useState('');
  // Thème pour les couleurs
  const { colors } = useTheme();
  const SCREEN_WIDTH = Dimensions.get('window').width;

  // Sélection automatique de la première entreprise si dispo
  useEffect(() => {
    if (isOpen && entreprises.length > 0) {
      setEntreprise(entreprises[0]);
    }
  }, [isOpen, entreprises]);

  // Calcul automatique des totaux pour une ligne
  const calcLigne = (ligne: any) => {
    const totalHT = Number(ligne.quantite) * Number(ligne.prixUnitaireHT);
    const totalTTC = totalHT * (1 + Number(ligne.tva) / 100);
    return { ...ligne, totalLigneHT: totalHT, totalLigneTTC: totalTTC };
  };

  // Met à jour une ligne (champ modifié)
  const handleLigneChange = (idx: number, field: keyof LigneFacture, value: any) => {
    const newLignes = lignes.map((l, i) =>
      i === idx ? calcLigne({ ...l, [field]: value }) : l
    );
    setLignes(newLignes);
  };

  // Ajoute une nouvelle ligne
  const addLigne = () => setLignes([...lignes, { ...defaultLigne }]);
  // Supprime une ligne (si plus d'une)
  const removeLigne = (idx: number) => setLignes(lignes.length > 1 ? lignes.filter((_, i) => i !== idx) : lignes);

  // Calcul des totaux globaux
  const montantHT = lignes.reduce((sum, l) => sum + (l.totalLigneHT ?? 0), 0);
  const montantTVA = lignes.reduce((sum, l) => sum + ((l.totalLigneHT ?? 0) * (l.tva ?? 0)) / 100, 0);
  const montantTTC = montantHT + montantTVA;

  // Validation et envoi de la facture
  const handleSubmit = () => {
    if (!entreprise) {
      setError("Aucune entreprise disponible");
      return;
    }
    setError('');
    onSubmit({
      numero,
      dateEmission,
      dateEcheance,
      entreprise,
      lignes: lignes as any,
      montantHT,
      montantTVA,
      montantTTC,
      conditionsPaiement,
      notes,
      statut: 'brouillon', // statut initial
    });
    onClose();
    // Reset du formulaire
    setNumero(''); setDateEmission(''); setDateEcheance(''); setLignes([{ ...defaultLigne }]); setConditionsPaiement(''); setNotes('');
  };

  // Si la modale n'est pas ouverte, ne rien afficher
  if (!isOpen) return null;

  return (
    <Modal visible={isOpen} animationType="slide" transparent>
      <View style={styles.modalOverlayAdd}>
        <KeyboardAvoidingView behavior="padding" style={{ flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center' }}>
          <View style={[styles.modalContentAdd, { backgroundColor: colors.surface }]}> 
            <ScrollView
              style={{ maxHeight: 500, width: '100%' }}
              contentContainerStyle={{ alignItems: 'center', paddingBottom: 30 }}
              keyboardShouldPersistTaps="handled"
              horizontal={false}
            >
              <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 12, color: colors.primary }}>Créer une facture</Text>
              {/* Affichage de l'entreprise sélectionnée */}
              <Text style={[styles.label, { color: colors.text }]}>Entreprise</Text>
              <View style={{ width: '100%', marginBottom: 10, paddingVertical: 8, paddingHorizontal: 12, borderWidth: 1, borderColor: colors.border, borderRadius: 10, backgroundColor: colors.surface }}>
                {entreprise ? (
                  <Text style={{ color: colors.text, fontWeight: 'bold' }}>{entreprise.nom}</Text>
                ) : (
                  <Text style={{ color: colors.error, fontWeight: 'bold' }}>Aucune entreprise trouvée.</Text>
                )}
              </View>
              {/* Numéro de facture (optionnel) */}
              <Text style={[styles.label, { color: colors.text }]}>Numéro</Text>
              <TextInput style={[styles.input, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border }]} value={numero} onChangeText={setNumero} placeholder="Numéro de la facture (optionnel)" placeholderTextColor={colors.textSecondary} />
              {/* Dates d'émission et d'échéance */}
              <Text style={[styles.label, { color: colors.text }]}>Date d'émission</Text>
              <TextInput style={[styles.input, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border }]} value={dateEmission} onChangeText={setDateEmission} placeholder="JJ/MM/AAAA" placeholderTextColor={colors.textSecondary} />
              <Text style={[styles.label, { color: colors.text }]}>Date d'échéance</Text>
              <TextInput style={[styles.input, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border }]} value={dateEcheance} onChangeText={setDateEcheance} placeholder="JJ/MM/AAAA" placeholderTextColor={colors.textSecondary} />
              {/* Lignes de facture dynamiques */}
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Lignes de la facture</Text>
              {lignes.map((ligne, idx) => (
                <View key={idx} style={[styles.ligneBox, { borderColor: colors.border, backgroundColor: colors.surface, width: '100%', maxWidth: 500 }]}> 
                  <Text style={[styles.label, { color: colors.text }]}>Description</Text>
                  <TextInput
                    style={[styles.input, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border, width: '100%', minWidth: 0, maxWidth: '100%' }]}
                    placeholder="Ex : Peinture chambre, Pose parquet..."
                    placeholderTextColor={colors.textSecondary}
                    value={ligne.description}
                    onChangeText={v => handleLigneChange(idx, 'description', v)}
                  /> 
                  <Text style={[styles.label, { color: colors.text }]}>Quantité</Text>
                  <TextInput
                    style={[styles.input, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border, width: '100%', minWidth: 0, maxWidth: '100%' }]}
                    placeholder="Ex : 2, 5, 1"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="numeric"
                    value={String(ligne.quantite)}
                    onChangeText={v => handleLigneChange(idx, 'quantite', Number(v))}
                  /> 
                  <Text style={[styles.label, { color: colors.text }]}>Prix unitaire HT (€)</Text>
                  <TextInput
                    style={[styles.input, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border, width: '100%', minWidth: 0, maxWidth: '100%' }]}
                    placeholder="Ex : 120"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="numeric"
                    value={String(ligne.prixUnitaireHT)}
                    onChangeText={v => handleLigneChange(idx, 'prixUnitaireHT', Number(v))}
                  /> 
                  <Text style={[styles.label, { color: colors.text }]}>TVA (%)</Text>
                  <TextInput
                    style={[styles.input, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border, width: '100%', minWidth: 0, maxWidth: '100%' }]}
                    placeholder="Ex : 20"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="numeric"
                    value={String(ligne.tva)}
                    onChangeText={v => handleLigneChange(idx, 'tva', Number(v))}
                  /> 
                  {/* Totaux de la ligne */}
                  <Text style={{ color: colors.text }}>Total HT: {(ligne.totalLigneHT ?? 0).toFixed(2)} €</Text>
                  <Text style={{ color: colors.text }}>Total TTC: {(ligne.totalLigneTTC ?? 0).toFixed(2)} €</Text>
                  {/* Bouton pour supprimer la ligne */}
                  <TouchableOpacity onPress={() => removeLigne(idx)} disabled={lignes.length === 1} style={[styles.removeBtn, { backgroundColor: colors.error }]}> 
                    <Text style={{ color: '#fff' }}>Supprimer</Text>
                  </TouchableOpacity>
                </View>
              ))}
              {/* Bouton pour ajouter une ligne */}
              <TouchableOpacity onPress={addLigne} style={[styles.addBtn, { backgroundColor: colors.primary }]}> 
                <Text style={{ color: '#fff' }}>Ajouter une ligne</Text>
              </TouchableOpacity>
              {/* Récapitulatif des totaux */}
              <Text style={[styles.summary, { color: colors.text }]}>Total HT: {montantHT.toFixed(2)} € | TVA: {montantTVA.toFixed(2)} € | TTC: {montantTTC.toFixed(2)} €</Text>
              {/* Conditions de paiement et notes */}
              <Text style={[styles.label, { color: colors.text }]}>Conditions de paiement</Text>
              <TextInput style={[styles.input, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border }]} value={conditionsPaiement} onChangeText={setConditionsPaiement} placeholder="Conditions de paiement" placeholderTextColor={colors.textSecondary} multiline />
              <Text style={[styles.label, { color: colors.text }]}>Notes</Text>
              <TextInput style={[styles.input, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border }]} value={notes} onChangeText={setNotes} placeholder="Notes" placeholderTextColor={colors.textSecondary} multiline />
              {/* Affichage des erreurs éventuelles */}
              {error ? <Text style={{ color: colors.error, marginTop: 10, textAlign: 'center' }}>{error}</Text> : null}
              {/* Boutons d'action */}
              <View style={styles.btnRow}>
                <TouchableOpacity onPress={handleSubmit} style={[styles.submitBtn, { backgroundColor: colors.success }]}> 
                  <Text style={{ color: colors.surface, fontWeight: 'bold', fontSize: 16 }}>Créer</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onClose} style={[styles.cancelBtn, { backgroundColor: colors.error }]}> 
                  <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Annuler</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

export default AddFactureModal;

// Styles pour la modale et les champs
const SCREEN_WIDTH = Dimensions.get('window').width;
const styles = StyleSheet.create({
  modalOverlayAdd: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContentAdd: {
    width: SCREEN_WIDTH * 0.9,
    borderRadius: 18,
    padding: 22,
    elevation: 6,
    shadowColor: '#000',
  },
  label: { marginTop: 10, marginBottom: 2, fontWeight: 'bold' },
  sectionTitle: { marginTop: 18, marginBottom: 6, fontWeight: 'bold', fontSize: 16 },
  input: { borderWidth: 1, borderRadius: 8, padding: 8, marginBottom: 8 },
  ligneBox: { marginBottom: 12, padding: 10, borderWidth: 1, borderRadius: 10 },
  addBtn: { marginTop: 8, marginBottom: 8, padding: 10, borderRadius: 8, alignItems: 'center' },
  removeBtn: { marginTop: 8, padding: 8, borderRadius: 8, alignItems: 'center' },
  summary: { marginTop: 10, marginBottom: 10, fontWeight: 'bold' },
  btnRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  submitBtn: { flex: 1, marginRight: 8, padding: 12, borderRadius: 8, alignItems: 'center' },
  cancelBtn: { flex: 1, marginLeft: 8, padding: 12, borderRadius: 8, alignItems: 'center' },
});
