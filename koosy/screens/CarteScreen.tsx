
import React, { useEffect, useState, useRef } from 'react';
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
  // Région contrôlée, mais ne suit plus en temps réel
  const [region, setRegion] = useState({
    latitude: 45.631945,
    longitude: -1.029613,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  });
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission localisation refusée');
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      const coords = location.coords;
      setUserLocation({
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
      // On centre la carte sur la position utilisateur uniquement au premier chargement
      setRegion({
        latitude: coords.latitude,
        longitude: coords.longitude,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      });
    })();
  }, []);

  useEffect(() => {
    getBiens().then((data) => {
      console.log('Biens récupérés pour la carte:', data);
      setBiens(data);
    }); // récupère tous les biens de la BDD
  }, [lastBienAdded]);

  // La région est maintenant contrôlée et mise à jour en temps réel

  // Bouton flottant pour recentrer sur la position utilisateur
  const handleRecenter = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      }, 500);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        region={region}
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
      {/* Bouton flottant style GPS/fleche */}
      <View style={{ position: 'absolute', bottom: 30, right: 20 }}>
        <View style={{ backgroundColor: 'white', borderRadius: 30, elevation: 4 }}>
          <Text
            onPress={handleRecenter}
            style={{ padding: 12, fontSize: 22 }}
          >
            🧭
          </Text>
        </View>
      </View>
    </View>
  );
};

export default CarteScreen;