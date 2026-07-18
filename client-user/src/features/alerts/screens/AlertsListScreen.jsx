// client-user/src/features/alerts/screens/AlertsListScreen.jsx
// Feed de alertas: calca el layout de HomePage.jsx (web) — título + botón de
// refrescar, banner de estado de ubicación, divisor, chips de categoría con
// emoji, contador y tarjetas — para que la app luzca como la versión web.

import { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { MaterialIcons } from '@expo/vector-icons';
import { useAlerts } from '../hooks/useAlerts.js';
import { CATEGORIES, categoryLabel, categoryEmoji, categoryColor, RISK_META } from '../constants.js';
import { LoadingSpinner, EmptyState } from '../../../shared/components/common/Common.jsx';
import { useTheme } from '../../../shared/context/ThemeContext.jsx';
import { getAlertRadius, formatRadius } from '../../../shared/utils/preferences.js';
import { SPACING, FONT_SIZE, SHADOWS } from '../../../shared/constants/theme.js';

export const AlertsListScreen = ({ navigation }) => {
  const { colors: COLORS } = useTheme();
  const styles = useMemo(() => createStyles(COLORS), [COLORS]);
  const insets = useSafeAreaInsets();
  const { alerts, loading, error, fetchAlerts, fetchNearbyAlerts } = useAlerts();
  const [refreshing, setRefreshing] = useState(false);
  const [category, setCategory] = useState(null);
  const [locationText, setLocationText] = useState('Buscando señal GPS...');
  const [coords, setCoords] = useState(null);

  // Banner de ubicación (igual que el header de HomePage en web) + coordenadas
  // para pedir el feed ordenado por cercanía (con distancia por alerta).
  const syncLocation = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setLocationText('Sin acceso a GPS');
      setCoords(null);
      return;
    }
    try {
      const pos = await Location.getCurrentPositionAsync({});
      const next = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
      setLocationText(`${next.latitude.toFixed(4)}, ${next.longitude.toFixed(4)}`);
      setCoords(next);
    } catch {
      setLocationText('Sin acceso a GPS');
      setCoords(null);
    }
  }, []);

  useFocusEffect(useCallback(() => { syncLocation(); }, [syncLocation]));

  // Con ubicación: feed por proximidad (trae "distance" en metros, como en web).
  // Sin ubicación: feed simple por categoría, sin distancia.
  const load = useCallback(async () => {
    if (coords) {
      const maxDistance = await getAlertRadius();
      fetchNearbyAlerts({ ...coords, maxDistance, category });
    } else {
      fetchAlerts({ category });
    }
  }, [coords, category, fetchNearbyAlerts, fetchAlerts]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = async () => {
    setRefreshing(true);
    await syncLocation();
    await load();
    setRefreshing(false);
  };

  const renderItem = ({ item }) => {
    const risk = RISK_META[item.riskType?.toUpperCase()];
    return (
      <Pressable
        onPress={() => navigation.navigate('AlertDetail', { id: item._id, alert: item })}
      >
        <View style={styles.card}>
          <View style={styles.cardHead}>
            <Text style={styles.cardEmoji}>{categoryEmoji(item.category)}</Text>
            <Text style={styles.category}>{categoryLabel(item.category)}</Text>
            {risk ? (
              <Text style={[styles.risk, { color: risk.color }]}>{risk.label.toUpperCase()}</Text>
            ) : null}
          </View>
          <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
          {item.text ? <Text style={styles.text} numberOfLines={2}>{item.text}</Text> : null}
          {item.distance != null ? (
            <View style={styles.distanceRow}>
              <MaterialIcons name="place" size={13} color={COLORS.textMuted} />
              <Text style={styles.distanceText}>{formatRadius(item.distance)}</Text>
            </View>
          ) : null}
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.topPanel, { marginTop: SPACING.md + insets.top }]}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <Text style={styles.appTitle}>AlertaGT</Text>
              <View style={styles.locationBox}>
                <Text style={styles.locationBoxTitle}>Ubicación activa</Text>
                <Text style={styles.locationText}>{locationText}</Text>
              </View>
            </View>
            <Pressable style={styles.refreshButton} onPress={syncLocation}>
              <MaterialIcons name="refresh" size={20} color={COLORS.text} />
            </Pressable>
          </View>

          <View style={styles.filterLabelRow}>
            <MaterialIcons name="menu" size={18} color={COLORS.textLight} />
            <Text style={styles.filterText}>Filtrar por:</Text>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}
        >
          <FilterChip styles={styles} emoji="📋" label="Todas" active={!category} onPress={() => setCategory(null)} />
          {CATEGORIES.map((c) => (
            <FilterChip
              key={c.value}
              styles={styles}
              emoji={c.emoji}
              label={c.label}
              active={category === c.value}
              onPress={() => setCategory(c.value)}
            />
          ))}
        </ScrollView>
      </View>

      {loading && !refreshing ? (
        <LoadingSpinner message="Cargando alertas..." />
      ) : (
        <FlatList
          data={alerts}
          keyExtractor={(item) => String(item._id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
          ListHeaderComponent={
            alerts.length > 0 ? (
              <Text style={styles.count}>{alerts.length} alertas</Text>
            ) : null
          }
          ListEmptyComponent={
            <EmptyState
              icon="notifications-none"
              title="Sin alertas"
              message={error || 'No hay alertas para mostrar en esta categoría.'}
            />
          }
        />
      )}

      <Pressable style={styles.fab} onPress={() => navigation.navigate('CreateAlert')}>
        <MaterialIcons name="add" size={26} color={COLORS.surface} />
      </Pressable>
    </View>
  );
};

