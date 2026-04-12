import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { getPrestations } from '../../utils/api';
import { Prestation } from '../../models/models';
import PlanningCalendar from '../../components/PlanningCalendar';
import { createPlanningScreenStyles } from './styles/PlanningScreen.styles';

const PlanningScreen: React.FC = () => {
  const { colors } = useTheme();
  const styles = createPlanningScreenStyles(colors);
  const [prestations, setPrestations] = useState<Prestation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'today' | 'week' | 'month'>('today');

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
      <View style={styles.header}> 
        <MaterialCommunityIcons name="calendar-clock" size={22} color={colors.primary} />
        <Text style={styles.title}>Planning des prestations</Text>
      </View>
      <View style={styles.switchRow}> 
        {/* Toggle d'affichage: même source de données, deux présentations UI. */}
        <TouchableOpacity
          style={[
            styles.switchBtn,
            { borderColor: colors.primary },
            viewMode === 'today' && { backgroundColor: colors.primary },
          ]}
          onPress={() => setViewMode('today')}
        >
          <Text style={[styles.switchText, { color: viewMode === 'today' ? colors.surface : colors.primary }]}>Jour J</Text>
        </TouchableOpacity>
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

export default PlanningScreen;