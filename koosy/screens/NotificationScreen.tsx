import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { listNotifications, markNotificationRead, markAllNotificationsRead } from '../utils/api';
import { deleteNotification } from '../utils/api';
import { useNotificationCount } from '../contexts/NotificationCountContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import dayjs from 'dayjs';

type NotificationItem = {
  id: number;
  title: string;
  body: string;
  data?: any;
  read: boolean;
  createdAt: string;
};

export default function NotificationScreen() {
  const { colors, isDarkMode } = useTheme();
  const [toast, setToast] = useState<string | null>(null);
  const toastTimerRef = React.useRef<number | null>(null);
  // Liste des notifications locales
  const [items, setItems] = useState<NotificationItem[]>([]);
  // Indique si la liste est en cours de chargement
  const [loading, setLoading] = useState(false);
  // Accès à la fonction de refresh du compteur global (context)
  const { refresh: refreshCount } = useNotificationCount();

  // --- Fonction qui récupère la liste des notifications depuis l'API ---
  async function fetchList() {
    try {
      setLoading(true);
      const res = await listNotifications(1, 50);
      if (!res) {
        setItems([]);
        return;
      }
      // res.items attendu: tableau de notifications
      setItems(res.items ?? []);
    } catch (err: any) {
      console.warn('Erreur récupération notifications', err);
      Alert.alert('Erreur', err?.message ?? String(err));
    } finally {
      setLoading(false);
    }
  }

  // Chargement initial
  useEffect(() => {
    fetchList();
  }, []);

  const markRead = async (id: number) => {
    try {
      await markNotificationRead(id);
      await refreshCount();
      // update local state quickly
      setItems(prev => prev.map(i => (i.id === id ? { ...i, read: true } : i)));
      // show success toast
      setToast('Notification marquée comme lue');
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current as any);
      toastTimerRef.current = setTimeout(() => setToast(null), 2200) as any;
    } catch (err: any) {
      console.warn('markRead error', err);
      Alert.alert('Erreur', err?.message ?? String(err));
    }
  };

  const markAllRead = async () => {
    try {
      await markAllNotificationsRead();
      await refreshCount();
      // update local state
      setItems(prev => prev.map(i => ({ ...i, read: true })));
    } catch (err: any) {
      console.warn('markAllRead error', err);
      Alert.alert('Erreur', err?.message ?? String(err));
    }
  };

  const handleDelete = async (id: number) => {
    Alert.alert('Supprimer', "Supprimer cette notification ?", [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteNotification(id);
            await refreshCount();
            setItems(prev => prev.filter(i => i.id !== id));
            // success toast
            setToast('Notification supprimée');
            if (toastTimerRef.current) clearTimeout(toastTimerRef.current as any);
            toastTimerRef.current = setTimeout(() => setToast(null), 2200) as any;
          } catch (err: any) {
            console.warn('deleteNotification error', err);
            Alert.alert('Erreur', err?.message ?? String(err));
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: NotificationItem }) => (
    <View style={[
      styles.item,
      { backgroundColor: item.read ? colors.surface : (isDarkMode ? '#2A2F36' : '#f7f7f7') },
      { borderColor: colors.border, borderWidth: 1, shadowColor: colors.shadow, elevation: 2 },
    ]}> 
      <View style={{ flex: 1 }}>
        <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
        <Text style={[styles.body, { color: colors.textSecondary }]}>{item.body}</Text>
        <Text style={[styles.meta, { color: colors.textSecondary }]}>{dayjs(item.createdAt).format('DD/MM/YYYY HH:mm')}</Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {!item.read && (
          <TouchableOpacity style={[styles.markBtn, { backgroundColor: colors.accent }]} onPress={() => markRead(item.id)}>
            <Text style={[styles.markBtnText, { color: colors.surface }]}>Marquer lu</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={() => handleDelete(item.id)} style={{ marginLeft: 8, padding: 6 }}>
          <MaterialCommunityIcons name="trash-can-outline" size={20} color={colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <View style={styles.headerRow}>
        <Text style={[styles.header, { color: colors.primary }]}>Notifications</Text>
        <TouchableOpacity onPress={() => { markAllRead(); }}>
          <Text style={[styles.markAll, { color: colors.accent }]}>Tout marquer lu</Text>
        </TouchableOpacity>
      </View>
      {/* toast */}
      {toast ? (
        <View style={[styles.toast, { backgroundColor: colors.success }]}> 
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      ) : null}
      {loading ? (
        <ActivityIndicator style={{ marginTop: 20 }} color={colors.primary} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={i => String(i.id)}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 12 }}
          ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20, color: colors.text }}>Aucune notification</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { fontSize: 20, fontWeight: '700', marginLeft: 12 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12 },
  markAll: { color: '#007AFF', marginRight: 12 },
  item: { flexDirection: 'row', padding: 12, borderRadius: 8, marginBottom: 10, alignItems: 'center' },
  unread: { backgroundColor: '#f7f7f7' },
  read: { backgroundColor: '#ffffff' },
  title: { fontWeight: '700', marginBottom: 4 },
  body: { color: '#333', marginBottom: 6 },
  meta: { fontSize: 12, color: '#888' },
  markBtn: { backgroundColor: '#007AFF', paddingVertical: 6, paddingHorizontal: 8, borderRadius: 6, marginLeft: 8 },
  markBtnText: { color: 'white', fontWeight: '700', fontSize: 12 },
  toast: {
    position: 'absolute',
    top: 12,
    alignSelf: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    zIndex: 1000,
  },
  toastText: {
    color: '#fff',
    fontWeight: '700',
  },
});
