// Carrousel horizontal d'images pour les biens.
// Accepte differents formats de chemin (URL absolues, chemins d'uploads, URI locales)
// et normalise tout vers une source d'image exploitable.
import React, { useMemo } from 'react';
import { ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { BASE_URL } from '../constants/config';

const SCREEN_WIDTH = Dimensions.get('window').width;

interface CarrouselProps {
  photos?: (string | { uri: string })[];
  onPhotoPress: (photo: string) => void;
  style?: any;
  photoStyle?: any;
}

export const Carrousel: React.FC<CarrouselProps> = React.memo(({ photos = [], onPhotoPress, style, photoStyle }) => {
  const normalizedPhotos = useMemo(() => {
    return Array.isArray(photos)
      ? photos.map((photo) => {
          if (typeof photo === 'string') return photo;
          if (photo && typeof photo === 'object' && typeof photo.uri === 'string') return photo.uri;
          return '';
        })
      : [];
  }, [photos]);

  const validPhotos = useMemo(
    () => normalizedPhotos.filter((photo): photo is string => typeof photo === 'string' && !!photo && photo.trim() !== ''),
    [normalizedPhotos]
  );

  const displayPhotos = useMemo(() => (validPhotos.length > 0 ? validPhotos : [null]), [validPhotos]);

  return (
    <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={style}>
      {displayPhotos.map((photo, idx) => {
        let source;
        let key = photo ? photo.trim() : `default-photo-${idx}`;
        if (photo) {
          let trimmed = photo.trim();
          trimmed = trimmed.replace(/\\/g, '/');
          if (trimmed.startsWith('/uploads') || trimmed.startsWith('./uploads')) {
            const cleanPath = trimmed.replace('./', '/');
            source = { uri: `${BASE_URL}${cleanPath}` };
          } else if (trimmed.startsWith('http') || trimmed.startsWith('file://') || trimmed.startsWith('content://')) {
            source = { uri: trimmed };
          } else if (!trimmed.includes('/') && trimmed.length > 0) {
            source = { uri: `${BASE_URL}/uploads/${trimmed}` };
          } else if (trimmed.startsWith('uploads/')) {
            source = { uri: `${BASE_URL}/${trimmed}` };
          } else {
            source = require('../assets/house.jpg');
          }
        } else {
          source = require('../assets/house.jpg');
        }
        return (
          <TouchableOpacity key={key} onPress={() => onPhotoPress(photo ? photo.trim() : '')}>
            <Image source={source} style={[photoStyle, { width: SCREEN_WIDTH - 32 }]} resizeMode="cover" />
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
});