// client-user/src/features/map/screens/MapScreen.jsx
// Mapa con mi ubicación y marcadores de alertas cercanas por categoría.
// Header rojo + badge de conteo + botón de recentrar, calcados de map.css (web).
//
// react-native-maps NO soporta web (usa componentes nativos vía
// codegenNativeComponent). Por eso solo lo cargamos en iOS/Android; en web
// mostramos un fallback en lista con las mismas alertas cercanas.

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { View, Text, FlatList, Pressable, Platform, StyleSheet } from 'react-native';
import * as Location from 'expo-location';
import { MaterialIcons } from '@expo/vector-icons';
import { useMap } from '../hooks/useMap.js';
import { usePushToken } from '../../../shared/hooks/usePushToken.js';
import { LeafletMapView } from '../components/LeafletMapView.jsx';
import { categoryLabel, categoryEmoji, categoryColor } from '../../alerts/constants.js';
import { Card, LoadingSpinner, EmptyState } from '../../../shared/components/common/Common.jsx';
import { ScreenHeader } from '../../../shared/components/common/ScreenHeader.jsx';
import { useTheme } from '../../../shared/context/ThemeContext.jsx';
import { getAlertRadius } from '../../../shared/utils/preferences.js';
import { SPACING, FONT_SIZE, SHADOWS } from '../../../shared/constants/theme.js';

// El mapa con WebView+Leaflet solo corre en nativo (iOS/Android); en web
// mostramos un fallback en lista con las mismas alertas cercanas.
const isNative = Platform.OS !== 'web';

