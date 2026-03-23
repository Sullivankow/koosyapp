import React, { useState, useEffect } from 'react';
import { usePrestationsCount } from '../contexts/PrestationsCountContext';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions, KeyboardAvoidingView, ScrollView } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { getBiens, createPrestation } from '../utils/api';
import dayjs from 'dayjs';

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

const AddPrestationModal: React.FC<AddPrestationModalProps> = ({ visible, onClose, onSuccess, bienId }) => {
  const { colors } = useTheme();
  const { refreshPrestationsTerminees } = usePrestationsCount();
  const [form, setForm] = useState<{
    bienId: number | '';
    amount: string;
    description: string;
    date_prestation: string; // format français
    status: PrestationStatus;
  }>({
    bienId: bienId || '',
    amount: '',
    description: '',
    date_prestation: dayjs().format('DD/MM/YYYY'),
    status: 'Confirmée',
  });
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [biens, setBiens] = useState<any[]>([]);

  useEffect(() => {
    if (visible) {
      getBiens().then(data => setBiens(data)).catch(() => setBiens([]));
    }
  }, [visible]);

  const handleSubmit = async () => {
    setLoading(true);
    setSuccessMsg('');
    try {
      // Conversion explicite de la date au format backend
      let dateBackend = '';
      if (form.date_prestation && form.date_prestation.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
        // Format JJ/MM/AAAA
        const [jour, mois, annee] = form.date_prestation.split('/');
        dateBackend = `${annee}-${mois}-${jour}`;
      } else if (form.date_prestation && form.date_prestation.match(/^\d{4}-\d{2}-\d{2}$/)) {
        // Format déjà backend
        dateBackend = form.date_prestation;
      } else {
        // Format inconnu, on tente dayjs
        dateBackend = dayjs(form.date_prestation).format('YYYY-MM-DD');
      }
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
        setForm({ bienId: bienId || '', amount: '', description: '', date_prestation: dayjs().format('DD/MM/YYYY'), status: 'Confirmée' });
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
              <View style={{ width: SCREEN_WIDTH * 0.8, marginBottom: 10, borderWidth: 1, borderColor: colors.primary, borderRadius: 10, backgroundColor: '#f9f9ff', padding: 8 }}>
                <Text style={{ color: colors.primary, fontWeight: 'bold', marginBottom: 8, fontSize: 16 }}>Sélectionner un bien</Text>
                <ScrollView style={{ maxHeight: 140 }}>
                  {biens.length === 0 ? (
                    <Text style={{ color: colors.error, textAlign: 'center', marginVertical: 12 }}>Aucun bien disponible</Text>
                  ) : (
                    biens.map(bien => (
                      <TouchableOpacity
                        key={bien.id}
                        style={{ padding: 10, borderRadius: 8, backgroundColor: form.bienId === bien.id ? colors.primary : '#e6e6fa', marginBottom: 6, borderWidth: form.bienId === bien.id ? 2 : 0, borderColor: colors.primary }}
                        onPress={() => setForm(f => ({ ...f, bienId: bien.id }))}
                      >
                        <Text style={{ color: form.bienId === bien.id ? colors.surface : '#222', fontWeight: 'bold', fontSize: 15 }}>{bien.nom} ({bien.adresse})</Text>
                      </TouchableOpacity>
                    ))
                  )}
                </ScrollView>
                {!form.bienId && <Text style={{ color: colors.error, marginTop: 6, textAlign: 'center' }}>Veuillez sélectionner un bien</Text>}
              </View>
              <TextInput style={[styles.input, { color: '#111' }]} placeholder="Montant (€)" placeholderTextColor="#888" value={form.amount} onChangeText={v => setForm(f => ({ ...f, amount: v }))} keyboardType="decimal-pad" />
              <TextInput style={[styles.input, { color: '#111' }]} placeholder="Description (optionnelle)" placeholderTextColor="#888" value={form.description} onChangeText={v => setForm(f => ({ ...f, description: v }))} multiline />
              <TextInput style={[styles.input, { color: '#111' }]} placeholder="Date de la prestation (JJ/MM/AAAA)" placeholderTextColor="#888" value={form.date_prestation} onChangeText={v => setForm(f => ({ ...f, date_prestation: v }))} />
              <View style={{ width: SCREEN_WIDTH * 0.8, marginBottom: 10 }}>
                <Text style={{ color: colors.textSecondary, marginBottom: 4 }}>Statut</Text>
                {PRESTATION_STATUTS.map(opt => (
                  <TouchableOpacity
                    key={opt.value}
                    style={{ padding: 8, borderRadius: 8, backgroundColor: form.status === opt.value ? colors.primary : '#f5f5f5', marginBottom: 4 }}
                    onPress={() => setForm(f => ({ ...f, status: opt.value as PrestationStatus }))}
                  >
                    <Text style={{ color: form.status === opt.value ? colors.surface : '#222', fontWeight: 'bold' }}>{opt.label}</Text>
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
