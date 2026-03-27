// Écran carte affichant tous les biens géolocalisés.
// - Affiche les biens sous forme de marqueurs sur une MapView
// - Utilise la recherche pour filtrer les biens visibles
// - Permet de recentrer sur la position GPS de l'utilisateur.
import React, { useEffect, useState, useRef } from 'react';
import SearchBar from '../../ui/SearchBar';
import GpsTracker from '../../components/GpsTracker';
import { useBienCount } from '../../contexts/BienCountContext';
import * as Location from 'expo-location';
import MapView, { Marker, Callout } from 'react-native-maps';
import { Bien } from '../../models/models';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
// Itinéraire removed — ce fichier affiche uniquement les biens sur la carte

// Valeur par défaut pour la région de la carte
const DEFAULT_REGION = {
  latitude: 45.631945,
  longitude: -1.029613,
  latitudeDelta: 0.1,
  longitudeDelta: 0.1,
};

const CarteScreen = () => {
  
  const navigation: any = useNavigation();
  const route: any = useRoute();
  const focusFromParams = route?.params?.focusBienId as string | undefined;
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
  // Suivi GPS en temps réel
  const handleLocationUpdate = (coords: { latitude: number; longitude: number }) => {
    setUserLocation(coords);
    // Optionnel : centrer la carte sur la nouvelle position
    setRegion(region => ({
      ...region,
      latitude: coords.latitude,
      longitude: coords.longitude,
    }));
  };
  // Pour déclencher le rafraîchissement des biens
  const { lastBienAdded } = useBienCount();
  // Région affichée sur la carte (centrage et zoom)
  const [region, setRegion] = useState(DEFAULT_REGION);
  // Référence vers le composant MapView pour manipuler la carte
  const mapRef = useRef<MapView>(null);

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

  // If the screen receives a focusBienId param, select it and center
  useEffect(() => {
    if (focusFromParams) {
      setSelectedBienId(focusFromParams);
    }
  }, [focusFromParams]);

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
    import('../../utils/api').then(({ getBiens }) => {
      getBiens().then((data) => {
        // Normalize lat/lng in case backend returns strings
        const normalized = Array.isArray(data)
          ? data.map((b: any) => ({
              ...b,
              lat: b.lat !== undefined && b.lat !== null ? Number(b.lat) : undefined,
              lng: b.lng !== undefined && b.lng !== null ? Number(b.lng) : undefined,
            }))
          : [];
        setBiens(normalized);
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
      <Callout onPress={() => { setSelectedBienId(bien.id); navigation.navigate('Biens', { focusBienId: bien.id }); }}>
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
          {/* Bouton 'Voir le bien' : navigue vers l'onglet Biens et focus le bien */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Biens', { focusBienId: bien.id })}
            style={{ marginTop: 10, padding: 8, borderRadius: 8, backgroundColor: '#e3f2fd' }}
          >
            <Text style={{ color: '#1976D2', fontWeight: 'bold', textAlign: 'center' }}>Voir le bien</Text>
          </TouchableOpacity>
        </View>
      </Callout>
    </Marker>
  );

  return (
    <View style={{ flex: 1 }}>
      {/* Boutons flottants à droite : centrage et trajectoire */}
      <View style={{ position: 'absolute', bottom: 30, right: 20, zIndex: 10, alignItems: 'center' }}>
        {/* Bouton centrage */}
        <View style={{ backgroundColor: 'white', borderRadius: 30, elevation: 4, marginBottom: 16 }}>
          <Text
            onPress={handleRecenter}
            style={{ padding: 12, fontSize: 24 }}
          >
            {/* Icône GPS/flèche */}
            🧭
          </Text>
        </View>
        {/* Bouton trajectoire (GPSTracker) juste en dessous */}
        <GpsTracker onLocationUpdate={handleLocationUpdate} />
      </View>
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
        {/* Itinéraire supprimé : la carte affiche uniquement les biens */}
      </MapView>
    </View>
  );
};

export default CarteScreen;