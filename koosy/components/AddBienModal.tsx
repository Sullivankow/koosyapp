import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions, Image, ScrollView, KeyboardAvoidingView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../contexts/ThemeContext';
import { createBien, updateBien, uploadBienImages, geocodeAdresse } from '../utils/api';
import { useBienCount } from '../contexts/BienCountContext';

const SCREEN_WIDTH = Dimensions.get('window').width;

interface AddBienModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  // mode: 'add' (default) or 'edit'
  mode?: 'add' | 'edit';
  // when editing, provide the bien id and initial data
  bienId?: string;
  initialData?: Partial<any>;
}

const AddBienModal: React.FC<AddBienModalProps> = ({ visible, onClose, onSuccess, mode = 'add', bienId, initialData }) => {
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const { refreshBiensCount, signalBienAdded } = useBienCount();
  // Sélection d'image (plusieurs)
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      aspect: [4, 3],
      quality: 1,
      allowsMultipleSelection: true,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setSelectedImages(prev => [
        ...prev,
        ...result.assets.map(asset => asset.uri).filter(uri => !!uri)
      ]);
    }
  };

  // Suppression d'une image
  const removeImage = (uri: string) => {
    setSelectedImages(prev => prev.filter(img => img !== uri));
  };
  const { colors } = useTheme();
  const [form, setForm] = useState({
    nom: '',
    adresse: '',
    type: '',
    superficie: '',
    pieces: '',
    proprietaireNom: '',
    proprietaireEmail: '',
    proprietaireTelephone: '',
    equipements: '',
  });
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async () => {
    setLoading(true);
    setSuccessMsg('');
    try {
      const data = {
        nom: form.nom,
        adresse: form.adresse,
        type: form.type,
        superficie: Number(form.superficie),
        pieces: Number(form.pieces),
        proprietaireNom: form.proprietaireNom,
        proprietaireEmail: form.proprietaireEmail,
        proprietaireTelephone: form.proprietaireTelephone,
        equipements: form.equipements ? form.equipements.split(',').map(e => e.trim()) : [],
      };
      if (mode === 'add') {
        // 1. Création du bien
        const { id: newBienId } = await createBien(data);
        // 2. Si le backend n'a pas géocodé (ou si lat/lng manquent), demander géocodage via le backend et patcher
        if (newBienId) {
          try {
            // On tente d'obtenir des coordonnées depuis le backend centralisé
            const coords = await geocodeAdresse(data.adresse);
            if (coords && (coords.lat !== undefined && coords.lng !== undefined)) {
              // Patch le bien pour ajouter lat/lng
              await updateBien(String(newBienId), { lat: coords.lat, lng: coords.lng });
            }
          } catch (e) {
            // ignore geocoding failure silently
          }
        }
        // 3. Upload des images si présentes
        if (newBienId && selectedImages.length > 0) {
          await uploadBienImages(newBienId, selectedImages);
        }
        setSuccessMsg('Bien ajouté avec succès !');
      } else {
        // edit mode
        if (!bienId) throw new Error('bienId requis pour l\'édition');
        await updateBien(bienId, data);
        // si ajout d'images, les uploader
        if (selectedImages.length > 0) {
          await uploadBienImages(Number(bienId), selectedImages);
        }
        setSuccessMsg('Bien modifié avec succès !');
      }
      await refreshBiensCount();
      signalBienAdded();
      setTimeout(() => {
        setSuccessMsg('');
        setForm({ nom: '', adresse: '', type: '', superficie: '', pieces: '', proprietaireNom: '', proprietaireEmail: '', proprietaireTelephone: '', equipements: '' });
        setSelectedImages([]);
        setLoading(false);
        onClose();
        if (onSuccess) onSuccess();
      }, 1200);
    } catch (err) {
      setSuccessMsg(mode === 'add' ? "Erreur lors de l'ajout du bien" : "Erreur lors de la modification du bien");
      setLoading(false);
    }
  };

  // Pré-remplir les champs si initialData fourni (mode edit)
  React.useEffect(() => {
    if (mode === 'edit' && initialData && visible) {
      setForm({
        nom: initialData.nom || '',
        adresse: initialData.adresse || '',
        type: initialData.type || '',
        superficie: initialData.superficie ? String(initialData.superficie) : '',
        pieces: initialData.pieces ? String(initialData.pieces) : '',
        proprietaireNom: initialData.proprietaireNom || initialData.proprio?.nom || '',
        proprietaireEmail: initialData.proprietaireEmail || initialData.proprio?.email || '',
        proprietaireTelephone: initialData.proprietaireTelephone || initialData.proprio?.telephone || '',
        equipements: Array.isArray(initialData.equipements) ? initialData.equipements.join(', ') : (initialData.equipements || ''),
      });
      // ne pré-remplit pas selectedImages (on ajoute seulement)
    }
  }, [mode, initialData, visible]);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlayAdd}>
        <KeyboardAvoidingView behavior="padding" style={{ flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center' }}>
          <View style={[styles.modalContentAdd, { backgroundColor: colors.surface }]}> 
            <ScrollView
              style={{ maxHeight: 400, width: '100%' }}
              contentContainerStyle={{ alignItems: 'center', paddingBottom: 30 }}
              keyboardShouldPersistTaps="handled"
              horizontal={false}
            >
              <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 12, color: colors.primary }}>Ajouter un bien</Text>
              <TextInput style={[styles.input, { color: '#111' }]} placeholder="Nom" placeholderTextColor="#888" value={form.nom} onChangeText={v => setForm(f => ({ ...f, nom: v }))} />
              <TextInput style={[styles.input, { color: '#111' }]} placeholder="Adresse" placeholderTextColor="#888" value={form.adresse} onChangeText={v => setForm(f => ({ ...f, adresse: v }))} />
              <TextInput style={[styles.input, { color: '#111' }]} placeholder="Type (Appartement, Maison...)" placeholderTextColor="#888" value={form.type} onChangeText={v => setForm(f => ({ ...f, type: v }))} />
              <TextInput style={[styles.input, { color: '#111' }]} placeholder="Superficie (m²)" placeholderTextColor="#888" value={form.superficie} onChangeText={v => setForm(f => ({ ...f, superficie: v }))} keyboardType="numeric" />
              <TextInput style={[styles.input, { color: '#111' }]} placeholder="Nombre de pièces" placeholderTextColor="#888" value={form.pieces} onChangeText={v => setForm(f => ({ ...f, pieces: v }))} keyboardType="numeric" />
              <TextInput style={[styles.input, { color: '#111' }]} placeholder="Nom du propriétaire" placeholderTextColor="#888" value={form.proprietaireNom} onChangeText={v => setForm(f => ({ ...f, proprietaireNom: v }))} />
              <TextInput style={[styles.input, { color: '#111' }]} placeholder="Email du propriétaire" placeholderTextColor="#888" value={form.proprietaireEmail} onChangeText={v => setForm(f => ({ ...f, proprietaireEmail: v }))} keyboardType="email-address" />
              <TextInput style={[styles.input, { color: '#111' }]} placeholder="Téléphone du propriétaire" placeholderTextColor="#888" value={form.proprietaireTelephone} onChangeText={v => setForm(f => ({ ...f, proprietaireTelephone: v }))} keyboardType="phone-pad" />
              <TextInput style={[styles.input, { color: '#111' }]} placeholder="Équipements (séparés par des virgules)" placeholderTextColor="#888" value={form.equipements} onChangeText={v => setForm(f => ({ ...f, equipements: v }))} />
              {/* Sélecteur d'images */}
              <TouchableOpacity style={[styles.input, { backgroundColor: '#f5f5f5', alignItems: 'center', justifyContent: 'center' }]} onPress={pickImage}>
                <Text style={{ color: '#111', fontWeight: 'bold' }}>Ajouter une photo</Text>
              </TouchableOpacity>
              {selectedImages.length > 0 && (
                <ScrollView horizontal style={{ marginVertical: 8 }}>
                  {selectedImages.map((uri, idx) => (
                    <View key={uri} style={{ marginRight: 10, position: 'relative' }}>
                      <Image source={{ uri }} style={{ width: 120, height: 90, borderRadius: 10 }} />
                      <TouchableOpacity
                        style={{ position: 'absolute', top: 4, right: 4, backgroundColor: '#fff', borderRadius: 12, padding: 2, elevation: 2 }}
                        onPress={() => removeImage(uri)}
                      >
                        <Text style={{ color: '#d32f2f', fontWeight: 'bold', fontSize: 16 }}>×</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              )}
              {successMsg ? <Text style={{ color: colors.success, marginTop: 10, textAlign: 'center' }}>{successMsg}</Text> : null}
              <TouchableOpacity style={[styles.input, { backgroundColor: colors.primary, marginTop: 18, alignItems: 'center' }]} onPress={handleSubmit} disabled={loading}>
                <Text style={{ color: colors.surface, fontWeight: 'bold', fontSize: 16 }}>{loading ? 'Enregistrement...' : 'Enregistrer'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ marginTop: 10 }} onPress={onClose}>
                <Text style={{ color: colors.error, textAlign: 'center' }}>Annuler</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlayAdd: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContentAdd: {
    width: SCREEN_WIDTH * 0.9,
    borderRadius: 18,
    padding: 22,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    alignItems: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 10,
    fontSize: 15,
    backgroundColor: '#fff',
    width: SCREEN_WIDTH * 0.8,
  },
});

export default AddBienModal;
