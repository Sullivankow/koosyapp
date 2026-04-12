import React from 'react';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Prestation } from '../../models/models';
import { useTheme } from '../../contexts/ThemeContext';

type CalendarModalProps = {
  visible: boolean;
  dayKey: string;
  items: Prestation[];
  onClose: () => void;
  onSelectItem: (item: Prestation, dayKey: string) => void;
};

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

const formatAmount = (amountCents: number) => `${(amountCents / 100).toFixed(2)} EUR`;

const statusLabel = (status: string) => {
  const normalized = (status || '').toLowerCase();
  if (normalized.includes('term')) return 'Terminee';
  if (normalized.includes('confirm')) return 'Confirmee';
  if (normalized.includes('attente')) return 'En attente';
  if (normalized.includes('annul')) return 'Annulee';
  return status || 'Inconnu';
};

const statusBg = (status: string, primary: string) => {
  const normalized = (status || '').toLowerCase();
  if (normalized.includes('annul')) return '#C62828';
  return primary;
};

// Retourne une couleur de texte lisible selon la couleur de fond du bouton.
const getContrastTextColor = (hexColor: string) => {
  const sanitized = hexColor.replace('#', '');
  if (!/^[0-9a-fA-F]{6}$/.test(sanitized)) return '#FFFFFF';
  const r = parseInt(sanitized.slice(0, 2), 16);
  const g = parseInt(sanitized.slice(2, 4), 16);
  const b = parseInt(sanitized.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? '#111111' : '#FFFFFF';
};

const CalendarModal: React.FC<CalendarModalProps> = ({ visible, dayKey, items, onClose, onSelectItem }) => {
  const { colors } = useTheme();
  const closeButtonTextColor = getContrastTextColor(colors.primary);

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        {/* Carte modale: liste complete des prestations du jour selectionne. */}
        <Pressable
          style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={(e) => e.stopPropagation()}
        >
          <Text style={[styles.title, { color: colors.primary }]}>Prestations du {formatDateLabel(dayKey)}</Text>

          {items.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Aucune prestation pour cette date.</Text>
          ) : (
            items.map((item) => (
              <TouchableOpacity
                key={`modal-${item.id}`}
                style={[styles.item, { borderColor: colors.border, backgroundColor: colors.background }]}
                onPress={() => onSelectItem(item, dayKey)}
              >
                <View style={[styles.dot, { backgroundColor: statusBg(item.status, colors.primary) }]} />
                <View style={styles.itemBody}>
                  <Text style={[styles.itemTitle, { color: colors.text }]} numberOfLines={1}>
                    {item.bien?.nom || 'Bien non renseigne'}
                  </Text>
                  <Text style={[styles.itemMeta, { color: colors.textSecondary }]} numberOfLines={1}>
                    {statusLabel(item.status)} - {formatAmount(item.amount_cents)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}

          <TouchableOpacity style={[styles.closeBtn, { backgroundColor: colors.primary }]} onPress={onClose}>
            <Text style={[styles.closeText, { color: closeButtonTextColor }]}>Fermer</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#00000066',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    maxHeight: '78%',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 13,
    marginBottom: 8,
  },
  item: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  itemBody: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  itemMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    marginTop: 4,
    alignSelf: 'center',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  closeText: {
    fontWeight: '700',
    fontSize: 12,
  },
});

export default CalendarModal;