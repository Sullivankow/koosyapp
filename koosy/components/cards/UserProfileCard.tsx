import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Modal, Alert } from 'react-native';
import { Utilisateur, Subscription } from '../../models/models';
import { MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
import { useSubscription } from '../../hooks/useSubscription';
import AbonnementCard from './AbonnementCard';

interface UserProfileCardProps {
  user: Utilisateur;
}

const UserProfileCard: React.FC<UserProfileCardProps> = ({ user }) => {
  const [showSubscriptionCard, setShowSubscriptionCard] = useState(false);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const { getMySubscription, loading, error } = useSubscription('');
  const plan = (user as any).formule ?? (user as any).abonnement ?? 'gratuit';
  const isPaidPlan = plan === 'payant' || plan === 'premium';

  const handleToggleSubscriptionCard = async () => {
    setShowSubscriptionCard(prev => !prev);

    if (!subscription) {
      const data = await getMySubscription();
      setSubscription(data as Subscription | null);
    }
  };

  return (
    <View style={styles.card}>
      <View style={{ alignItems: 'center', marginBottom: 18 }}>
        <Image
          source={user.avatar ? { uri: user.avatar } : require('../assets/house.jpg')}
          style={styles.avatar}
        />
        <Text style={styles.nom}>{user.nom}</Text>
        <Text style={styles.nom}>{user.prenom}</Text>
        <TouchableOpacity activeOpacity={0.8} onPress={handleToggleSubscriptionCard} style={styles.badgePressable}>
          <View style={styles.formuleBadge}>
            <View style={styles.badgeRow}>
              <Text style={styles.formuleText}>{isPaidPlan ? 'Formule payante' : 'Formule gratuite'}</Text>
              {isPaidPlan ? <MaterialCommunityIcons name="chevron-down" size={18} color="#000" style={{ marginLeft: 4 }} /> : null}
            </View>
            <Text style={styles.badgeHint}>Appuyez pour voir les détails</Text>
          </View>
        </TouchableOpacity>
      </View>
      <View style={styles.infoRow}>
        <MaterialCommunityIcons name="email" size={20} color="#009688" />
        <Text style={styles.infoText}>{user.email}</Text>
      </View>
      <View style={styles.infoRow}>
        <FontAwesome name="phone" size={20} color="#009688" />
        <Text style={styles.infoText}>{user.telephone}</Text>
      </View>

      <Modal
        visible={showSubscriptionCard}
        animationType="slide"
        transparent
        onRequestClose={() => setShowSubscriptionCard(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <AbonnementCard
              subscription={subscription}
              loading={loading}
              error={error}
              onClose={() => setShowSubscriptionCard(false)}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 28,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    marginBottom: 24,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#009688',
  },
  nom: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 2,
    color: '#222',
  },
  formuleBadge: {
    backgroundColor: '#e0f7fa',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    fontSize: 14,
    marginTop: 4,
    marginBottom: 10,
    alignSelf: 'center',
    fontWeight: 'bold',
  },
  badgePressable: {
    alignSelf: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formuleText: {
    color: '#000',
    fontSize: 14,
    fontWeight: 'bold',
  },
  badgeHint: {
    color: '#000',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
    opacity: 0.8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
  },
  modalContent: {
    width: '100%',
    maxWidth: 520,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#555',
  },
});

export default UserProfileCard;

