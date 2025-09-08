import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { Bien } from '../models/models';

const MOCK_BIENS: Bien[] = [
  {
    id: '1',
    nom: 'Appartement République',
    adresse: '12 rue de la Liberté, Paris',
    type: 'Appartement',
    superficie: 65,
    pieces: 3,
    equipements: ['Wifi', 'TV', 'Lave-linge'],
    photos: [],
    statut: 'occupé',
    geo: { lat: 48.867, lng: 2.363 },
    proprio: { id: 'p1', nom: 'Jean Dupont', email: 'jean@ex.fr', telephone: '0601020304' },
    locataires: [],
    taches: [],
    historique: [],
    commentaires: [],
  },
  {
    id: '2',
    nom: 'Studio Opéra',
    adresse: '5 avenue de l’Opéra, Paris',
    type: 'Studio',
    superficie: 28,
    pieces: 1,
    equipements: ['Wifi', 'Micro-ondes'],
    photos: [],
    statut: 'disponible',
    geo: { lat: 48.868, lng: 2.332 },
    proprio: { id: 'p2', nom: 'Marie Dubois', email: 'marie@ex.fr', telephone: '0601020305' },
    locataires: [],
    taches: [],
    historique: [],
    commentaires: [],
  },
  {
    id: '3',
    nom: 'Maison Montmartre',
    adresse: '22 rue Lepic, Paris',
    type: 'Maison',
    superficie: 120,
    pieces: 5,
    equipements: ['Jardin', 'Garage', 'Wifi'],
    photos: [],
    statut: 'travaux',
    geo: { lat: 48.886, lng: 2.338 },
    proprio: { id: 'p3', nom: 'Paul Morel', email: 'paul@ex.fr', telephone: '0601020306' },
    locataires: [],
    taches: [],
    historique: [],
    commentaires: [],
  },
];

function CarteScreen() {
  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={{ flex: 1 }}
        initialRegion={{
          latitude: 48.8566,
          longitude: 2.3522,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
      >
        {MOCK_BIENS.map(bien => (
          <Marker
            key={bien.id}
            coordinate={{ latitude: bien.geo.lat, longitude: bien.geo.lng }}
            title={bien.nom}
            description={bien.adresse}
          >
            <Callout>
              <View style={{ minWidth: 180 }}>
                <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{bien.nom}</Text>
                <Text style={{ color: '#666', marginBottom: 4 }}>{bien.adresse}</Text>
                <Text>Type : {bien.type}</Text>
                <Text>Statut : {bien.statut}</Text>
                <Text>Superficie : {bien.superficie} m²</Text>
                <Text>Pièces : {bien.pieces}</Text>
                {/* Ajoute d'autres infos si besoin */}
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>
    </View>
  );
}

export default CarteScreen;