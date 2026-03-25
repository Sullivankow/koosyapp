import React from 'react';
import { ScrollView, TouchableOpacity, Image } from 'react-native';
import { BASE_URL } from '../constants/config';

interface CarrouselProps {
  photos?: (string | { uri: string })[];
  onPhotoPress: (photo: string) => void;
  style?: any;
  photoStyle?: any;
}

export const Carrousel: React.FC<CarrouselProps> = ({ photos = [], onPhotoPress, style, photoStyle }) => {
  const SCREEN_WIDTH = require('react-native').Dimensions.get('window').width;
  const normalizedPhotos = Array.isArray(photos)
    ? photos.map((photo) => {
        if (typeof photo === 'string') return photo;
        if (photo && typeof photo === 'object' && typeof photo.uri === 'string') return photo.uri;
        return '';
      })
    : [];
  const validPhotos = normalizedPhotos.filter((photo): photo is string => typeof photo === 'string' && !!photo && photo.trim() !== '');
  const displayPhotos = validPhotos.length > 0 ? validPhotos : [null];
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
};