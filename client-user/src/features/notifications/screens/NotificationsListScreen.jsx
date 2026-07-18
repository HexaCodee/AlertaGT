// client-user/src/features/notifications/screens/NotificationsListScreen.jsx
// Historial de notificaciones — calca notifications.css (web): header rojo con
// contador de no leídas + "Marcar todas"/eliminar todas, tabs Todas/No leídas,
// tarjetas con ícono emoji+etiqueta, borde/punto de no leída y acciones inline.

import { useState, useCallback, useMemo } from 'react';
import { View, Text, FlatList, RefreshControl, Pressable, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useNotifications } from '../hooks/useNotifications.js';
import { EmptyState, LoadingSpinner } from '../../../shared/components/common/Common.jsx';
import { showConfirm } from '../../../shared/utils/alert.js';
import { useTheme } from '../../../shared/context/ThemeContext.jsx';
import { SPACING, FONT_SIZE, SHADOWS } from '../../../shared/constants/theme.js';

// Emoji por categoría de alerta (igual que CATEGORY_EMOJI en web).
const CATEGORY_EMOJI = {
  ACCIDENTE: { emoji: '🚗', label: 'Accidente' },
  TRAFICO: { emoji: '🚦', label: 'Tráfico' },
  PELIGRO: { emoji: '⚠️', label: 'Peligro' },
  OTROS: { emoji: '📣', label: 'Otros' },
};

// Emoji por tipo de notificación (igual que TYPE_META en web).
const TYPE_META = {
  NEW_ALERT: { emoji: '🔔', label: 'Nueva alerta' },
  NEARBY_ALERT_CRITICAL: { emoji: '🚨', label: 'Alerta crítica' },
  NEW_COMMENT: { emoji: '💬', label: 'Nuevo comentario' },
  MODERATION: { emoji: '🛡️', label: 'Moderación' },
  FLAGGED: { emoji: '🚩', label: 'Reportada' },
  SYSTEM: { emoji: '⚙️', label: 'Sistema' },
  LOCATION_SHARED: { emoji: '📍', label: 'Ubicación' },
  LOCATION_DISABLED: { emoji: '📵', label: 'Ubicación desactivada' },
};

const getNotifMeta = (notif) => {
  const isAlert = notif.type === 'NEW_ALERT' || notif.type === 'NEARBY_ALERT_CRITICAL';
  const category = notif.data?.category;
  if (isAlert && category && CATEGORY_EMOJI[category]) return CATEGORY_EMOJI[category];
  return TYPE_META[notif.type] || TYPE_META.SYSTEM;
};

const formatDistance = (meters) => {
  if (meters == null || Number.isNaN(Number(meters))) return null;
  const m = Math.round(Number(meters));
  return m < 1000 ? `a ${m} m` : `a ${(m / 1000).toFixed(1)} km`;
};