const FilterChip = ({ styles, emoji, label, active, onPress }) => (
  <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
    <Text style={styles.chipEmoji}>{emoji}</Text>
    <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
  </Pressable>
);

const createStyles = (COLORS) => StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  topPanel: {
    margin: SPACING.md,
    marginBottom: 0,
    backgroundColor: COLORS.headerSurface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    ...SHADOWS.card,
  },
  header: { padding: SPACING.md },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: SPACING.md },
  headerLeft: { flex: 1 },
  appTitle: { fontSize: FONT_SIZE.xxl, fontWeight: '800', color: COLORS.text, letterSpacing: -0.5 },
  locationBox: {
    marginTop: SPACING.sm,
    padding: SPACING.sm,
    borderRadius: 14,
    backgroundColor: COLORS.locationBg,
    borderWidth: 1,
    borderColor: COLORS.locationBorder,
  },
  locationBoxTitle: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: COLORS.locationTitle,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  locationText: { marginTop: 2, fontSize: FONT_SIZE.sm, color: COLORS.locationText },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceAlt,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(239, 68, 68, 0.25)',
  },
  filterText: { fontSize: FONT_SIZE.sm, fontWeight: '600', color: COLORS.textLight },
  filters: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, gap: SPACING.sm },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surfaceAlt,
    marginRight: SPACING.sm,
  },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipEmoji: { fontSize: FONT_SIZE.md },
  chipText: { color: COLORS.textLight, fontSize: FONT_SIZE.sm, fontWeight: '600' },
  chipTextActive: { color: '#ffffff' },
  count: {
    marginBottom: SPACING.sm,
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  list: { padding: SPACING.md, flexGrow: 1 },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.card,
  },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm },
  cardEmoji: { fontSize: FONT_SIZE.lg },
  category: { flex: 1, fontSize: FONT_SIZE.sm, fontWeight: '700', color: COLORS.text },
  risk: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: { fontSize: FONT_SIZE.md, fontWeight: '700', color: COLORS.text },
  text: { marginTop: SPACING.xs, fontSize: FONT_SIZE.sm, color: COLORS.textLight },
  distanceRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: SPACING.sm },
  distanceText: { fontSize: FONT_SIZE.xs, color: COLORS.textMuted, fontWeight: '600' },
  fab: {
    position: 'absolute',
    right: SPACING.lg,
    bottom: SPACING.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.elevated,
  },
});

export default AlertsListScreen;
