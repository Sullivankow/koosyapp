
import React, { useEffect, useState, useRef } from 'react';
import { useBienCount } from '../contexts/BienCountContext';
import * as Location from 'expo-location';
import MapView, { Marker, Callout } from 'react-native-maps';
import { getBiens } from '../utils/api';
import { Bien } from '../models/models';
import { View, Text } from 'react-native';


// Valeur par défaut pour la région de la carte
const DEFAULT_REGION = {
  latitude: 45.631945,
  longitude: -1.029613,
  latitudeDelta: 0.1,
  longitudeDelta: 0.1,
};

const CarteScreen = () => {
  // Liste des biens à afficher sur la carte
  const [biens, setBiens] = useState<Bien[]>([]);
  // Position GPS de l'utilisateur
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  // Pour déclencher le rafraîchissement des biens
  const { lastBienAdded } = useBienCount();
  // Région affichée sur la carte (centrage et zoom)
  const [region, setRegion] = useState(DEFAULT_REGION);
  // Référence vers le composant MapView pour manipuler la carte
  const mapRef = useRef<MapView>(null);

  // Récupère la position GPS de l'utilisateur au chargement
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
      // Centre la carte sur la position utilisateur au premier chargement
      setRegion({
        latitude: coords.latitude,
        longitude: coords.longitude,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      });
    })();
  }, []);

  // Récupère la liste des biens à chaque ajout ou modification
  useEffect(() => {
    getBiens().then((data) => {
      setBiens(data);
    });
  }, [lastBienAdded]);

  // Fonction pour recentrer la carte sur la position utilisateur (bouton GPS)
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

  // Affiche le marqueur d'un bien sur la carte
  const renderBienMarker = (bien: Bien) => (
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
  );

  return (
    <View style={{ flex: 1 }}>
      {/* Carte principale */}
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
        {/* Marqueurs des biens */}
        {biens
          .filter(
            bien =>
              typeof bien.lat === 'number' &&
              typeof bien.lng === 'number' &&
              bien.lat !== undefined &&
              bien.lng !== undefined &&
              bien.adresse && bien.adresse.trim() !== ''
          )
          .map(renderBienMarker)}
      </MapView>
      {/* Bouton flottant pour recentrer sur la position utilisateur */}
      <View style={{ position: 'absolute', bottom: 30, right: 20 }}>
        <View style={{ backgroundColor: 'white', borderRadius: 30, elevation: 4 }}>
          <Text
            onPress={handleRecenter}
            style={{ padding: 12, fontSize: 22 }}
          >
            {/* Icône GPS/flèche */}
            🧭
          </Text>
        </View>
      </View>
    </View>
  );
};

export default CarteScreen;