const formatDate = (iso) => {
  if (!iso) return '';
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (diff < 60) return 'Hace un momento';
  if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`;
  return new Date(iso).toLocaleDateString('es-GT', { day: 'numeric', month: 'short' });
};

export const NotificationsListScreen = ({ navigation }) => {
  const { colors: COLORS } = useTheme();
  const styles = useMemo(() => createStyles(COLORS), [COLORS]);
  const {
    notifications,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    removeNotification,
    markAllAsRead,
    removeAllNotifications,
  } = useNotifications();
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState('all');

  useFocusEffect(useCallback(() => { fetchNotifications(); }, [fetchNotifications]));

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  const open = (item) => {
    if (!item.read) markAsRead(item._id);
    navigation.navigate('NotificationDetail', { notification: item });
  };

  const confirmDeleteAll = () => {
    showConfirm('Eliminar todas', '¿Seguro que deseas eliminar todas tus notificaciones?', removeAllNotifications, 'Eliminar');
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  const displayed = tab === 'unread' ? notifications.filter((n) => !n.read) : notifications;

  const renderItem = ({ item }) => {
    const meta = getNotifMeta(item);
    const distance = formatDistance(item.data?.distance);
    return (
      <Pressable onPress={() => open(item)}>
        <View style={[styles.card, !item.read && styles.unread]}>
          <View style={styles.iconWrap}>
            <Text style={styles.iconEmoji}>{meta.emoji}</Text>
            <Text style={styles.iconLabel} numberOfLines={1}>{meta.label}</Text>
          </View>
          <View style={styles.body}>
            <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
            {item.body ? <Text style={styles.text} numberOfLines={2}>{item.body}</Text> : null}
            <View style={styles.metaRow}>
              <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
              {distance ? (
                <View style={styles.distancePill}>
                  <MaterialIcons name="place" size={11} color="#2563eb" />
                  <Text style={styles.distanceText}>{distance}</Text>
                </View>
              ) : null}
            </View>
            <View style={styles.actionsRow}>
              {!item.read ? (
                <Pressable onPress={() => markAsRead(item._id)}>
                  <Text style={styles.actionLink}>Marcar como leída</Text>
                </Pressable>
              ) : null}
              <Pressable onPress={() => removeNotification(item._id)}>
                <Text style={[styles.actionLink, styles.actionDelete]}>Eliminar</Text>
              </Pressable>
            </View>
          </View>
          {!item.read ? <View style={styles.unreadDot} /> : null}
        </View>
      </Pressable>
    );
  };

  if (loading && !refreshing && notifications.length === 0) {
    return (
      <View style={styles.container}>
        <NotifHeader styles={styles} unreadCount={0} onMarkAll={markAllAsRead} onDeleteAll={confirmDeleteAll} hasAny={false} onSettings={() => navigation.navigate('NotificationSettings')} />
        <LoadingSpinner message="Cargando notificaciones..." />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <NotifHeader
        styles={styles}
        unreadCount={unreadCount}
        onMarkAll={markAllAsRead}
        onDeleteAll={confirmDeleteAll}
        hasAny={notifications.length > 0}
        onSettings={() => navigation.navigate('NotificationSettings')}
      />

      <View style={styles.tabs}>
        <Pressable style={styles.tab} onPress={() => setTab('all')}>
          <Text style={[styles.tabText, tab === 'all' && styles.tabTextActive]}>
            Todas ({notifications.length})
          </Text>
          {tab === 'all' ? <View style={styles.tabIndicator} /> : null}
        </Pressable>
        <Pressable style={styles.tab} onPress={() => setTab('unread')}>
          <Text style={[styles.tabText, tab === 'unread' && styles.tabTextActive]}>
            No leídas ({unreadCount})
          </Text>
          {tab === 'unread' ? <View style={styles.tabIndicator} /> : null}
        </Pressable>
      </View>

      <FlatList
        data={displayed}
        keyExtractor={(item) => String(item._id)}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        ListEmptyComponent={
          <EmptyState
            icon="notifications-none"
            title="Sin notificaciones"
            message={error || (tab === 'unread' ? 'No tienes notificaciones sin leer.' : 'Cuando haya novedades cercanas te avisaremos aquí.')}
          />
        }
      />
    </View>
  );
};

const NotifHeader = ({ styles, unreadCount, onMarkAll, onDeleteAll, hasAny, onSettings }) => {
  // El rojo se extiende hasta arriba (como Instagram) en vez de dejar un hueco
  // del color de fondo entre el notch/reloj y el header.
  const insets = useSafeAreaInsets();
  return (
  <View style={[styles.header, { paddingTop: SPACING.md + insets.top }]}>
    <View style={styles.headerTop}>
      <View style={styles.titleBlock}>
        <Text style={styles.heading}>Notificaciones</Text>
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadBadgeText}>{unreadCount} sin leer</Text>
        </View>
      </View>
      <View style={styles.headerActions}>
        <Pressable style={styles.markAllBtn} onPress={onMarkAll} disabled={unreadCount === 0}>
          <Text style={styles.markAllText}>Marcar todas</Text>
        </Pressable>
        <Pressable style={styles.iconBtn} onPress={onDeleteAll} disabled={!hasAny} hitSlop={6}>
          <MaterialIcons name="delete-outline" size={18} color="#ffffff" />
        </Pressable>
        <Pressable style={styles.iconBtn} onPress={onSettings} hitSlop={6}>
          <MaterialIcons name="settings" size={18} color="#ffffff" />
        </Pressable>
      </View>
    </View>
  </View>
  );
};

const createStyles = (COLORS) => StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { backgroundColor: '#d30000', padding: SPACING.md },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  titleBlock: { flexDirection: 'row', alignItems: 'baseline', gap: SPACING.sm, flex: 1 },
  heading: { fontSize: FONT_SIZE.lg, fontWeight: '700', color: '#ffffff' },
  unreadBadge: { backgroundColor: 'rgba(255,255,255,0.25)', paddingHorizontal: SPACING.sm, paddingVertical: 2, borderRadius: 12 },
  unreadBadgeText: { color: '#ffffff', fontSize: FONT_SIZE.xs, fontWeight: '600' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  markAllBtn: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8, paddingHorizontal: SPACING.sm, paddingVertical: 6 },
  markAllText: { color: '#ffffff', fontSize: FONT_SIZE.xs, fontWeight: '600' },
  iconBtn: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 8, padding: 7 },

  tabs: { flexDirection: 'row', backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  tab: { flex: 1, alignItems: 'center', paddingVertical: SPACING.sm + 2 },
  tabText: { fontSize: FONT_SIZE.sm, fontWeight: '600', color: COLORS.textLight },
  tabTextActive: { color: COLORS.primary },
  tabIndicator: { position: 'absolute', bottom: -1, height: 3, width: '60%', backgroundColor: COLORS.primary, borderRadius: 2 },

  list: { padding: SPACING.md, flexGrow: 1, gap: SPACING.sm },
  card: {
    flexDirection: 'row',
    gap: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    position: 'relative',
    ...SHADOWS.card,
  },
  unread: { borderLeftWidth: 4, borderLeftColor: COLORS.primary },
  iconWrap: {
    width: 52,
    minHeight: 52,
    borderRadius: 10,
    backgroundColor: COLORS.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingHorizontal: 4,
    paddingVertical: 6,
  },
  iconEmoji: { fontSize: FONT_SIZE.lg },
  iconLabel: { fontSize: 9, fontWeight: '700', color: COLORS.textLight, textAlign: 'center' },
  body: { flex: 1, gap: 2 },
  title: { fontSize: FONT_SIZE.md, fontWeight: '700', color: COLORS.text },
  text: { fontSize: FONT_SIZE.sm, color: COLORS.textLight },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginTop: 4 },
  date: { fontSize: FONT_SIZE.xs, color: COLORS.textMuted },
  distancePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: 'rgba(37, 99, 235, 0.15)',
    paddingHorizontal: SPACING.xs,
    borderRadius: 999,
  },
  distanceText: { fontSize: 11, fontWeight: '600', color: '#60a5fa' },
  actionsRow: { flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.xs },
  actionLink: { fontSize: FONT_SIZE.xs, fontWeight: '600', color: COLORS.primary, textDecorationLine: 'underline' },
  actionDelete: { color: COLORS.textMuted },
  unreadDot: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
});

export default NotificationsListScreen;
