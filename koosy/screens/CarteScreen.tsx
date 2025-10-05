import React, { useEffect, useState, useRef } from 'react';
import SearchBar from '../components/SearchBar';
import { useBienCount } from '../contexts/BienCountContext';
import * as Location from 'expo-location';
import MapView, { Marker, Callout } from 'react-native-maps';
import { Bien } from '../models/models';
import { View, Text } from 'react-native';
import Itineraire from '../components/Itineraire';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Valeur par défaut pour la région de la carte
const DEFAULT_REGION = {
  latitude: 45.631945,
  longitude: -1.029613,
  latitudeDelta: 0.1,
  longitudeDelta: 0.1,
};

const CarteScreen = () => {
  // Bien sélectionné pour centrage et Callout
  const [selectedBienId, setSelectedBienId] = useState<string | null>(null);
  // Barre de recherche pour filtrer les biens
  const [search, setSearch] = useState('');
  // Liste des biens à afficher sur la carte
  const [biens, setBiens] = useState<Bien[]>([]);
  // Filtrage des biens selon la recherche
  const filteredBiens = biens.filter(bien =>
    bien.nom.toLowerCase().includes(search.toLowerCase()) ||
    bien.adresse.toLowerCase().includes(search.toLowerCase())
  );
  // Position GPS de l'utilisateur
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  // Pour déclencher le rafraîchissement des biens
  const { lastBienAdded } = useBienCount();
  // Région affichée sur la carte (centrage et zoom)
  const [region, setRegion] = useState(DEFAULT_REGION);
  // Référence vers le composant MapView pour manipuler la carte
  const mapRef = useRef<MapView>(null);
  // Affichage du tracé d'itinéraire
  const [showRoute, setShowRoute] = useState(false);

  // Centrage et ouverture du Callout sur le bien sélectionné
  useEffect(() => {
    if (selectedBienId && mapRef.current) {
      const bien = biens.find(b => b.id === selectedBienId);
      if (bien && typeof bien.lat === 'number' && typeof bien.lng === 'number') {
        mapRef.current.animateToRegion({
          latitude: bien.lat,
          longitude: bien.lng,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }, 500);
      }
    }
  }, [selectedBienId, biens]);

  // Récupère la position GPS de l'utilisateur au chargement
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        // Permission refusée
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
    import('../utils/api').then(({ getBiens }) => {
      getBiens().then((data) => {
        setBiens(data);
      });
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
      <Callout
        onPress={() => {
          setSelectedBienId(bien.id);
          setShowRoute(true);
        }}
      >
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
          {/* Bouton itinéraire moderne avec flèche GPS */}
          <Text
            style={{ marginTop: 10, color: '#1976D2', fontWeight: 'bold', textAlign: 'center', padding: 8, borderRadius: 8, backgroundColor: '#e3f2fd' }}
          >
            Itinéraire <MaterialCommunityIcons name="navigation-variant" size={20} color="#1976D2" />
          </Text>
        </View>
      </Callout>
    </Marker>
  );

  return (
    <View style={{ flex: 1 }}>
      {/* Barre de recherche en haut */}
      <View style={{ padding: 12, backgroundColor: 'white', zIndex: 2 }}>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Rechercher un bien..."
        />
        {/* Liste des biens filtrés (suggestions) */}
        {search.length > 0 && filteredBiens.length > 0 && (
          <View style={{ backgroundColor: '#fff', borderRadius: 8, marginTop: 4, elevation: 2, maxHeight: 180 }}>
            {filteredBiens.map(bien => (
              <Text
                key={bien.id}
                style={{ padding: 8, borderBottomWidth: 1, borderColor: '#eee' }}
                onPress={() => {
                  setSelectedBienId(bien.id);
                  setSearch(''); // Réinitialise la barre de recherche
                }}
              >
                {bien.nom} - {bien.adresse}
              </Text>
            ))}
          </View>
        )}
      </View>
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
        {/* Marqueurs des biens filtrés */}
        {filteredBiens
          .filter(
            bien =>
              typeof bien.lat === 'number' &&
              typeof bien.lng === 'number' &&
              bien.lat !== undefined &&
              bien.lng !== undefined &&
              bien.adresse && bien.adresse.trim() !== ''
          )
          .map(renderBienMarker)}
        {/* Affichage de l'itinéraire si demandé */}
        {showRoute && userLocation && selectedBienId && (
          (() => {
            const bien = biens.find(b => b.id === selectedBienId);
            if (bien && bien.lat && bien.lng) {
              return (
                <Itineraire
                  origin={userLocation}
                  destination={{ latitude: bien.lat, longitude: bien.lng }}
                  apiKey="eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjU2NjBlZDE2MTQ0ZjRlMGRiNmU0NzkxYjdmNWI4ZjFkIiwiaCI6Im11cm11cjY0In0="
                />
              );
            }
            return null;
          })()
        )}
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