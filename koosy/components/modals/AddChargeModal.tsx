import React, { useCallback, useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';
import { useTheme } from '../../contexts/ThemeContext';
import { createCharge } from '../../utils/api';
import SubscriptionPaywallModal from './SubscriptionPaywallModal';
import { useSubscription } from '../../hooks/useSubscription';


dayjs.locale('fr');

type ChargeForm = {
  libelle: string;
  amount: string;
  date_charge: string;
  categorie: string;
  notes: string;
};

interface AddChargeModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const getContrastTextColor = (hexColor: string) => {
  const sanitized = (hexColor || '').replace('#', '');
  if (sanitized.length !== 6) return '#FFFFFF';
  const r = parseInt(sanitized.slice(0, 2), 16);
  const g = parseInt(sanitized.slice(2, 4), 16);
  const b = parseInt(sanitized.slice(4, 6), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 170 ? '#1E242B' : '#FFFFFF';
};

const toBackendDate = (value: string) => {
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
    const [day, month, year] = value.split('/');
    return `${year}-${month}-${day}`;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }
  return dayjs(value).format('YYYY-MM-DD');
};

const formatFrenchDate = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return '';

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) {
    return trimmed;
  }

  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    return `${day}/${month}/${year}`;
  }

  const parsed = dayjs(trimmed, ['DD/MM/YYYY', 'YYYY-MM-DD'], true);
  if (parsed.isValid()) {
    return parsed.format('DD/MM/YYYY');
  }

  return trimmed;
};

const formatDateInput = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
};

const AddChargeModal: React.FC<AddChargeModalProps> = ({ visible, onClose, onSuccess }) => {
  const { colors, isDarkMode } = useTheme();
  const { hasPremiumOrBetaAccess } = useSubscription('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [paywallVisible, setPaywallVisible] = useState(false);
  const [form, setForm] = useState<ChargeForm>({
    libelle: '',
    amount: '',
    date_charge: dayjs().format('DD/MM/YYYY'),
    categorie: '',
    notes: '',
  });

  const updateField = useCallback((key: keyof ChargeForm, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  }, []);

  const openPaywall = useCallback(() => {
    // On ferme d'abord la modale de charge pour éviter les conflits d'affichage entre 2 Modals RN.
    onClose();
    setTimeout(() => {
      setPaywallVisible(true);
    }, 120);
  }, [onClose]);

  const handleSubmit = async () => {
    const amountValue = Number(form.amount.replace(',', '.'));

    if (!form.libelle.trim()) {
      setSuccessMsg('Le libellé est obligatoire.');
      return;
    }
    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      setSuccessMsg('Le montant doit être supérieur à 0.');
      return;
    }

    setLoading(true);
    setSuccessMsg('');
    try {
      // Pré-check côté front: abonnement actif OU accès bêta valide autorise l'ajout.
      const canAccessPremiumFeatures = await hasPremiumOrBetaAccess();
      if (!canAccessPremiumFeatures) {
        openPaywall();
        setLoading(false);
        return;
      }

      await createCharge({
        libelle: form.libelle.trim(),
        amount: amountValue,
        date_charge: toBackendDate(form.date_charge),
        categorie: form.categorie.trim() || undefined,
        notes: form.notes.trim() || undefined,
      });
      setSuccessMsg('Charge ajoutée avec succès !');
      setTimeout(() => {
        setLoading(false);
        setSuccessMsg('');
        setForm({
          libelle: '',
          amount: '',
          date_charge: dayjs().format('DD/MM/YYYY'),
          categorie: '',
          notes: '',
        });
        onClose();
        if (onSuccess) onSuccess();
      }, 900);
    } catch (error: any) {
      const statusCode = Number(error?.status);
      if (statusCode === 403) {
        openPaywall();
        setSuccessMsg('');
        setLoading(false);
        return;
      }
      setSuccessMsg("Erreur lors de l'ajout de la charge");
      setLoading(false);
    }
  };

  return (
    <>
      <Modal visible={visible} transparent animationType="slide">
        <View style={styles.overlay}>
          <KeyboardAvoidingView
            style={{ flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center' }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <View style={[styles.card, { backgroundColor: colors.surface }]}>
              <Text style={[styles.title, { color: colors.primary }]}>Ajouter une charge</Text>
              <Text style={{ color: colors.textSecondary, marginBottom: 12, fontSize: 13 }}>Renseigne tes frais puis valide.</Text>
              
              <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                <TextInput
                  style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
                  placeholder="Libellé"
                  placeholderTextColor={colors.textSecondary}
                  value={form.libelle}
                  onChangeText={(value) => updateField('libelle', value)}
                />
                <TextInput
                  style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
                  placeholder="Montant (€)"
                  placeholderTextColor={colors.textSecondary}
                  value={form.amount}
                  onChangeText={(value) => updateField('amount', value)}
                  keyboardType="decimal-pad"
                />
                <TextInput
                  style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
                  placeholder="Catégorie"
                  placeholderTextColor={colors.textSecondary}
                  value={form.categorie}
                  onChangeText={(value) => updateField('categorie', value)}
                />
                <TextInput
                  style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background, minHeight: 90, textAlignVertical: 'top' }]}
                  placeholder="Notes"
                  placeholderTextColor={colors.textSecondary}
                  value={form.notes}
                  onChangeText={(value) => updateField('notes', value)}
                  multiline
                />

                <Text style={{ color: colors.textSecondary, marginTop: 8, marginBottom: 4, fontSize: 13 }}>Date :</Text>
                <TextInput
                  style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
                  placeholder="Date (JJ/MM/AAAA)"
                  placeholderTextColor={colors.textSecondary}
                  value={form.date_charge}
                  maxLength={10}
                  onFocus={() => updateField('date_charge', formatDateInput(form.date_charge))}
                  onChangeText={(value) => updateField('date_charge', formatDateInput(value))}
                  onBlur={() => updateField('date_charge', formatFrenchDate(form.date_charge))}
                  keyboardType="number-pad"
                />
              </ScrollView>

              {successMsg ? <Text style={{ color: colors.success || colors.primary, marginBottom: 14, textAlign: 'center', fontWeight: '600' }}>{successMsg}</Text> : null}

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.cancelBtn, { borderColor: colors.border, flex: 1, marginRight: 8 }]}
                  onPress={onClose}
                >
                  <Text style={{ color: colors.primary, fontWeight: '800', fontSize: 15 }}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.submitBtn, { backgroundColor: colors.primary, flex: 1 }]}
                  onPress={handleSubmit}
                  disabled={loading}
                >
                  {loading ? <ActivityIndicator color={getContrastTextColor(colors.primary)} /> : <Text style={[styles.submitText, { color: getContrastTextColor(colors.primary) }]}>Ajouter</Text>}
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

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
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '92%',
    maxHeight: '88%',
    borderRadius: 18,
    padding: 20,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
  },
  scrollContent: {
    paddingBottom: 0,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
    fontSize: 15,
  },
  submitBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitText: {
    fontWeight: '800',
    fontSize: 16,
  },
  cancelBtn: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
});

export default AddChargeModal;
