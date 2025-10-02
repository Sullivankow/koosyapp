
import React, { useEffect, useState } from 'react';
import MapView, { Marker, Callout } from 'react-native-maps';
import { getBiens } from '../utils/api';
import { Bien } from '../models/models';
import { View, Text } from 'react-native';


const CarteScreen = () => {
  const [biens, setBiens] = useState<Bien[]>([]);

  useEffect(() => {
    getBiens().then((data) => {
      console.log('Biens récupérés pour la carte:', data);
      setBiens(data);
    }); // récupère tous les biens de la BDD
  }, []);

  return (
    <MapView
      style={{ flex: 1 }}
      initialRegion={{
        latitude: 45.631945,
        longitude: -1.029613,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      }}
    >
      {biens
        .filter(bien => bien.geo && typeof bien.geo.lat === 'number' && typeof bien.geo.lng === 'number' && bien.adresse && bien.adresse.trim() !== '')
        .map(bien => (
          <Marker
            key={bien.id}
            coordinate={{ latitude: bien.geo.lat, longitude: bien.geo.lng }}
            title={bien.nom}
            description={bien.adresse}
          >
            <Callout>
              <View style={{ maxWidth: 220 }}>
                <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{bien.nom}</Text>
                <Text>Adresse : {bien.adresse}</Text>
                <Text>Type : {bien.type}</Text>
                <Text>Superficie : {bien.superficie} m²</Text>
                <Text>Pièces : {bien.pieces}</Text>
                <Text>Statut : {bien.statut}</Text>
                {/* Ajoute d'autres infos si besoin */}
              </View>
            </Callout>
          </Marker>
        ))}
    </MapView>
  );
};

export default CarteScreen;