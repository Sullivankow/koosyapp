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

const UpcomingEvents: React.FC<UpcomingEventsProps> = ({ events, loading, colors, styles }) => (
  <View style={[styles.eventBox, { backgroundColor: colors.primary, alignItems: 'flex-start' }]}> 
    <View style={{ marginRight: 8, paddingTop: 2 }}>
      <MaterialCommunityIcons name="calendar" size={20} color={colors.text} />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={[styles.eventText, { color: colors.text }]} numberOfLines={1} ellipsizeMode="tail">Prochains événements :</Text>
      <View style={{ marginTop: 6 }}>
        {loading ? (
          <Text style={{ color: colors.text }}>Chargement...</Text>
        ) : events && events.length > 0 ? (
          <View>
            <ScrollView style={{ maxHeight: 220 }} nestedScrollEnabled={true}>
              {events.map((ev: any, idx: number) => {
                const humanType = (() => {
                  const t = (ev.type || '').toLowerCase();
                  if (t.includes('new') || t.includes('nouveau') || t.includes('reservation')) return 'Nouvelle réservation';
                  if (t.includes('arrival') || t.includes('arrive') || t.includes('arrivée')) return 'Arrivée';
                  if (t.includes('departure') || t.includes('depart') || t.includes('départ')) return 'Départ';
                  return ev.type || 'Événement';
                })();

                const dateStr = (() => {
                  if (ev.dateDebut) return dayjs(ev.dateDebut).format('DD/MM/YYYY');
                  if (ev.dateFin) return dayjs(ev.dateFin).format('DD/MM/YYYY');
                  if (ev.createdAt) return dayjs(ev.createdAt).format('DD/MM/YYYY');
                  if (ev.date) return dayjs(ev.date).format('DD/MM/YYYY');
                  return '';
                })();

                const locataireName = ev.locataire ? `${ev.locataire.prenom ?? ''} ${ev.locataire.nom ?? ''}`.trim() : (ev.locataireNom ? `${ev.locatairePrenom ?? ''} ${ev.locataireNom ?? ''}`.trim() : 'Locataire inconnu');

                return (
                  <View key={`ev-${idx}`} style={styles.eventRow}>
                    <Text style={[styles.eventRowTitle, { color: colors.text }]} numberOfLines={1} ellipsizeMode="tail">{humanType} · {ev.bien?.nom ?? ev.bienNom ?? 'Bien inconnu'}</Text>
                    <Text style={[styles.eventRowSubtitle, { color: colors.textSecondary }]} numberOfLines={1} ellipsizeMode="tail">{locataireName}{dateStr ? ` — ${dateStr}` : ''}</Text>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        ) : (
          <Text style={{ color: colors.text }}>Aucun événement prévu</Text>
        )}
      </View>
    </View>
  </View>
);

export default UpcomingEvents;
