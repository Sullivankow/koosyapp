import React from 'react';
import { View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { Reservation } from '../../../models/models';

/**
 * Composant ReservationList
 * Affiche la liste des réservations d'un bien immobilier.
 * Affiche un message si aucune réservation n'est présente.
 * Props :
 *   - reservations : tableau de réservations
 *   - colors : palette de couleurs pour le thème
 *   - formatDateFR : fonction de formatage de date en français
 *   - styles : styles globaux
 */
interface ReservationListProps {
  reservations?: Reservation[];
  colors: any;
  formatDateFR: (dateStr?: string) => string;
  styles: any;
}

const ReservationList: React.FC<ReservationListProps> = ({ reservations = [], colors, formatDateFR, styles }) => (
  <View style={{ width: '100%', flexDirection: 'column', gap: 8, marginBottom: 8 }}>
    {/* Si des réservations existent, on les affiche */}
    {Array.isArray(reservations) && reservations.length > 0 ? reservations.map((resa) => (
      <View
        key={resa.id}
        style={{
          flexDirection: 'row',
          alignItems: 'flex-start',
          backgroundColor: colors.accent + '22',
          borderColor: colors.accent,
          borderWidth: 1,
          borderRadius: 12,
          padding: 8,
          marginBottom: 2,
          maxWidth: '100%',
        }}
      >
        {/* Icône utilisateur */}
        <MaterialCommunityIcons name="account" size={16} color={colors.accent} style={{ marginRight: 8, marginTop: 2 }} />
        <View style={{ flex: 1 }}>
          {/* Nom et prénom du locataire */}
          <Text style={{ color: colors.accent, fontWeight: 'bold', fontSize: 13 }}>{resa.locataire?.nom || ''} {resa.locataire?.prenom || ''}</Text>
          {/* Email du locataire */}
          {resa.locataire?.email ? (
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{resa.locataire.email}</Text>
          ) : null}
          {/* Téléphone du locataire */}
          {resa.locataire?.telephone ? (
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{resa.locataire.telephone}</Text>
          ) : null}
          {/* Dates de réservation */}
          <Text style={{ color: '#1976D2', fontSize: 12, fontWeight: 'bold', marginTop: 2 }}>{formatDateFR(resa.dateDebut)} → {formatDateFR(resa.dateFin)}</Text>
          {/* Statut de la réservation */}
          <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{resa.statut ? resa.statut.charAt(0).toUpperCase() + resa.statut.slice(1) : ''}</Text>
        </View>
      </View>
    )) : (
      // Message si aucune réservation
      <Text style={{ color: colors.textSecondary, fontStyle: 'italic' }}>Aucune réservation</Text>
    )}
  </View>
);

export default ReservationList;