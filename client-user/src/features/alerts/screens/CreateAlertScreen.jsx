// client-user/src/features/alerts/screens/CreateAlertScreen.jsx
// Crear alerta: título, categoría, riesgo, descripción, ubicación GPS e imagen.

import { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';
import { useAlerts } from '../hooks/useAlerts.js';
import { CATEGORIES, RISK_TYPES } from '../constants.js';
import { Input } from '../../../shared/components/common/Input.jsx';
import { Button } from '../../../shared/components/common/Button.jsx';
import { showAlert } from '../../../shared/utils/alert.js';
import { useTheme } from '../../../shared/context/ThemeContext.jsx';
import { SPACING, FONT_SIZE } from '../../../shared/constants/theme.js';

export const CreateAlertScreen = ({ navigation }) => {
  const { colors: COLORS } = useTheme();
  const styles = useMemo(() => createStyles(COLORS), [COLORS]);
  const insets = useSafeAreaInsets();
  const { createAlert, loading } = useAlerts();

  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [category, setCategory] = useState('');
  const [riskType, setRiskType] = useState('MODERADO');
  const [coords, setCoords] = useState(null);
  const [locationLabel, setLocationLabel] = useState('Obteniendo ubicación...');
  const [image, setImage] = useState(null);

  // Al montar, pedir permiso y ubicación GPS actual.
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationLabel('Permiso de ubicación denegado');
        return;
      }
      const pos = await Location.getCurrentPositionAsync({});
      setCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
      setLocationLabel('Ubicación GPS detectada');
    })();
  }, []);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showAlert('Permiso requerido', 'Se necesita acceso a tus fotos para adjuntar una imagen.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled && result.assets?.[0]) {
      const asset = result.assets[0];
      setImage({
        uri: asset.uri,
        name: asset.fileName || 'alerta.jpg',
        type: asset.mimeType || 'image/jpeg',
        // En web, expo-image-picker expone el File real del <input>; lo necesitamos
        // porque el objeto {uri,name,type} (idioma nativo de RN) no sirve como
        // parte de FormData en el navegador.
        file: asset.file,
      });
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !text.trim() || !category) {
      showAlert('Campos incompletos', 'Completa título, categoría y descripción.');
      return;
    }
    if (!coords) {
      showAlert('Sin ubicación', 'No se pudo obtener tu ubicación GPS.');
      return;
    }

    const result = await createAlert({
      title: title.trim(),
      category,
      riskType,
      text: text.trim(),
      location: { ...coords, address: locationLabel },
      image,
    });

    if (result.success) {
      showAlert('Alerta publicada', 'Tu alerta ya es visible para la comunidad.', () =>
        navigation.navigate('Alerts', { screen: 'AlertsList' })
      );
    } else {
      showAlert('No se pudo publicar', result.message);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.content, { paddingTop: SPACING.md + insets.top }]}>
      <Text style={styles.heading}>Crear alerta</Text>

      <Input label="Título" placeholder="Ej: Accidente en Calzada Roosevelt" value={title} onChangeText={setTitle} autoCapitalize="sentences" />

      <Text style={styles.label}>Categoría</Text>
      <View style={styles.grid}>
        {CATEGORIES.map((c) => (
          <Pressable
            key={c.value}
            style={[styles.gridItem, category === c.value && styles.gridItemActive]}
            onPress={() => setCategory(c.value)}
          >
            <MaterialIcons name={c.icon} size={22} color={category === c.value ? COLORS.surface : COLORS.primary} />
            <Text style={[styles.gridLabel, category === c.value && styles.gridLabelActive]}>{c.label}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Nivel de riesgo</Text>
      <View style={styles.riskRow}>
        {RISK_TYPES.map((r) => (
          <Pressable
            key={r.value}
            style={[styles.riskChip, riskType === r.value && styles.riskChipActive]}
            onPress={() => setRiskType(r.value)}
          >
            <Text style={[styles.riskText, riskType === r.value && styles.riskTextActive]}>{r.label}</Text>
          </Pressable>
        ))}
      </View>

      <Input label="Descripción" placeholder="Describe lo que está sucediendo..." value={text} onChangeText={setText} multiline autoCapitalize="sentences" />

      <Text style={styles.label}>Ubicación</Text>
      <View style={styles.locationBox}>
        <MaterialIcons name="place" size={20} color={COLORS.primary} />
        <Text style={styles.locationText}>{locationLabel}</Text>
      </View>

      <Text style={styles.label}>Imagen (opcional)</Text>
      {image ? (
        <Image source={{ uri: image.uri }} style={styles.preview} />
      ) : null}
      <Button title={image ? 'Cambiar imagen' : 'Adjuntar imagen'} variant="secondary" onPress={pickImage} style={styles.imageBtn} />

      <Button title="Publicar alerta" onPress={handleSubmit} loading={loading} style={styles.submit} />
    </ScrollView>
  );
};

const createStyles = (COLORS) => StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.md, paddingBottom: SPACING.xxl },
  heading: { fontSize: FONT_SIZE.xl, fontWeight: '800', color: COLORS.text, marginBottom: SPACING.md },
  label: { fontSize: FONT_SIZE.sm, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.md },
  gridItem: {
    width: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.md,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  gridItemActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  gridLabel: { fontSize: FONT_SIZE.sm, fontWeight: '600', color: COLORS.text },
  gridLabelActive: { color: COLORS.surface },
  riskRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.md },
  riskChip: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
  },
  riskChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  riskText: { fontSize: FONT_SIZE.sm, fontWeight: '600', color: COLORS.text },
  riskTextActive: { color: COLORS.surface },
  locationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    marginBottom: SPACING.md,
  },
  locationText: { fontSize: FONT_SIZE.sm, color: COLORS.textLight },
  preview: { width: '100%', height: 180, borderRadius: 12, marginBottom: SPACING.sm },
  imageBtn: { marginBottom: SPACING.lg },
  submit: { marginTop: SPACING.sm },
});

export default CreateAlertScreen;
