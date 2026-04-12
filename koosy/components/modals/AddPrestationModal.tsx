import React, { useState, useEffect, useCallback } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions, KeyboardAvoidingView, ScrollView } from 'react-native';
import dayjs from 'dayjs';
import { usePrestationsCount } from '../../contexts/PrestationsCountContext';
import { useTheme } from '../../contexts/ThemeContext';
import { getBiens } from '../../utils/bienApi';
import { createPrestation } from '../../utils/prestationsApi';
import { Bien } from '../../models/models';

const SCREEN_WIDTH = Dimensions.get('window').width;

interface AddPrestationModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  bienId?: number;
}


const PRESTATION_STATUTS = [
  { label: 'En attente', value: 'En attente' },
  { label: 'Confirmée', value: 'Confirmée' },
  { label: 'Terminée', value: 'Terminée' },
];

export type PrestationStatus = 'En attente' | 'Confirmée' | 'Terminée';

const getContrastTextColor = (hexColor: string) => {
  const sanitized = (hexColor || '').replace('#', '');
  if (sanitized.length !== 6) return '#FFFFFF';

  const r = parseInt(sanitized.slice(0, 2), 16);
  const g = parseInt(sanitized.slice(2, 4), 16);
  const b = parseInt(sanitized.slice(4, 6), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;

  return yiq >= 170 ? '#1E242B' : '#FFFFFF';
};

type PrestationFormState = {
	bienId: number | '';
	amount: string;
	description: string;
	date_prestation: string; // format JJ/MM/AAAA pour l'UI
	status: PrestationStatus;
};

const buildInitialForm = (bienId?: number): PrestationFormState => ({
	bienId: bienId ?? '',
	amount: '',
	description: '',
	date_prestation: dayjs().format('DD/MM/YYYY'),
	status: 'Confirmée',
});

const AddPrestationModal: React.FC<AddPrestationModalProps> = ({ visible, onClose, onSuccess, bienId }) => {
  const { colors, isDarkMode } = useTheme();
  const activeStatusColor = colors.primary;
  const activeStatusTextColor = getContrastTextColor(activeStatusColor);
  const bienPickerBackground = isDarkMode ? colors.surface : '#f9f9ff';
  const bienOptionBackground = isDarkMode ? colors.background : '#e6e6fa';
  const bienOptionTextColor = isDarkMode ? colors.text : '#222';
  const { refreshPrestationsTerminees } = usePrestationsCount();
  const [form, setForm] = useState<PrestationFormState>(() => buildInitialForm(bienId));
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [biens, setBiens] = useState<Bien[]>([]);

  useEffect(() => {
    if (visible) {
      getBiens().then(data => setBiens(data)).catch(() => setBiens([]));
    }
  }, [visible]);

  // Réinitialise le formulaire quand la modale s'ouvre ou que le bien par défaut change
  useEffect(() => {
	if (visible) {
		setForm(buildInitialForm(bienId));
	}
  }, [visible, bienId]);

  const updateField = useCallback(
  (key: keyof PrestationFormState, value: PrestationFormState[keyof PrestationFormState]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  },
  [],
  );

  const toBackendDate = (value: string): string => {
	if (value && /^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
		const [jour, mois, annee] = value.split('/');
		return `${annee}-${mois}-${jour}`; // JJ/MM/AAAA -> YYYY-MM-DD
	}
	if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
		return value; // déjà au format backend
	}
	// Format inconnu : on laisse la logique existante basée sur dayjs
	return dayjs(value).format('YYYY-MM-DD');
  };

  const handleSubmit = async () => {
    setLoading(true);
    setSuccessMsg('');
    try {
      const dateBackend = toBackendDate(form.date_prestation);
      await createPrestation({
        bienId: Number(form.bienId),
        amount: Number(form.amount),
        description: form.description || undefined,
        date_prestation: dateBackend,
        status: form.status,
      });
      setSuccessMsg('Prestation ajoutée !');
      setTimeout(() => {
        setSuccessMsg('');
        setForm(buildInitialForm(bienId));
        setLoading(false);
        onClose();
        if (refreshPrestationsTerminees && form.status === 'Terminée') refreshPrestationsTerminees();
        if (onSuccess) onSuccess();
      }, 1200);
    } catch (err) {
      setSuccessMsg("Erreur lors de l'ajout");
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlayAdd}>
        <KeyboardAvoidingView behavior="padding" style={{ width: '100%', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
          <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}>
            <View style={[styles.modalContentAdd, { backgroundColor: colors.surface }]}> 
              <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 12, color: colors.primary }}>Ajouter une prestation</Text>
              <View style={{ width: SCREEN_WIDTH * 0.8, marginBottom: 10, borderWidth: 1, borderColor: colors.primary, borderRadius: 10, backgroundColor: bienPickerBackground, padding: 8 }}>
                <Text style={{ color: colors.text, fontWeight: 'bold', marginBottom: 8, fontSize: 16 }}>Sélectionner un bien</Text>
                <ScrollView style={{ maxHeight: 140 }}>
                  {biens.length === 0 ? (
                    <Text style={{ color: colors.error, textAlign: 'center', marginVertical: 12 }}>Aucun bien disponible</Text>
                  ) : (
                    biens.map(bien => (
                      <TouchableOpacity
                        key={bien.id}
                        style={{ padding: 10, borderRadius: 8, backgroundColor: form.bienId === bien.id ? colors.primary : bienOptionBackground, marginBottom: 6, borderWidth: form.bienId === bien.id ? 2 : 0, borderColor: colors.primary }}
                        onPress={() => updateField('bienId', bien.id)}
                      >
                        <Text style={{ color: form.bienId === bien.id ? colors.surface : bienOptionTextColor, fontWeight: 'bold', fontSize: 15 }}>{bien.nom} ({bien.adresse})</Text>
                      </TouchableOpacity>
                    ))
                  )}
                </ScrollView>
                {!form.bienId && <Text style={{ color: colors.error, marginTop: 6, textAlign: 'center' }}>Veuillez sélectionner un bien</Text>}
              </View>
              <TextInput style={[styles.input, { color: '#111' }]} placeholder="Montant (€)" placeholderTextColor="#888" value={form.amount} onChangeText={v => updateField('amount', v)} keyboardType="decimal-pad" />
              <TextInput style={[styles.input, { color: '#111' }]} placeholder="Description (optionnelle)" placeholderTextColor="#888" value={form.description} onChangeText={v => updateField('description', v)} multiline />
              <TextInput style={[styles.input, { color: '#111' }]} placeholder="Date de la prestation (JJ/MM/AAAA)" placeholderTextColor="#888" value={form.date_prestation} onChangeText={v => updateField('date_prestation', v)} />
              <View style={{ width: SCREEN_WIDTH * 0.8, marginBottom: 10 }}>
                <Text style={{ color: colors.textSecondary, marginBottom: 4 }}>Statut</Text>
                {PRESTATION_STATUTS.map(opt => (
                  <TouchableOpacity
                    key={opt.value}
                    activeOpacity={0.8}
                    style={{
                      padding: 8,
                      borderRadius: 8,
                      backgroundColor: form.status === opt.value ? activeStatusColor : colors.surface,
                      marginBottom: 4,
                      borderWidth: form.status === opt.value ? 2 : 1,
                      borderColor: form.status === opt.value ? activeStatusColor : colors.border,
                    }}
                    onPress={() => updateField('status', opt.value as PrestationStatus)}
                  >
                    <Text style={{ color: form.status === opt.value ? activeStatusTextColor : colors.text, fontWeight: 'bold' }}>{opt.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity style={[styles.input, { backgroundColor: colors.primary, marginTop: 18, alignItems: 'center' }]} onPress={handleSubmit} disabled={loading || !form.bienId || !form.amount}>
                <Text style={{ color: colors.surface, fontWeight: 'bold', fontSize: 16 }}>{loading ? 'Enregistrement...' : 'Enregistrer'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ marginTop: 10 }} onPress={onClose}>
                <Text style={{ color: colors.error, textAlign: 'center' }}>Annuler</Text>
              </TouchableOpacity>
              {successMsg ? <Text style={{ color: colors.success, marginTop: 10, textAlign: 'center' }}>{successMsg}</Text> : null}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    alignItems: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 10,
    fontSize: 15,
    backgroundColor: '#fff',
    width: SCREEN_WIDTH * 0.8,
  },
});

export default AddPrestationModal;
