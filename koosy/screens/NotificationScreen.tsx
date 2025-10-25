import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { listNotifications, markNotificationRead, markAllNotificationsRead } from '../utils/api';
import { useNotificationCount } from '../contexts/NotificationCountContext';
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

  const renderItem = ({ item }: { item: NotificationItem }) => (
    <View style={[styles.item, item.read ? styles.read : styles.unread]}>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.body}>{item.body}</Text>
        <Text style={styles.meta}>{dayjs(item.createdAt).format('DD/MM/YYYY HH:mm')}</Text>
      </View>
      {!item.read && (
        <TouchableOpacity style={styles.markBtn} onPress={() => markRead(item.id)}>
          <Text style={styles.markBtnText}>Marquer lu</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>Notifications</Text>
        <TouchableOpacity onPress={() => { markAllRead(); }}>
          <Text style={styles.markAll}>Tout marquer lu</Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <ActivityIndicator style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={i => String(i.id)}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 12 }}
          ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>Aucune notification</Text>}
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
});
