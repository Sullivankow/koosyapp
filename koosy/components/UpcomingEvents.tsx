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

  if (normalized.includes('new') || normalized.includes('nouveau') || normalized.includes('reservation')) {
    return {
      label: 'Nouvelle reservation',
      icon: 'calendar-plus' as const,
      accent: colors.info || '#1976D2',
    };
  }

  if (normalized.includes('arrival') || normalized.includes('arrive') || normalized.includes('arrivee')) {
    return {
      label: 'Arrivee',
      icon: 'login' as const,
      accent: colors.success || '#2E7D32',
    };
  }

  if (normalized.includes('departure') || normalized.includes('depart')) {
    return {
      label: 'Depart',
      icon: 'logout' as const,
      accent: colors.warning || '#ED6C02',
    };
  }

  return {
    label: 'Evenement',
    icon: 'calendar' as const,
    accent: colors.primary,
  };
};


// Formate la date et l'heure pour affichage
const formatEventDate = (event: any) => {
  // Si le backend fournit déjà une date + heure sous forme de string (ex: '2026-04-18 14:00')
  if (event.date && typeof event.date === 'string') {
    const [datePart, heurePart] = event.date.split(' ');
    const parsed = dayjs(datePart);
    if (!parsed.isValid()) return String(event.date);
    let res = parsed.format('dddd DD MMMM YYYY');
    if (heurePart) res += ` à ${heurePart}`;
    else if (event.heure) res += ` à ${event.heure}`;
    return res;
  }
  // Fallback : ancienne logique
  const raw = event.dateDebut || event.dateFin || event.createdAt || event.date;
  if (!raw) return 'Date non renseignée';
  const parsed = dayjs(raw);
  if (!parsed.isValid()) return String(raw);
  return parsed.format('dddd DD MMMM YYYY');
};

const UpcomingEvents: React.FC<UpcomingEventsProps> = ({ events, loading, colors, styles }) => (
  <View style={[styles.eventBox, { backgroundColor: colors.background, alignItems: 'flex-start', borderWidth: 1.5, borderColor: colors.primary }]}> 
    <View style={{ marginRight: 8, paddingTop: 2 }}>
      <MaterialCommunityIcons name="calendar" size={20} color={colors.primary} />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={[styles.eventText, { color: colors.primary }]} numberOfLines={1} ellipsizeMode="tail">Prochains événements :</Text>
      <View style={{ marginTop: 6 }}>
        {loading ? (
          <Text style={{ color: colors.primary }}>Chargement...</Text>
        ) : events && events.length > 0 ? (
          <View>
            <ScrollView style={{ maxHeight: 220 }} nestedScrollEnabled={true}>
              {events.filter(ev => ev.type === 'arrival' || ev.type === 'departure').map((ev: any, idx: number) => {
                const meta = getEventTypeMeta(ev.type, colors);
                const dateStr = formatEventDate(ev);
                // Affichage explicite de l'heure si présente
                let heureLabel = '';
                if (ev.heure && String(ev.heure).trim()) {
                  if (ev.type === 'arrival') heureLabel = `Heure d'arrivée : ${ev.heure}`;
                  else if (ev.type === 'departure') heureLabel = `Heure de départ : ${ev.heure}`;
                }
                const locataireName = ev.locataire
                  ? `${ev.locataire.prenom ?? ''} ${ev.locataire.nom ?? ''}`.trim()
                  : (ev.locataireNom ? `${ev.locatairePrenom ?? ''} ${ev.locataireNom ?? ''}`.trim() : 'Locataire inconnu');
                const bienName = ev.bien?.nom ?? ev.bienNom ?? 'Bien inconnu';

                return (
                  <View
                    key={`ev-${idx}`}
                    style={[
                      styles.eventRow,
                      {
                        borderBottomWidth: 0,
                        backgroundColor: colors.surface,
                        borderRadius: 10,
                        paddingHorizontal: 10,
                        paddingVertical: 10,
                        marginBottom: 8,
                      },
                    ]}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          backgroundColor: `${meta.accent}22`,
                          borderRadius: 999,
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                        }}
                      >
                        <MaterialCommunityIcons name={meta.icon} size={14} color={meta.accent} />
                        <Text style={{ color: meta.accent, fontWeight: '700', marginLeft: 5, fontSize: 12 }}>{meta.label}</Text>
                      </View>
                    </View>

                    <Text style={[styles.eventRowTitle, { color: colors.text, fontSize: 14 }]} numberOfLines={1} ellipsizeMode="tail">
                      Bien: {bienName}
                    </Text>
                    <Text style={[styles.eventRowSubtitle, { color: colors.textSecondary, fontSize: 12 }]} numberOfLines={1} ellipsizeMode="tail">
                      Locataire: {locataireName}
                    </Text>
                    <Text
                      style={[styles.eventRowSubtitle, { color: colors.primary, fontWeight: 'bold', fontSize: 15, marginTop: 2, marginBottom: 2, flexDirection: 'row', alignItems: 'center' }]} 
                      numberOfLines={2}
                      ellipsizeMode="tail"
                    >
                      <MaterialCommunityIcons name="calendar" size={15} color={colors.primary} />
                      <Text style={{ marginLeft: 6, color: colors.primary, fontWeight: 'bold', fontSize: 15 }}>
                        {ev.type === 'arrival' ? 'Arrivée le ' : ev.type === 'departure' ? 'Départ le ' : 'Date : '}{dateStr}
                        {heureLabel ? `
${heureLabel}` : ''}
                      </Text>
                    </Text>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        ) : (
          <Text style={{ color: colors.primary }}>Aucun événement prévu</Text>
        )}
      </View>
    </View>
  </View>
);

export default UpcomingEvents;
