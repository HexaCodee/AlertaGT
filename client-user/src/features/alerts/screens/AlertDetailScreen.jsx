// client-user/src/features/alerts/screens/AlertDetailScreen.jsx
// Detalle de alerta — calca la estructura de alert-detail.css (web): header
// rojo con menú ⋮ (reportar/eliminar), tarjeta principal (hero, badges,
// título, meta, autor) y tarjeta de comentarios.

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  Pressable,
  TextInput,
  StyleSheet,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useAlerts } from '../hooks/useAlerts.js';
import { useReports } from '../../reports/hooks/useReports.js';
import { useProfile } from '../../profile/hooks/useProfile.js';
import { StarRating } from '../../reports/components/StarRating.jsx';
import { REPORT_REASONS, categoryLabel, categoryEmoji, RISK_META } from '../constants.js';
import { LoadingSpinner } from '../../../shared/components/common/Common.jsx';
import { ScreenHeader } from '../../../shared/components/common/ScreenHeader.jsx';
import { useAuthStore } from '../../../shared/store/authStore.js';
import { showAlert, showConfirm } from '../../../shared/utils/alert.js';
import { useTheme } from '../../../shared/context/ThemeContext.jsx';
import { SPACING, FONT_SIZE, SHADOWS } from '../../../shared/constants/theme.js';

const initials = (name) => (name || '?').trim().charAt(0).toUpperCase();

const formatDate = (iso) => {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('es-GT', { day: 'numeric', month: 'long', year: 'numeric' });
};

