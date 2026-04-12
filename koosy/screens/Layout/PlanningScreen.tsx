import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { getPrestations } from '../../utils/api';
import { Prestation } from '../../models/models';
import PlanningCalendar from '../../components/PlanningCalendar';

const PlanningScreen: React.FC = () => {
  const { colors } = useTheme();
  const [prestations, setPrestations] = useState<Prestation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'week' | 'month'>('list');

  // Point central de chargement: utilisé au premier rendu et lors du refresh manuel.
  const loadPrestations = useCallback(async (withLoader = true) => {
    if (withLoader) setLoading(true);
    try {
      const data = await getPrestations();
      setPrestations(data as Prestation[]);
    } catch {
      setPrestations([]);
    } finally {
      if (withLoader) setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Chargement initial du planning à l'ouverture de l'écran.
    void loadPrestations(true);
  }, [loadPrestations]);

  // Déclenché par le geste "tirer pour rafraîchir" du composant PlanningCalendar.
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadPrestations(false);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.surface }]}> 
        <MaterialCommunityIcons name="calendar-clock" size={22} color={colors.primary} />
        <Text style={[styles.title, { color: colors.primary }]}>Planning des prestations</Text>
      </View>
      <View style={[styles.switchRow, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}> 
        {/* Toggle d'affichage: même source de données, deux présentations UI. */}
        <TouchableOpacity
          style={[
            styles.switchBtn,
            { borderColor: colors.primary },
            viewMode === 'list' && { backgroundColor: colors.primary },
          ]}
          onPress={() => setViewMode('list')}
        >
          <Text style={[styles.switchText, { color: viewMode === 'list' ? colors.surface : colors.primary }]}>Liste</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.switchBtn,
            { borderColor: colors.primary },
            viewMode === 'week' && { backgroundColor: colors.primary },
          ]}
          onPress={() => setViewMode('week')}
        >
          <Text style={[styles.switchText, { color: viewMode === 'week' ? colors.surface : colors.primary }]}>Semaine</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.switchBtn,
            { borderColor: colors.primary },
            viewMode === 'month' && { backgroundColor: colors.primary },
          ]}
          onPress={() => setViewMode('month')}
        >
          <Text style={[styles.switchText, { color: viewMode === 'month' ? colors.surface : colors.primary }]}>Mois</Text>
        </TouchableOpacity>
      </View>
      <PlanningCalendar
        prestations={prestations}
        loading={loading}
        refreshing={refreshing}
        // Le composant enfant remonte l'action refresh vers cette fonction.
        onRefresh={handleRefresh}
        viewMode={viewMode}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  switchBtn: {
    minWidth: 112,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchText: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
});

export default PlanningScreen;