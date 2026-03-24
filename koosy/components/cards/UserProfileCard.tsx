import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Utilisateur } from '../../models/models';
import { MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';

interface UserProfileCardProps {
  user: Utilisateur;
}

const UserProfileCard: React.FC<UserProfileCardProps> = ({ user }) => {
  return (
    <View style={styles.card}>
      <View style={{ alignItems: 'center', marginBottom: 18 }}>
        <Image
          source={user.avatar ? { uri: user.avatar } : require('../assets/house.jpg')}
          style={styles.avatar}
        />
        <Text style={styles.nom}>{user.nom}</Text>
        <Text style={styles.nom}>{user.prenom}</Text>
        <Text style={styles.formuleBadge}>{user.formule === 'gratuit' ? 'Formule gratuite' : 'Formule payante'}</Text>
      </View>
      <View style={styles.infoRow}>
        <MaterialCommunityIcons name="email" size={20} color="#009688" />
        <Text style={styles.infoText}>{user.email}</Text>
      </View>
      <View style={styles.infoRow}>
        <FontAwesome name="phone" size={20} color="#009688" />
        <Text style={styles.infoText}>{user.telephone}</Text>
      </View>
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
    color: '#000',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    fontSize: 14,
    marginTop: 4,
    marginBottom: 10,
    alignSelf: 'center',
    fontWeight: 'bold',
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