// Centro por defecto: Ciudad de Guatemala.
const DEFAULT_REGION = {
  latitude: 14.6349,
  longitude: -90.5069,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

const getCoords = (alert) => {
  const lat = alert.location?.latitude ?? alert.latitude;
  const lng = alert.location?.longitude ?? alert.longitude;
  return lat != null && lng != null ? { latitude: lat, longitude: lng } : null;
};

export const MapScreen = ({ navigation }) => {
  const { colors: COLORS, isDark } = useTheme();
  const styles = useMemo(() => createStyles(COLORS), [COLORS]);
  const { nearbyAlerts, loading, error, updateLocation, fetchNearbyAlerts } = useMap();
  const pushToken = usePushToken();
  const [region, setRegion] = useState(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const mapRef = useRef(null);
  const watchSubscription = useRef(null);

  useEffect(() => {
    let cancelled = false;

    const start = async () => {
      const maxDistance = await getAlertRadius();
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (cancelled) return;
      if (status !== 'granted') {
        setPermissionDenied(true);
        setRegion(DEFAULT_REGION);
        fetchNearbyAlerts({ ...DEFAULT_REGION, maxDistance });
        return;
      }

      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 5000,
          distanceInterval: 15,
        },
        (pos) => {
          const coords = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
          setRegion((prev) => ({ ...coords, latitudeDelta: prev?.latitudeDelta ?? 0.05, longitudeDelta: prev?.longitudeDelta ?? 0.05 }));
          updateLocation({ ...coords, expoPushToken: pushToken, searchRadius: maxDistance });
          fetchNearbyAlerts({ ...coords, maxDistance });
        }
      );
      if (cancelled) {
        subscription.remove();
        return;
      }
      watchSubscription.current = subscription;
    };

    start();

    return () => {
      cancelled = true;
      watchSubscription.current?.remove();
      watchSubscription.current = null;
    };
  }, [updateLocation, fetchNearbyAlerts, pushToken]);

  const goToAlert = (id) =>
    navigation.navigate('Alerts', { screen: 'AlertDetail', params: { id } });

  const recenter = () => {
    if (region && mapRef.current) mapRef.current.recenter(region.latitude, region.longitude);
  };

  const countBadge = (
    <View style={styles.headerCount}>
      <Text style={styles.headerCountText}>{nearbyAlerts.length}</Text>
    </View>
  );

  if (!region) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Mapa de alertas" right={countBadge} />
        <LoadingSpinner message="Obteniendo tu ubicación..." />
      </View>
    );
  }

  // ---- Fallback web: lista de alertas cercanas (react-native-maps no corre en web) ----
  if (!isNative) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Mapa de alertas" right={countBadge} />
        <Text style={styles.webNote}>
          El mapa interactivo está disponible en la app móvil. Aquí tienes las alertas cerca de ti.
        </Text>
        <FlatList
          data={nearbyAlerts}
          keyExtractor={(item) => String(item._id)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Pressable onPress={() => goToAlert(item._id)}>
              <Card>
                <View style={styles.row}>
                  <Text style={styles.rowEmoji}>{categoryEmoji(item.category)}</Text>
                  <View style={styles.body}>
                    <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.meta}>{categoryLabel(item.category)}</Text>
                  </View>
                </View>
              </Card>
            </Pressable>
          )}
          ListEmptyComponent={
            <EmptyState icon="place" title="Sin alertas cercanas" message={error || 'No hay alertas en tu zona ahora mismo.'} />
          }
        />
      </View>
    );
  }

  // ---- Nativo: mapa real ----
  return (
    <View style={styles.container}>
      <ScreenHeader title="Mapa de alertas" right={countBadge} />

      <View style={styles.canvas}>
        <LeafletMapView
          ref={mapRef}
          style={styles.map}
          region={region}
          isDark={isDark}
          userLocation={!permissionDenied ? region : null}
          markers={nearbyAlerts
            .map((alert) => {
              const coords = getCoords(alert);
              return coords ? { id: alert._id, ...coords, emoji: categoryEmoji(alert.category), color: categoryColor(alert.category) } : null;
            })
            .filter(Boolean)}
          onMarkerPress={goToAlert}
        />

        {loading ? (
          <View style={styles.loadingPill}>
            <Text style={styles.loadingPillText}>Buscando alertas cercanas...</Text>
          </View>
        ) : null}

        <Pressable style={styles.recenterBtn} onPress={recenter}>
          <MaterialIcons name="my-location" size={22} color={COLORS.primary} />
        </Pressable>

        {permissionDenied ? (
          <View style={styles.notice}>
            <Text style={styles.noticeText}>Ubicación desactivada. Mostrando el centro de la ciudad.</Text>
          </View>
        ) : null}
        {error ? (
          <View style={styles.notice}>
            <Text style={styles.noticeText}>{error}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
};

const createStyles = (COLORS) => StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  canvas: { flex: 1, position: 'relative' },
  map: { flex: 1 },
  headerCount: {
    minWidth: 32,
    height: 26,
    paddingHorizontal: SPACING.sm,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCountText: { color: '#ffffff', fontSize: FONT_SIZE.xs, fontWeight: '700' },
  loadingPill: {
    position: 'absolute',
    top: SPACING.md,
    alignSelf: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 999,
    ...SHADOWS.card,
  },
  loadingPillText: { fontSize: FONT_SIZE.sm, color: COLORS.text },
  recenterBtn: {
    position: 'absolute',
    right: SPACING.md,
    bottom: SPACING.lg,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.elevated,
  },
  notice: {
    position: 'absolute',
    bottom: SPACING.xxl + SPACING.lg,
    left: SPACING.md,
    right: SPACING.md,
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  noticeText: { fontSize: FONT_SIZE.sm, color: COLORS.textLight, textAlign: 'center' },
  // Fallback web
  webNote: { padding: SPACING.md, fontSize: FONT_SIZE.sm, color: COLORS.textLight },
  list: { padding: SPACING.md, paddingTop: 0, flexGrow: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  rowEmoji: { fontSize: FONT_SIZE.lg },
  body: { flex: 1 },
  title: { fontSize: FONT_SIZE.md, fontWeight: '700', color: COLORS.text },
  meta: { marginTop: 2, fontSize: FONT_SIZE.sm, color: COLORS.textLight },
});

export default MapScreen;
