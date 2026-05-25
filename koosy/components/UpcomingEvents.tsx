import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import dayjs from 'dayjs';

interface UpcomingEventsProps {
  events: any[];
  loading: boolean;
  colors: any;
  styles: any;
}

const getEventTypeMeta = (type: string, colors: any) => {
  const normalized = String(type || '').toLowerCase();

  if (normalized.includes('arrival') || normalized.includes('arrive')) {
    return {
      label: 'Arrivee',
      icon: 'login' as const,
      accent: colors.success || '#2E8B57',
    };
  }

  if (normalized.includes('departure') || normalized.includes('depart')) {
    return {
      label: 'Depart',
      icon: 'logout' as const,
      accent: colors.warning || '#C97B2F',
    };
  }

  return {
    label: 'Reservation',
    icon: 'calendar-plus' as const,
    accent: colors.info || '#1976D2',
  };
};

const formatEventDate = (event: any) => {
  if (event.date && typeof event.date === 'string') {
    const [datePart, heurePart] = event.date.split(' ');
    const parsed = dayjs(datePart);
    if (!parsed.isValid()) return String(event.date);
    return `${parsed.format('DD MMM YYYY')}${heurePart || event.heure ? ` - ${heurePart || event.heure}` : ''}`;
  }

  const raw = event.dateDebut || event.dateFin || event.createdAt || event.date;
  if (!raw) return 'Date non renseignee';
  const parsed = dayjs(raw);
  if (!parsed.isValid()) return String(raw);
  return parsed.format('DD MMM YYYY');
};

const UpcomingEvents: React.FC<UpcomingEventsProps> = ({ events, loading, colors, styles }) => {
  const visibleEvents = (events || []).filter((event) => event.type === 'arrival' || event.type === 'departure').slice(0, 6);

  return (
    <View style={[styles.eventBox, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
      <View style={{ flex: 1 }}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={[styles.eventText, { color: colors.text }]}>A faire maintenant</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: '700', marginTop: 2 }}>
              Arrivees et departs a suivre
            </Text>
          </View>
          <MaterialCommunityIcons name="calendar-clock-outline" size={24} color={colors.primary} />
        </View>

        {loading ? (
          <Text style={{ color: colors.textSecondary, fontWeight: '700' }}>Chargement...</Text>
        ) : visibleEvents.length > 0 ? (
          <ScrollView style={{ maxHeight: 232 }} nestedScrollEnabled showsVerticalScrollIndicator={false}>
            {visibleEvents.map((event: any, index: number) => {
              const meta = getEventTypeMeta(event.type, colors);
              const locataireName = event.locataire
                ? `${event.locataire.prenom ?? ''} ${event.locataire.nom ?? ''}`.trim()
                : (event.locataireNom ? `${event.locatairePrenom ?? ''} ${event.locataireNom ?? ''}`.trim() : 'Locataire inconnu');
              const bienName = event.bien?.nom ?? event.bienNom ?? 'Bien inconnu';

              return (
                <View key={`event-${index}`} style={[styles.eventRow, { backgroundColor: '#F8FBFA', borderRadius: 16, padding: 11, marginBottom: 8 }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: `${meta.accent}18`, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5 }}>
                      <MaterialCommunityIcons name={meta.icon} size={14} color={meta.accent} />
                      <Text style={{ color: meta.accent, fontWeight: '900', marginLeft: 5, fontSize: 12 }}>{meta.label}</Text>
                    </View>
                    <Text style={{ color: colors.textSecondary, fontWeight: '800', fontSize: 12 }}>{formatEventDate(event)}</Text>
                  </View>
                  <Text style={[styles.eventRowTitle, { color: colors.text }]} numberOfLines={1}>{bienName}</Text>
                  <Text style={[styles.eventRowSubtitle, { color: colors.textSecondary }]} numberOfLines={1}>{locataireName}</Text>
                </View>
              );
            })}
          </ScrollView>
        ) : (
          <View style={{ backgroundColor: '#F8FBFA', borderRadius: 16, padding: 14 }}>
            <Text style={{ color: colors.textSecondary, fontWeight: '800' }}>Aucun evenement prevu</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default UpcomingEvents;
