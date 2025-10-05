import React, { useEffect, useState } from 'react';
import { Polyline } from 'react-native-maps';
import axios from 'axios';
import { View, Text } from 'react-native';

interface Props {
  origin: { latitude: number; longitude: number };
  destination: { latitude: number; longitude: number };
  apiKey: string;
  color?: string;
  width?: number;
}

const Itineraire: React.FC<Props> = ({ origin, destination, apiKey, color = '#1976D2', width = 4 }) => {
  const [routeCoords, setRouteCoords] = useState<Array<{ latitude: number; longitude: number }>>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoute = async () => {
      if (!origin || !destination) {
        setError('Coordonnées manquantes');
        return;
      }
      try {
        const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=${origin.longitude},${origin.latitude}&end=${destination.longitude},${destination.latitude}`;
        const response = await axios.get(url);
        const geometry = response.data.features[0]?.geometry?.coordinates;
        if (geometry && geometry.length > 0) {
          // Conversion [lng, lat] -> { latitude, longitude }
          const coords = geometry.map(([lng, lat]: [number, number]) => ({
            latitude: lat,
            longitude: lng,
          }));
          setRouteCoords(coords);
          setError(null);
        } else {
          setError('Aucun itinéraire trouvé');
        }
      } catch (err) {
        setError('Erreur API OpenRouteService');
        console.error('Erreur récupération itinéraire:', err);
      }
    };
    fetchRoute();
  }, [origin, destination, apiKey]);

  if (error) {
    return (
      <View style={{ position: 'absolute', top: 40, left: 0, right: 0, alignItems: 'center', zIndex: 10 }}>
        <Text style={{ color: 'red', backgroundColor: '#fff', padding: 8, borderRadius: 8 }}>{error}</Text>
      </View>
    );
  }

  if (routeCoords.length === 0) return null;

  return (
    <Polyline
      coordinates={routeCoords}
      strokeColor={color}
      strokeWidth={width}
    />
  );
};

export default Itineraire;
