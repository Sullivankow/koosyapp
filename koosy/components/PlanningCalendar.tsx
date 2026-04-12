import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { Prestation } from '../models/models';

type PlanningCalendarProps = {
  prestations: Prestation[];
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  viewMode: 'list' | 'week' | 'month';
};

type GroupedDay = {
  dateKey: string;
  label: string;
  items: Prestation[];
};

// Convertit le montant stocké en centimes (backend) en affichage lisible côté UI.
const formatAmount = (amountCents: number) => `${(amountCents / 100).toFixed(2)} EUR`;

// Formate la date pour obtenir un en-tête de section en français.
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

const getDateKey = (item: Prestation) => (item.date_prestation || item.created_at || '').slice(0, 10);

const startOfWeekMonday = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

const addDays = (date: Date, days: number) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

const shortDayLabel = (date: Date) =>
  date.toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: '2-digit' });

const monthLabel = (date: Date) =>
  date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

const startOfMonth = (date: Date) => {
  const d = new Date(date.getFullYear(), date.getMonth(), 1);
  d.setHours(0, 0, 0, 0);
  return d;
};

const endOfMonth = (date: Date) => {
  const d = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  d.setHours(23, 59, 59, 999);
  return d;
};

const startOfGrid = (monthStart: Date) => {
  const d = new Date(monthStart);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

const endOfGrid = (monthEnd: Date) => {
  const d = new Date(monthEnd);
  const day = d.getDay();
  const diff = day === 0 ? 0 : 7 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(23, 59, 59, 999);
  return d;
};

// Déplace le curseur du calendrier d'un mois (ex: -1 = mois précédent, +1 = mois suivant).
const changeMonth = (date: Date, diff: number) => {
  const d = new Date(date.getFullYear(), date.getMonth() + diff, 1);
  d.setHours(0, 0, 0, 0);
  return d;
};

const PlanningCalendar: React.FC<PlanningCalendarProps> = ({ prestations, loading, refreshing, onRefresh, viewMode }) => {
  const { colors } = useTheme();
  // Curseur du mois affiché en vue grille (permet navigation mois précédent/suivant).
  const [monthCursor, setMonthCursor] = useState<Date>(() => startOfMonth(new Date()));

  const grouped = useMemo<GroupedDay[]>(() => {
    // 1) Tri chronologique pour avoir un planning du plus proche au plus lointain.
    const sorted = [...prestations].sort((a, b) => {
      const da = new Date(a.date_prestation || a.created_at).getTime();
      const db = new Date(b.date_prestation || b.created_at).getTime();
      return da - db;
    });

    // 2) Regroupement par jour pour afficher une section par date.
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

  const weekDays = useMemo(() => {
    const start = startOfWeekMonday(new Date());
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, []);

  const weekMap = useMemo(() => {
    const map = new Map<string, Prestation[]>();
    for (const day of weekDays) {
      map.set(day.toISOString().slice(0, 10), []);
    }

    for (const item of prestations) {
      const key = getDateKey(item);
      if (!map.has(key)) continue;
      map.get(key)?.push(item);
    }

    for (const [key, items] of map.entries()) {
      items.sort((a, b) => {
        const da = new Date(a.date_prestation || a.created_at).getTime();
        const db = new Date(b.date_prestation || b.created_at).getTime();
        return da - db;
      });
      map.set(key, items);
    }

    return map;
  }, [prestations, weekDays]);

  const today = useMemo(() => new Date(), []);
  const todayKey = useMemo(() => today.toISOString().slice(0, 10), [today]);

  const monthStart = useMemo(() => startOfMonth(monthCursor), [monthCursor]);
  const monthEnd = useMemo(() => endOfMonth(monthCursor), [monthCursor]);
  const gridStart = useMemo(() => startOfGrid(monthStart), [monthStart]);
  const gridEnd = useMemo(() => endOfGrid(monthEnd), [monthEnd]);

  const monthDays = useMemo(() => {
    const days: Date[] = [];
    const cursor = new Date(gridStart);
    while (cursor <= gridEnd) {
      days.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
    return days;
  }, [gridStart, gridEnd]);

  const monthMap = useMemo(() => {
    const map = new Map<string, Prestation[]>();
    for (const day of monthDays) {
      map.set(day.toISOString().slice(0, 10), []);
    }

    for (const item of prestations) {
      const key = getDateKey(item);
      if (!map.has(key)) continue;
      map.get(key)?.push(item);
    }

    return map;
  }, [prestations, monthDays]);

  // Affiche le détail d'une prestation sélectionnée depuis la grille mensuelle.
  const showPrestationDetails = (item: Prestation, dateKey: string) => {
    const dateLabel = formatDateLabel(dateKey);
    const bien = item.bien?.nom || 'Bien non renseigne';
    const description = item.description || 'Sans description';
    const statut = statusLabel(item.status);
    const montant = formatAmount(item.amount_cents);
    Alert.alert(
      'Detail prestation',
      `Date: ${dateLabel}\nBien: ${bien}\nStatut: ${statut}\nMontant: ${montant}\nDescription: ${description}`,
      [{ text: 'Fermer' }],
    );
  };

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
      // Pull-to-refresh: recharge les prestations depuis l'API sans quitter l'écran.
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      {viewMode === 'list' && grouped.length === 0 ? (
        <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
          <MaterialCommunityIcons name="calendar-blank" size={28} color={colors.primary} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Aucune prestation planifiee</Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Ajoute une prestation pour la voir dans le planning.</Text>
        </View>
      ) : viewMode === 'list' ? (
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
      ) : viewMode === 'week' ? (
        <View style={styles.weekWrap}>
          {weekDays.map((day) => {
            const key = day.toISOString().slice(0, 10);
            const items = weekMap.get(key) || [];
            return (
              <View key={key} style={[styles.weekDayCard, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
                <Text style={[styles.weekDayTitle, { color: colors.primary }]}>{shortDayLabel(day)}</Text>
                {items.length === 0 ? (
                  <Text style={[styles.weekEmptyText, { color: colors.textSecondary }]}>Aucune prestation</Text>
                ) : (
                  items.map((item) => (
                    <View key={item.id} style={[styles.weekItem, { borderColor: colors.border, backgroundColor: colors.background }]}> 
                      <View style={styles.weekItemHead}>
                        <Text style={[styles.weekItemTitle, { color: colors.text }]} numberOfLines={1}>
                          {item.bien?.nom || 'Bien non renseigne'}
                        </Text>
                        <View style={[styles.weekStatusPill, { backgroundColor: statusBg(item.status, colors.primary) }]}>
                          <Text style={styles.weekStatusText}>{statusLabel(item.status)}</Text>
                        </View>
                      </View>
                      <Text style={[styles.weekItemDescription, { color: colors.textSecondary }]} numberOfLines={2}>
                        {item.description || 'Sans description'}
                      </Text>
                      <View style={styles.weekMetaRow}>
                        <MaterialCommunityIcons name="currency-eur" size={14} color={colors.textSecondary} />
                        <Text style={[styles.weekItemMeta, { color: colors.textSecondary }]} numberOfLines={1}>
                          {formatAmount(item.amount_cents)}
                        </Text>
                      </View>
                    </View>
                  ))
                )}
              </View>
            );
          })}
        </View>
      ) : (
        <View>
          {/* En-tête du mois avec navigation précédent/suivant. */}
          <View style={styles.monthHeaderRow}>
            <TouchableOpacity
              style={[styles.monthNavBtn, { borderColor: colors.primary, backgroundColor: colors.surface }]}
              onPress={() => setMonthCursor((prev) => changeMonth(prev, -1))}
            >
              <MaterialCommunityIcons name="chevron-left" size={18} color={colors.primary} />
            </TouchableOpacity>

            <Text style={[styles.monthTitle, { color: colors.primary }]}>{monthLabel(monthCursor)}</Text>

            <TouchableOpacity
              style={[styles.monthNavBtn, { borderColor: colors.primary, backgroundColor: colors.surface }]}
              onPress={() => setMonthCursor((prev) => changeMonth(prev, 1))}
            >
              <MaterialCommunityIcons name="chevron-right" size={18} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Raccourci pratique pour revenir au mois actuel en un clic. */}
          <TouchableOpacity
            style={[styles.monthTodayBtn, { borderColor: colors.border, backgroundColor: colors.surface }]}
            onPress={() => setMonthCursor(startOfMonth(new Date()))}
          >
            <Text style={[styles.monthTodayText, { color: colors.textSecondary }]}>Revenir au mois courant</Text>
          </TouchableOpacity>

          <View style={[styles.monthWeekHeader, { borderColor: colors.border }]}> 
            {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, idx) => (
              <View key={`${d}-${idx}`} style={styles.monthHeaderCell}>
                <Text style={[styles.monthHeaderText, { color: colors.textSecondary }]}>{d}</Text>
              </View>
            ))}
          </View>

          <View style={styles.monthGrid}>
            {monthDays.map((day) => {
              const key = day.toISOString().slice(0, 10);
              const items = monthMap.get(key) || [];
              const inCurrentMonth = day.getMonth() === monthCursor.getMonth() && day.getFullYear() === monthCursor.getFullYear();
              const isToday = key === todayKey;

              return (
                <View
                  key={key}
                  style={[
                    styles.monthCell,
                    { borderColor: colors.border, backgroundColor: colors.surface },
                    !inCurrentMonth && { opacity: 0.45 },
                  ]}
                >
                  <View style={styles.monthCellTop}>
                    <Text
                      style={[
                        styles.monthDayNumber,
                        { color: colors.text },
                        isToday && { color: colors.primary, fontWeight: '800' },
                      ]}
                    >
                      {day.getDate()}
                    </Text>
                    {items.length > 0 ? (
                      <View style={[styles.monthCountBadge, { backgroundColor: colors.primary }]}> 
                        <Text style={styles.monthCountText}>{items.length}</Text>
                      </View>
                    ) : null}
                  </View>

                  {/* On limite volontairement à 2 lignes par case pour garder une grille lisible. */}
                  {items.slice(0, 2).map((item) => (
                    <TouchableOpacity
                      key={`m-${key}-${item.id}`}
                      style={[styles.monthDotRow, { backgroundColor: colors.background }]}
                      // Ouvre les infos de la prestation touchée directement depuis la case du jour.
                      onPress={() => showPrestationDetails(item, key)}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.monthDot, { backgroundColor: statusBg(item.status, colors.primary) }]} />
                      <Text style={[styles.monthDotLabel, { color: colors.textSecondary }]} numberOfLines={1}>
                        {item.bien?.nom || 'Bien'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                  {items.length > 2 ? (
                    <Text style={[styles.monthMoreText, { color: colors.textSecondary }]}>+{items.length - 2} autres</Text>
                  ) : null}
                </View>
              );
            })}
          </View>
        </View>
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
  weekWrap: {
    gap: 12,
  },
  weekDayCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
  },
  weekDayTitle: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'capitalize',
    marginBottom: 10,
  },
  weekEmptyText: {
    fontSize: 12,
    paddingVertical: 2,
  },
  weekItem: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 9,
    marginBottom: 8,
  },
  weekItemHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  weekItemTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
  },
  weekStatusPill: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    maxWidth: 110,
  },
  weekStatusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  weekItemDescription: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 17,
  },
  weekMetaRow: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  weekItemMeta: {
    fontSize: 12,
    fontWeight: '600',
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 0,
    textTransform: 'capitalize',
    textAlign: 'center',
  },
  monthHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  monthNavBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthTodayBtn: {
    alignSelf: 'center',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 10,
  },
  monthTodayText: {
    fontSize: 12,
    fontWeight: '600',
  },
  monthWeekHeader: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 8,
  },
  monthHeaderCell: {
    width: '14.2857%',
    alignItems: 'center',
    paddingVertical: 6,
  },
  monthHeaderText: {
    fontSize: 11,
    fontWeight: '700',
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  monthCell: {
    width: '14.2857%',
    minHeight: 92,
    borderWidth: 1,
    paddingHorizontal: 4,
    paddingTop: 4,
    paddingBottom: 3,
  },
  monthCellTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  monthDayNumber: {
    fontSize: 11,
    fontWeight: '700',
  },
  monthCountBadge: {
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  monthCountText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  monthDotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 2,
    marginBottom: 3,
  },
  monthDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  monthDotLabel: {
    flex: 1,
    fontSize: 9,
    fontWeight: '600',
  },
  monthMoreText: {
    fontSize: 9,
    fontWeight: '600',
    marginTop: 1,
    marginLeft: 2,
  },
});

export default PlanningCalendar;