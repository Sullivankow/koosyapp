import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { Bien } from '../models/models';

const MOCK_BIENS: Bien[] = [
  {
    id: '1',
    nom: 'Appartement Royan Plage',
    adresse: '10 avenue de la Grande Conche, Royan',
    type: 'Appartement',
    superficie: 55,
    pieces: 2,
    equipements: ['Wifi', 'TV', 'Balcon'],
    photos: [],
    statut: 'occupé',
    geo: { lat: 45.6256, lng: -1.0312 },
    proprio: { id: 'p1', nom: 'Jean Dupont', email: 'jean@ex.fr', telephone: '0601020304' },
    locataires: [],
    taches: [],
    historique: [],
    commentaires: [],
  },
  {
    id: '2',
    nom: 'Studio Centre Royan',
    adresse: '5 rue Gambetta, Royan',
    type: 'Studio',
    superficie: 28,
    pieces: 1,
    equipements: ['Wifi', 'Micro-ondes'],
    photos: [],
    statut: 'disponible',
    geo: { lat: 45.6290, lng: -1.0290 },
    proprio: { id: 'p2', nom: 'Marie Dubois', email: 'marie@ex.fr', telephone: '0601020305' },
    locataires: [],
    taches: [],
    historique: [],
    commentaires: [],
  },
  {
    id: '3',
    nom: 'Maison Royan Port',
    adresse: '22 quai de l’Amiral Meyer, Royan',
    type: 'Maison',
    superficie: 110,
    pieces: 4,
    equipements: ['Jardin', 'Garage', 'Wifi'],
    photos: [],
    statut: 'travaux',
    geo: { lat: 45.6268, lng: -1.0335 },
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
          latitude: 45.6256,
          longitude: -1.0312,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
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