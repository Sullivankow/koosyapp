import React, { useEffect, useMemo, useState } from 'react';
import { Alert, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { Charge } from '../../models/models';
import { deleteCharge, getCharges, getChargesSummary } from '../../utils/api';
import { createChargesScreenStyles } from './styles/ChargesScreen.styles';
import AddChargeModal from '../../components/modals/AddChargeModal';
import ChargesList from '../../components/ChargesList';
import { useChiffreAffaireRefresh } from '../../contexts/ChiffreAffaireRefreshContext';

const PERIODS = [
  { key: 'month', label: 'Ce mois' },
  { key: 'previous', label: 'Mois précédent' },
  { key: 'all', label: 'Tout' },
] as const;

type PeriodKey = (typeof PERIODS)[number]['key'];

type SummaryState = {
  currentMonth: number;
  previousMonth: number;
  global: number;
};

const getLocalDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getMonthRange = (offset = 0) => {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + offset + 1, 0);
  return {
    from: getLocalDateKey(firstDay),
    to: getLocalDateKey(lastDay),
  };
};

const getAllTimeRange = () => ({
  from: '2000-01-01',
  to: '2099-12-31',
});

const formatMoney = (amount: number) =>
  new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

const getContrastTextColor = (hexColor: string) => {
  const sanitized = hexColor.replace('#', '');
  if (!/^[0-9a-fA-F]{6}$/.test(sanitized)) return '#fff';
  const r = parseInt(sanitized.slice(0, 2), 16);
  const g = parseInt(sanitized.slice(2, 4), 16);
  const b = parseInt(sanitized.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? '#111' : '#fff';
};

const ChargesScreen: React.FC = () => {
  const { colors } = useTheme();
  const styles = useMemo(() => createChargesScreenStyles(colors), [colors]);
  const { signalRefresh } = useChiffreAffaireRefresh();
  const [period, setPeriod] = useState<PeriodKey>('month');
  const [charges, setCharges] = useState<Charge[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [summary, setSummary] = useState<SummaryState>({ currentMonth: 0, previousMonth: 0, global: 0 });
  const [addChargeModalVisible, setAddChargeModalVisible] = useState(false);

  const selectedRange = useMemo(() => {
    // Cette plage sert à filtrer la liste, sans toucher au résumé global.
    if (period === 'previous') return getMonthRange(-1);
    if (period === 'all') return getAllTimeRange();
    return getMonthRange(0);
  }, [period]);

  const loadSummaries = async () => {
    // On récupère les trois périodes utiles pour afficher le résumé d'un coup.
    const currentRange = getMonthRange(0);
    const previousRange = getMonthRange(-1);
    const globalRange = getAllTimeRange();

    const [current, previous, global] = await Promise.all([
      getChargesSummary(currentRange.from, currentRange.to),
      getChargesSummary(previousRange.from, previousRange.to),
      getChargesSummary(globalRange.from, globalRange.to),
    ]);

    setSummary({
      currentMonth: current.global.total_euros ?? 0,
      previousMonth: previous.global.total_euros ?? 0,
      global: global.global.total_euros ?? 0,
    });
  };

  const loadCharges = async () => {
    const response = await getCharges({
      page: 1,
      limit: 100,
      from: selectedRange.from,
      to: selectedRange.to,
    });
    setCharges(response.items ?? []);
  };

  const refreshData = async () => {
    setRefreshing(true);
    try {
      await Promise.all([loadSummaries(), loadCharges()]);
    } catch (error) {
      setCharges([]);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const bootstrap = async () => {
      setLoading(true);
      try {
        await Promise.all([loadSummaries(), loadCharges()]);
      } catch (error) {
        setCharges([]);
      } finally {
        setLoading(false);
      }
    };
    void bootstrap();
  }, [period]);

  const handleDelete = (charge: Charge) => {
    // Confirmation explicite avant suppression pour éviter les erreurs de manipulation.
    Alert.alert(
      'Supprimer la charge',
      `Supprimer « ${charge.libelle} » ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCharge(charge.id);
              await Promise.all([loadSummaries(), loadCharges()]);
              signalRefresh();
            } catch (error: any) {
              Alert.alert('Erreur', error?.message || 'Impossible de supprimer la charge.');
            }
          },
        },
      ]
    );
  };

  const summaryTextColor = getContrastTextColor(colors.primary);

  return (
    <View style={styles.container}>
      {/* Header sticky avec bouton + */}
      <View style={[styles.headerSticky, { backgroundColor: colors.surface }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Charges</Text>
        <TouchableOpacity style={[styles.addBtn, { backgroundColor: colors.primary }]} onPress={() => setAddChargeModalVisible(true)}>
          <MaterialCommunityIcons name="plus" size={22} color={colors.surface} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void refreshData()} tintColor={colors.primary} />}
      >
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Résumé</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryBox}>
              <Text style={[styles.summaryLabel, { color: summaryTextColor }]}>Ce mois</Text>
              <Text style={[styles.summaryValue, { color: summaryTextColor }]}>{formatMoney(summary.currentMonth)}</Text>
            </View>
            <View style={styles.summaryBox}>
              <Text style={[styles.summaryLabel, { color: summaryTextColor }]}>Mois précédent</Text>
              <Text style={[styles.summaryValue, { color: summaryTextColor }]}>{formatMoney(summary.previousMonth)}</Text>
            </View>
            <View style={styles.summaryBox}>
              <Text style={[styles.summaryLabel, { color: summaryTextColor }]}>Global</Text>
              <Text style={[styles.summaryValue, { color: summaryTextColor }]}>{formatMoney(summary.global)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Période affichée</Text>
          <View style={styles.switchRow}>
            {PERIODS.map((item) => {
              const isActive = period === item.key;
              const activeTextColor = getContrastTextColor(colors.primary);
              return (
                <TouchableOpacity
                  key={item.key}
                  onPress={() => setPeriod(item.key)}
                  style={[
                    styles.switchBtn,
                    {
                      backgroundColor: isActive ? colors.primary : colors.background,
                      borderColor: isActive ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.switchText, { color: isActive ? activeTextColor : colors.text }]}>{item.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={styles.periodLabel}>
            {period === 'month'
              ? 'Charges du mois en cours'
              : period === 'previous'
                ? 'Charges du mois précédent'
                : 'Toutes les charges'}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Liste des charges</Text>
          <ChargesList
            charges={charges}
            loading={loading}
            colors={colors}
            styles={styles}
            onDelete={handleDelete}
          />
        </View>

        <AddChargeModal
          visible={addChargeModalVisible}
          onClose={() => setAddChargeModalVisible(false)}
          onSuccess={async () => {
            await Promise.all([loadSummaries(), loadCharges()]);
            signalRefresh();
          }}
        />
      </ScrollView>
    </View>
  );
};

export default ChargesScreen;
