import React from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { Bien } from '../models/models';

const MOCK_BIENS: Bien[] = [ /* ...tes biens mockés... */];

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
              <View>
                <Text>{bien.nom}</Text>
                <Text>{bien.adresse}</Text>
                <Text>{bien.statut}</Text>
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