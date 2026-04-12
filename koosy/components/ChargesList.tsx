import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Charge } from '../models/models';

const formatMoney = (amount: number) =>
  new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

const parseChargeDate = (dateValue?: string) => {
  if (!dateValue) return null;
  const normalized = dateValue.trim();
  const dateOnlyMatch = normalized.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (dateOnlyMatch) {
    const [, year, month, day] = dateOnlyMatch;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }
  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatDate = (dateValue?: string) => {
  const date = parseChargeDate(dateValue);
  if (!date) return dateValue ?? '';
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

interface ChargesListProps {
  charges: Charge[];
  loading: boolean;
  colors: any;
  styles: any;
  onDelete: (charge: Charge) => void;
}

const ChargesList: React.FC<ChargesListProps> = ({ charges, loading, colors, styles, onDelete }) => {
  if (loading) {
    return <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 24 }} />;
  }

  if (charges.length === 0) {
    return (
      <View style={styles.emptyState}>
        <MaterialCommunityIcons name="cash-remove" size={34} color={colors.textSecondary} />
        <Text style={styles.emptyText}>Aucune charge sur cette période.</Text>
      </View>
    );
  }

  return (
    <>
      {charges.map((charge) => (
        <View key={charge.id} style={[styles.chargeCard, { borderLeftColor: colors.primary }]}>
          <View style={styles.chargeTopRow}>
            <Text style={styles.chargeTitle}>{charge.libelle}</Text>
            <Text style={styles.chargeAmount}>{formatMoney((charge.amount_cents || 0) / 100)}</Text>
          </View>
          <Text style={styles.chargeMeta}>
            {charge.categorie ? `${charge.categorie} • ` : ''}
            {formatDate(charge.date_charge)}
          </Text>
          {charge.notes ? <Text style={styles.chargeMeta}>{charge.notes}</Text> : null}
          <TouchableOpacity
            onPress={() => onDelete(charge)}
            style={[styles.deleteButton, { borderColor: colors.border }]}
          >
            <Text style={[styles.deleteText, { color: colors.primary }]}>Supprimer</Text>
          </TouchableOpacity>
        </View>
      ))}
    </>
  );
};

export default ChargesList;