const formatCommentDate = (iso) => {
  if (!iso) return '';
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (diff < 60) return 'Hace un momento';
  if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`;
  return new Date(iso).toLocaleDateString('es-GT', { day: 'numeric', month: 'short' });
};

// Distancia en metros entre dos puntos GPS (Haversine) — igual que en web (AlertDetailPage).
const haversineMeters = (lat1, lng1, lat2, lng2) => {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const formatDistance = (meters) => {
  if (meters == null || Number.isNaN(Number(meters))) return null;
  const m = Math.round(Number(meters));
  return m < 1000 ? `${m} m` : `${(m / 1000).toFixed(1)} km`;
};

export const AlertDetailScreen = ({ route, navigation }) => {
  const { colors: COLORS } = useTheme();
  const styles = useMemo(() => createStyles(COLORS), [COLORS]);
  const { id, alert: initialAlert } = route.params || {};
  const currentUserId = useAuthStore((state) => state.user?.id);

  const { fetchAlertDetail, addComment, deleteAlert, loading } = useAlerts();
  const { reportAlert, rateUser } = useReports();
  const { getPublicProfile } = useProfile();

  const [alert, setAlert] = useState(initialAlert || null);
  const [distance, setDistance] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [myRating, setMyRating] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showReasons, setShowReasons] = useState(false);
  const [actionMsg, setActionMsg] = useState('');

  // Nombres reales de autores (userId -> nombre), resueltos vía auth-service
  // (Profile/{userId}/public), igual que en la web.
  const [authorNames, setAuthorNames] = useState({});
  const fetchedAuthorsRef = useRef(new Set());

  const load = useCallback(async () => {
    const result = await fetchAlertDetail(id);
    if (result) {
      setAlert(result.alert);
      setComments(result.comments);
    }
  }, [fetchAlertDetail, id]);

  useEffect(() => { load(); }, [load]);

  // Distancia entre mi ubicación GPS actual y la alerta, igual que en la web.
  useEffect(() => {
    const lat = alert?.location?.latitude;
    const lng = alert?.location?.longitude;
    if (lat == null || lng == null) return;

    let cancelled = false;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      try {
        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.BestForNavigation });
        if (!cancelled) {
          setDistance(haversineMeters(pos.coords.latitude, pos.coords.longitude, lat, lng));
        }
      } catch {
        // Sin GPS disponible: simplemente no mostramos distancia.
      }
    })();

    return () => { cancelled = true; };
  }, [alert?.location?.latitude, alert?.location?.longitude]);

  const isAuthor = alert?.authorId && alert.authorId === currentUserId;

  const resolveAuthorName = useCallback(
    (authorId) => {
      if (!authorId) return 'Miembro de la comunidad';
      if (authorId === currentUserId) return 'Tú';
      return authorNames[authorId] || 'Miembro de la comunidad';
    },
    [currentUserId, authorNames]
  );

  // Resuelve el nombre real del autor de la alerta y de cada comentarista.
  // Usa un ref para no repetir peticiones ya hechas/en curso.
  useEffect(() => {
    const ids = new Set();
    if (alert?.authorId) ids.add(alert.authorId);
    comments.forEach((c) => c.authorId && ids.add(c.authorId));

    const toFetch = [...ids].filter(
      (authorId) => authorId !== currentUserId && !fetchedAuthorsRef.current.has(authorId)
    );
    if (toFetch.length === 0) return;

    toFetch.forEach((authorId) => fetchedAuthorsRef.current.add(authorId));

    Promise.all(
      toFetch.map((authorId) =>
        getPublicProfile(authorId).then((p) => {
          const fullName = `${p?.name ?? ''} ${p?.surname ?? ''}`.trim();
          return [authorId, fullName || p?.username || null];
        })
      )
    ).then((pairs) => {
      setAuthorNames((prev) => {
        const next = { ...prev };
        pairs.forEach(([authorId, name]) => { if (name) next[authorId] = name; });
        return next;
      });
    });
  }, [alert?.authorId, comments, currentUserId, getPublicProfile]);

  const handleComment = async () => {
    const text = newComment.trim();
    if (!text) return;
    const created = await addComment(id, text);
    if (created) {
      setComments((prev) => [created, ...prev]);
      setNewComment('');
    }
  };

  const openReport = () => {
    setMenuOpen(false);
    setShowReasons(true);
  };

  const handleReport = async (reason) => {
    setShowReasons(false);
    const result = await reportAlert({ postId: id, reason });
    setActionMsg(
      result.success
        ? 'Reporte enviado. Gracias por ayudar a mantener la comunidad segura.'
        : result.message || 'No se pudo reportar la alerta'
    );
  };

  const handleRate = async (score) => {
    setMyRating(score);
    const result = await rateUser({ targetUserId: alert.authorId, score, postId: id });
    if (!result.success) {
      setMyRating(0);
      showAlert('No se pudo calificar', result.message);
    }
  };

  const handleDelete = () => {
    setMenuOpen(false);
    showConfirm('Eliminar alerta', '¿Seguro que deseas eliminar esta alerta?', async () => {
      const result = await deleteAlert(id);
      if (result.success) navigation.goBack();
      else showAlert('Error', result.message);
    }, 'Eliminar');
  };

  if (!alert) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Detalle de alerta" onBack={() => navigation.goBack()} />
        <LoadingSpinner message="Cargando alerta..." />
      </View>
    );
  }

  const imageUrl = alert.image && typeof alert.image === 'object' ? alert.image.url : alert.image;
  const address = alert.location && typeof alert.location === 'object'
    ? alert.location.address || 'Ubicación registrada'
    : alert.location || 'Sin ubicación';
  const risk = RISK_META[alert.riskType?.toUpperCase()];
  const authorName = resolveAuthorName(alert.authorId);

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Detalle de alerta"
        onBack={() => navigation.goBack()}
        right={
          <Pressable onPress={() => setMenuOpen((v) => !v)} hitSlop={8}>
            <MaterialIcons name="more-vert" size={22} color="#ffffff" />
          </Pressable>
        }
      />

      {menuOpen ? (
        <View style={styles.menu}>
          <Pressable style={styles.menuItem} onPress={openReport}>
            <Text style={styles.menuItemText}>Reportar alerta</Text>
          </Pressable>
          {isAuthor ? (
            <Pressable style={styles.menuItem} onPress={handleDelete}>
              <Text style={[styles.menuItemText, styles.menuItemDanger]}>Eliminar alerta</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.mainCard}>
          <View style={styles.hero}>
            {imageUrl ? (
              <Image source={{ uri: imageUrl }} style={styles.heroImage} />
            ) : (
              <Text style={styles.heroEmoji}>{categoryEmoji(alert.category)}</Text>
            )}
          </View>

          <View style={styles.body}>
            <View style={styles.badgesRow}>
              <View style={styles.catEmojiBox}>
                <Text style={styles.catEmoji}>{categoryEmoji(alert.category)}</Text>
              </View>
              <View>
                {risk ? (
                  <View style={[styles.riskBadge, { backgroundColor: risk.color }]}>
                    <Text style={styles.riskBadgeText}>{risk.label.toUpperCase()}</Text>
                  </View>
                ) : null}
                <Text style={styles.catLabel}>{categoryLabel(alert.category)}</Text>
              </View>
            </View>

            <Text style={styles.title}>{alert.title}</Text>
            {alert.text ? <Text style={styles.desc}>{alert.text}</Text> : null}

            <View style={styles.metaRow}>
              <MaterialIcons name="place" size={17} color={COLORS.textMuted} />
              <Text style={styles.meta}>
                {address}
                {formatDistance(distance) ? ` · ${formatDistance(distance)}` : ''}
              </Text>
            </View>
            <View style={styles.metaRow}>
              <MaterialIcons name="event" size={17} color={COLORS.textMuted} />
              <Text style={styles.meta}>{formatDate(alert.createdAt)}</Text>
            </View>

            <View style={styles.authorRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials(authorName)}</Text>
              </View>
              <View>
                <Text style={styles.authorLabel}>Publicado por</Text>
                <Text style={styles.authorName}>{authorName}</Text>
              </View>
            </View>
          </View>
        </View>

        {actionMsg ? <Text style={styles.actionMsg}>{actionMsg}</Text> : null}

        {!isAuthor && (
          <View style={styles.rateBox}>
            <Text style={styles.rateTitle}>Califica al autor de esta alerta</Text>
            <StarRating value={myRating} onRate={handleRate} size={28} />
          </View>
        )}

        {showReasons && (
          <View style={styles.reasonsCard}>
            <Text style={styles.sectionTitle}>Motivo del reporte</Text>
            {REPORT_REASONS.map((r) => (
              <Pressable key={r.value} style={styles.reason} onPress={() => handleReport(r.value)}>
                <MaterialIcons name="flag" size={18} color={COLORS.primary} />
                <Text style={styles.reasonText}>{r.label}</Text>
              </Pressable>
            ))}
            <Pressable onPress={() => setShowReasons(false)}>
              <Text style={styles.cancelLink}>Cancelar</Text>
            </Pressable>
          </View>
        )}

        <View style={styles.commentsCard}>
          <View style={styles.commentsTitleRow}>
            <MaterialIcons name="chat-bubble-outline" size={20} color={COLORS.primary} />
            <Text style={styles.commentsTitle}>Comentarios ({comments.length})</Text>
          </View>

          <View style={styles.commentForm}>
            <TextInput
              style={styles.commentInput}
              placeholder="Añade un comentario..."
              placeholderTextColor={COLORS.textMuted}
              value={newComment}
              onChangeText={setNewComment}
              multiline
            />
            <Pressable style={styles.sendBtn} onPress={handleComment}>
              <MaterialIcons name="send" size={18} color="#ffffff" />
              <Text style={styles.sendBtnText}>Publicar</Text>
            </Pressable>
          </View>

          {comments.length === 0 ? (
            <Text style={styles.empty}>Sé el primero en comentar.</Text>
          ) : (
            comments.map((c) => {
              const name = resolveAuthorName(c.authorId);
              return (
                <View key={c._id} style={styles.comment}>
                  <View style={styles.avatarSm}>
                    <Text style={styles.avatarSmText}>{initials(name)}</Text>
                  </View>
                  <View style={styles.commentBody}>
                    <View style={styles.commentHead}>
                      <Text style={styles.commentAuthor}>{name}</Text>
                      <Text style={styles.commentDate}>{formatCommentDate(c.createdAt)}</Text>
                    </View>
                    <Text style={styles.commentText}>{c.text}</Text>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const createStyles = (COLORS) => StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  content: { padding: SPACING.md, paddingBottom: SPACING.xxl },
  menu: {
    position: 'absolute',
    top: 56,
    right: SPACING.md,
    zIndex: 50,
    minWidth: 180,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    ...SHADOWS.elevated,
  },
  menuItem: { paddingVertical: SPACING.sm + 2, paddingHorizontal: SPACING.md },
  menuItemText: { fontSize: FONT_SIZE.sm, color: COLORS.text },
  menuItemDanger: { color: COLORS.error },

  mainCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  hero: {
    width: '100%',
    height: 180,
    backgroundColor: COLORS.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroImage: { width: '100%', height: '100%' },
  heroEmoji: { fontSize: 56 },
  body: { padding: SPACING.md },
  badgesRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm },
  catEmojiBox: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catEmoji: { fontSize: FONT_SIZE.xl },
  riskBadge: { alignSelf: 'flex-start', paddingHorizontal: SPACING.sm, paddingVertical: 2, borderRadius: 999 },
  riskBadgeText: { fontSize: FONT_SIZE.xs, fontWeight: '700', color: '#ffffff', letterSpacing: 0.4 },
  catLabel: { marginTop: 2, fontSize: FONT_SIZE.sm, color: COLORS.textLight, fontWeight: '500' },
  title: { fontSize: FONT_SIZE.lg, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.xs },
  desc: { fontSize: FONT_SIZE.md, color: COLORS.textLight, lineHeight: 22, marginBottom: SPACING.md },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, marginBottom: SPACING.xs },
  meta: { fontSize: FONT_SIZE.sm, color: COLORS.textLight },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#ffffff', fontWeight: '700', fontSize: FONT_SIZE.md },
  authorLabel: { fontSize: FONT_SIZE.xs, color: COLORS.textMuted },
  authorName: { fontSize: FONT_SIZE.sm, fontWeight: '600', color: COLORS.text },

  actionMsg: {
    marginTop: SPACING.md,
    padding: SPACING.sm,
    backgroundColor: 'rgba(22, 163, 74, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(22, 163, 74, 0.35)',
    borderRadius: 12,
    color: COLORS.success,
    fontSize: FONT_SIZE.sm,
  },

  rateBox: {
    marginTop: SPACING.md,
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.sm,
  },
  rateTitle: { fontSize: FONT_SIZE.sm, fontWeight: '600', color: COLORS.textLight },

  reasonsCard: {
    marginTop: SPACING.md,
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: { fontSize: FONT_SIZE.md, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm },
  reason: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  reasonText: { fontSize: FONT_SIZE.sm, color: COLORS.text },
  cancelLink: { marginTop: SPACING.sm, fontSize: FONT_SIZE.sm, color: COLORS.textLight, textAlign: 'center' },

  commentsCard: {
    marginTop: SPACING.md,
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  commentsTitleRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, marginBottom: SPACING.md },
  commentsTitle: { fontSize: FONT_SIZE.md, fontWeight: '700', color: COLORS.text },
  commentForm: { gap: SPACING.sm, marginBottom: SPACING.md },
  commentInput: {
    minHeight: 52,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    color: COLORS.text,
    backgroundColor: COLORS.surfaceAlt,
  },
  sendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm + 2,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
  },
  sendBtnText: { color: '#ffffff', fontWeight: '700', fontSize: FONT_SIZE.sm },
  empty: { fontSize: FONT_SIZE.sm, color: COLORS.textMuted, textAlign: 'center', paddingVertical: SPACING.sm },
  comment: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingVertical: SPACING.sm + 2,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  avatarSm: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarSmText: { color: COLORS.text, fontWeight: '700', fontSize: FONT_SIZE.xs },
  commentBody: { flex: 1 },
  commentHead: { flexDirection: 'row', justifyContent: 'space-between', gap: SPACING.sm },
  commentAuthor: { fontSize: FONT_SIZE.sm, fontWeight: '600', color: COLORS.text },
  commentDate: { fontSize: FONT_SIZE.xs, color: COLORS.textMuted },
  commentText: { marginTop: 2, fontSize: FONT_SIZE.sm, color: COLORS.textLight, lineHeight: 20 },
});

export default AlertDetailScreen;
