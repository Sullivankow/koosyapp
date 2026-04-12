import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
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
    void loadPrestations(true);
  }, [loadPrestations]);

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
      <PlanningCalendar
        prestations={prestations}
        loading={loading}
        refreshing={refreshing}
        onRefresh={handleRefresh}
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
});

export default PlanningScreen;