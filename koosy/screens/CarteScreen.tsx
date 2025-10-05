
import React, { useEffect, useState } from 'react';
import { useBienCount } from '../contexts/BienCountContext';
import * as Location from 'expo-location';
import MapView, { Marker, Callout } from 'react-native-maps';
import { getBiens } from '../utils/api';
import { Bien } from '../models/models';
import { View, Text } from 'react-native';


const CarteScreen = () => {
  const [biens, setBiens] = useState<Bien[]>([]);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const { lastBienAdded } = useBienCount();

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission localisation refusée');
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      console.log('Position utilisateur récupérée:', location.coords);
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    })();
  }, []);

  useEffect(() => {
    getBiens().then((data) => {
      console.log('Biens récupérés pour la carte:', data);
      setBiens(data);
    }); // récupère tous les biens de la BDD
  }, [lastBienAdded]);

  return (
    <MapView
      style={{ flex: 1 }}
      initialRegion={{
        latitude: userLocation?.latitude || 45.631945,
        longitude: userLocation?.longitude || -1.029613,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      }}
    >
      {/* Marqueur position utilisateur */}
      {userLocation && (
        <Marker
          coordinate={userLocation}
          title="Vous êtes ici"
          pinColor="blue"
        />
      )}
      {biens
        .filter(
          bien =>
            typeof bien.lat === 'number' &&
            typeof bien.lng === 'number' &&
            bien.lat !== undefined &&
            bien.lng !== undefined &&
            bien.adresse && bien.adresse.trim() !== ''
        )
        .map(bien => (
          <Marker
            key={bien.id}
            coordinate={{ latitude: bien.lat as number, longitude: bien.lng as number }}
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
                <Text
                  style={{
                    color:
                      bien.statut === 'disponible'
                        ? 'green'
                        : bien.statut === 'occupé'
                        ? 'orange'
                        : 'black',
                    fontWeight: 'bold',
                  }}
                >
                  Statut : {bien.statut}
                </Text>
              </View>
            </Callout>
          </Marker>
        ))}
    </MapView>
  );
};

export default CarteScreen;