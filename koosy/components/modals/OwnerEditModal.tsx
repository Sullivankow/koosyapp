import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Dimensions, Alert } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { updateProprietaire } from '../../utils/proprietaireApi';
import type { Proprietaire } from '../../models/models';

const SCREEN_WIDTH = Dimensions.get('window').width;

type OwnerEditModalProps = {
  visible: boolean;
  owner: Proprietaire | null;
  onClose: () => void;
  onSuccess?: (owner: Proprietaire) => void;
};

export default function OwnerEditModal({ visible, owner, onClose, onSuccess }: OwnerEditModalProps) {
  const { colors } = useTheme();
  const [form, setForm] = useState({ nom: '', prenom: '', email: '', adresse: '', telephone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!owner) return;
    setForm({
      nom: owner.nom ?? '',
      prenom: owner.prenom ?? '',
      email: owner.email ?? '',
      adresse: owner.adresse ?? '',
      telephone: owner.telephone ?? '',
    });
    setError(null);
  }, [owner, visible]);

  const validate = () => {
    if (!form.nom || !form.prenom || !form.email) return 'Nom, prénom et email obligatoires';
    return null;
  };

  const handleSubmit = async () => {
    if (!owner) return;
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setLoading(true);
    try {
      const updated = await updateProprietaire(owner.id, form);
      onClose();
      onSuccess?.(updated);
      Alert.alert('Succès', 'Propriétaire mis à jour');
    } catch (e) {
      console.error('Erreur update propriétaire', e);
      setError('Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView behavior="padding" style={[styles.centered, { backgroundColor: colors.shadow }]}>
        <View style={[styles.modal, { backgroundColor: colors.surface, width: SCREEN_WIDTH > 500 ? 420 : '92%' }]}> 
          <Text style={[styles.title, { color: colors.primary }]}>Modifier propriétaire</Text>
          <TextInput style={[styles.input, { color: colors.text, borderColor: colors.border }]} placeholder="Nom*" placeholderTextColor={colors.text + '99'} value={form.nom} onChangeText={(v) => setForm(s => ({ ...s, nom: v }))} />
          <TextInput style={[styles.input, { color: colors.text, borderColor: colors.border }]} placeholder="Prénom*" placeholderTextColor={colors.text + '99'} value={form.prenom} onChangeText={(v) => setForm(s => ({ ...s, prenom: v }))} />
          <TextInput style={[styles.input, { color: colors.text, borderColor: colors.border }]} placeholder="Email*" placeholderTextColor={colors.text + '99'} value={form.email} onChangeText={(v) => setForm(s => ({ ...s, email: v }))} keyboardType="email-address" autoCapitalize="none" />
          <TextInput style={[styles.input, { color: colors.text, borderColor: colors.border }]} placeholder="Adresse" placeholderTextColor={colors.text + '99'} value={form.adresse} onChangeText={(v) => setForm(s => ({ ...s, adresse: v }))} />
          <TextInput style={[styles.input, { color: colors.text, borderColor: colors.border }]} placeholder="Téléphone" placeholderTextColor={colors.text + '99'} value={form.telephone} onChangeText={(v) => setForm(s => ({ ...s, telephone: v }))} keyboardType="phone-pad" />
          {error ? <Text style={{ color: colors.error, marginBottom: 10 }}>{error}</Text> : null}
          <View style={styles.rowBtns}>
            <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={handleSubmit} disabled={loading}>
              <Text style={{ color: colors.surface, fontWeight: '700' }}>{loading ? 'Enregistrement...' : 'Enregistrer'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, { backgroundColor: colors.border }]} onPress={onClose} disabled={loading}>
              <Text style={{ color: colors.text }}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent'
  },
  modal: {
    borderRadius: 14,
    padding: 20,
    elevation: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 12,
    textAlign: 'center'
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  rowBtns: {
    flexDirection: 'row',
    marginTop: 8,
  },
  btn: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    marginHorizontal: 6,
  }
});
