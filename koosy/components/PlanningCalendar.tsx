import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { Prestation } from '../models/models';

type PlanningCalendarProps = {
  prestations: Prestation[];
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
};

type GroupedDay = {
  dateKey: string;
  label: string;
  items: Prestation[];
};

const formatAmount = (amountCents: number) => `${(amountCents / 100).toFixed(2)} EUR`;

const formatDateLabel = (isoDate: string) => {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return 'Date inconnue';
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

const statusLabel = (status: string) => {
  const normalized = (status || '').toLowerCase();
  if (normalized.includes('term')) return 'Terminée';
  if (normalized.includes('confirm')) return 'Confirmée';
  if (normalized.includes('attente')) return 'En attente';
  if (normalized.includes('annul')) return 'Annulée';
  return status || 'Inconnu';
};

const statusBg = (status: string, primary: string) => {
  const normalized = (status || '').toLowerCase();
  if (normalized.includes('term')) return '#2E7D32';
  if (normalized.includes('confirm')) return primary;
  if (normalized.includes('annul')) return '#C62828';
  return '#F9A825';
};

const PlanningCalendar: React.FC<PlanningCalendarProps> = ({ prestations, loading, refreshing, onRefresh }) => {
  const { colors } = useTheme();

  const grouped = useMemo<GroupedDay[]>(() => {
    const sorted = [...prestations].sort((a, b) => {
      const da = new Date(a.date_prestation || a.created_at).getTime();
      const db = new Date(b.date_prestation || b.created_at).getTime();
      return da - db;
    });

    const map = new Map<string, Prestation[]>();
    for (const item of sorted) {
      const key = (item.date_prestation || item.created_at || '').slice(0, 10);
      if (!map.has(key)) map.set(key, []);
      map.get(key)?.push(item);
    }

    return Array.from(map.entries()).map(([dateKey, items]) => ({
      dateKey,
      label: formatDateLabel(dateKey),
      items,
    }));
  }, [prestations]);

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Chargement du planning...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      {grouped.length === 0 ? (
        <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
          <MaterialCommunityIcons name="calendar-blank" size={28} color={colors.primary} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Aucune prestation planifiee</Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Ajoute une prestation pour la voir dans le planning.</Text>
        </View>
      ) : (
        grouped.map((day) => (
          <View key={day.dateKey} style={styles.dayBlock}>
            <Text style={[styles.dayTitle, { color: colors.primary }]}>{day.label}</Text>
            {day.items.map((item) => (
              <View key={item.id} style={[styles.itemCard, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
                <View style={styles.itemHead}>
                  <Text style={[styles.itemTitle, { color: colors.text }]} numberOfLines={1}>
                    {item.bien?.nom || 'Bien non renseigne'}
                  </Text>
                  <View style={[styles.statusPill, { backgroundColor: statusBg(item.status, colors.primary) }]}>
                    <Text style={styles.statusText}>{statusLabel(item.status)}</Text>
                  </View>
                </View>
                <Text style={[styles.itemDesc, { color: colors.textSecondary }]} numberOfLines={2}>
                  {item.description || 'Sans description'}
                </Text>
                <View style={styles.metaRow}>
                  <MaterialCommunityIcons name="currency-eur" size={16} color={colors.textSecondary} />
                  <Text style={[styles.metaText, { color: colors.textSecondary }]}>{formatAmount(item.amount_cents)}</Text>
                </View>
              </View>
            ))}
          </View>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: 16,
    paddingBottom: 28,
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
  },
  emptyCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 20,
    alignItems: 'center',
    gap: 6,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
  },
  dayBlock: {
    marginBottom: 16,
  },
  dayTitle: {
    fontSize: 16,
    fontWeight: '700',
    textTransform: 'capitalize',
    marginBottom: 8,
  },
  itemCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  itemHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  itemTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 11,
  },
  itemDesc: {
    marginTop: 6,
    fontSize: 13,
  },
  metaRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    fontWeight: '600',
  },
});

export default PlanningCalendar;