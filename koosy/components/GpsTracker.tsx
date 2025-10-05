import React, { useState, useRef } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';

type GpsTrackerProps = {
  onLocationUpdate: (coords: { latitude: number; longitude: number }) => void;
};

const GpsTracker: React.FC<GpsTrackerProps> = ({ onLocationUpdate }) => {
  const [tracking, setTracking] = useState(false);
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);

  const startTracking = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;

    locationSubscription.current = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.High, timeInterval: 1000, distanceInterval: 1 },
      (loc) => {
        const coords = loc.coords;
        onLocationUpdate({ latitude: coords.latitude, longitude: coords.longitude });
      }
    );
    setTracking(true);
  };

  const stopTracking = () => {
    locationSubscription.current?.remove();
    locationSubscription.current = null;
    setTracking(false);
  };

  return (
    <View style={{ backgroundColor: 'white', borderRadius: 30, elevation: 4 }}>
      <TouchableOpacity
        onPress={tracking ? stopTracking : startTracking}
        style={{
          backgroundColor: tracking ? '#D32F2F' : '#1976D2',
          borderRadius: 30,
          padding: 12,
          alignItems: 'center',
          justifyContent: 'center',
        }}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons
          name={tracking ? 'crosshairs-off' : 'crosshairs-gps'}
          size={24}
          color={'white'}
        />
      </TouchableOpacity>
    </View>
  );
};

export default GpsTracker;