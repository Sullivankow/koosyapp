import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Calendar, CalendarList, Agenda } from 'react-native-calendars';
import { useTheme } from '../contexts/ThemeContext';
import { Reservation } from '../models/models';

// Props : liste des réservations
interface CalendrierProps {
    reservations: Reservation[];
}

// Fonction utilitaire pour marquer les jours avec réservations
function getMarkedDates(reservations: Reservation[]) {
    const marked: Record<string, any> = {};
    reservations.forEach(res => {
        marked[res.dateArrivee] = {
            marked: true,
            dotColor: '#43A047',
            activeOpacity: 0.8,
        };
        marked[res.dateDepart] = {
            marked: true,
            dotColor: '#E53935',
            activeOpacity: 0.8,
        };
    });
    return marked;
}

const Calendrier: React.FC<CalendrierProps> = ({ reservations }) => {
    const { colors } = useTheme();
    const markedDates = getMarkedDates(reservations);

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <Calendar
                markedDates={markedDates}
                theme={{
                    backgroundColor: colors.background,
                    calendarBackground: colors.surface,
                    textSectionTitleColor: colors.textSecondary,
                    selectedDayBackgroundColor: colors.primary,
                    selectedDayTextColor: '#fff',
                    todayTextColor: colors.accent,
                    dayTextColor: colors.text,
                    arrowColor: colors.primary,
                }}
            />
            {/* Liste des réservations du jour sélectionné à ajouter si besoin */}
        </View>
    );
};

const styles = StyleSheet.create({});

export default Calendrier;
