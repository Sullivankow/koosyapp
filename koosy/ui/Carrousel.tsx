// Carrousel horizontal d'images pour les biens.
// Accepte differents formats de chemin (URL absolues, chemins d'uploads, URI locales)
// et normalise tout vers une source d'image exploitable.
import React, { useMemo } from 'react';
import { ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { BASE_URL } from '../constants/config';

const SCREEN_WIDTH = Dimensions.get('window').width;

// Image par defaut pre-chargee une seule fois au chargement du module.
// require() est cache par Metro : le meme appel retourne toujours le meme objet.
const DEFAULT_PHOTO = require('../assets/house.jpg');

// ============================================================================
// RESOLUTION D'UNE PHOTO EN SOURCE D'IMAGE
// = Normalise un chemin (string) en objet { uri } pour <Image source={...} />
// Gère : URL https/http, chemin /uploads, "./uploads", "uploads/", nom de fichier
// ============================================================================
function resolvePhotoSource(photo: string) {
  let trimmed = photo.trim().replace(/\\/g, '/');

  if (trimmed.startsWith('/uploads') || trimmed.startsWith('./uploads')) {
    return { uri: `${BASE_URL}${trimmed.replace('./', '/')}` };
  }
  if (trimmed.startsWith('https://') || trimmed.startsWith('http://') || trimmed.startsWith('file://') || trimmed.startsWith('content://')) {
    return { uri: trimmed };
  }
  if (!trimmed.includes('/') && trimmed.length > 0) {
    return { uri: `${BASE_URL}/uploads/${trimmed}` };
  }
  if (trimmed.startsWith('uploads/')) {
    return { uri: `${BASE_URL}/${trimmed}` };
  }

  return DEFAULT_PHOTO;
}

interface CarrouselProps {
  photos?: (string | { uri: string })[];
  onPhotoPress: (photo: string) => void;
  style?: any;
  photoStyle?: any;
}

export const Carrousel: React.FC<CarrouselProps> = React.memo(({ photos = [], onPhotoPress, style, photoStyle }) => {
  // ---------------------------------------------------------------------------
  // NORMALISATION : convertit { uri: string } en string, filtre vide/null
  // ---------------------------------------------------------------------------
  const normalizedPhotos = useMemo(() => {
    if (!Array.isArray(photos)) return [];
    return photos
      .map((photo) => {
        if (typeof photo === 'string') return photo;
        if (photo && typeof photo === 'object' && typeof (photo as any).uri === 'string') return (photo as any).uri;
        return '';
      })
      .filter((photo): photo is string => typeof photo === 'string' && !!photo.trim());
  }, [photos]);

  // ---------------------------------------------------------------------------
  // SOURCES PRE-CALCULEES : chaque URI est resolue une seule fois, memoized
  // mapPhotoSources[photo] = source object
  // ---------------------------------------------------------------------------
  const mapPhotoSources = useMemo(() => {
    const sources: Record<string, any> = {};
    normalizedPhotos.forEach((photo) => {
      sources[photo] = resolvePhotoSource(photo);
    });
    return sources;
  }, [normalizedPhotos]);

  // ---------------------------------------------------------------------------
  // DISPLAY PHOTOS : si photos valides -> liste de strings, sinon [null] pour placeholder
  // ---------------------------------------------------------------------------
  const displayPhotos = useMemo(
    () => (normalizedPhotos.length > 0 ? normalizedPhotos : [null]),
    [normalizedPhotos]
  );

  // ---------------------------------------------------------------------------
  // DIMENSION DES IMAGES : calculee une fois
  // ---------------------------------------------------------------------------
  const imageWidth = SCREEN_WIDTH - 32;

  return (
    <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={style}>
      {displayPhotos.map((photo, idx) => {
        const key = photo ? photo.trim() : `default-photo-${idx}`;
        // Source deja resolue via mapPhotoSources (ou DEFAULT_PHOTO)
        const source = photo ? (mapPhotoSources[photo] ?? DEFAULT_PHOTO) : DEFAULT_PHOTO;
        return (
          <TouchableOpacity key={key} onPress={() => onPhotoPress(photo ? photo.trim() : '')}>
            <Image source={source} style={[photoStyle, { width: imageWidth }]} resizeMode="cover" />
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
});
