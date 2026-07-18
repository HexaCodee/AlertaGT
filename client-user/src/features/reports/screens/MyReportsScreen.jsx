// client-user/src/features/reports/screens/MyReportsScreen.jsx
// Mis reportes emitidos. La reputación (trustScore, estrellas, estado) se
// muestra en el perfil, igual que en la web — aquí solo el historial.

import { useEffect, useState, useCallback, useMemo } from 'react';
import { Text, FlatList, RefreshControl, Pressable, StyleSheet } from 'react-native';
import { useReports } from '../hooks/useReports.js';
import { Card, LoadingSpinner, EmptyState } from '../../../shared/components/common/Common.jsx';
import { useTheme } from '../../../shared/context/ThemeContext.jsx';
import { SPACING, FONT_SIZE } from '../../../shared/constants/theme.js';

export const MyReportsScreen = ({ navigation }) => {
  const { colors: COLORS } = useTheme();
  const styles = useMemo(() => createStyles(COLORS), [COLORS]);
  const { myReports, loading, error, fetchMyReports } = useReports();
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(() => { fetchMyReports(); }, [fetchMyReports]);

  useEffect(() => { load(); }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  if (loading && !refreshing && myReports.length === 0) {
    return <LoadingSpinner message="Cargando tus reportes..." />;
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={myReports}
      keyExtractor={(item) => String(item._id)}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      renderItem={({ item }) => (
        <Pressable onPress={() => navigation.navigate('ReportDetail', { report: item })}>
          <Card>
            <Text style={styles.reportReason}>{item.reason}</Text>
            {item.comment ? <Text style={styles.reportComment}>{item.comment}</Text> : null}
            <Text style={styles.reportStatus}>Estado: {item.status}</Text>
          </Card>
        </Pressable>
      )}
      ListEmptyComponent={
        <EmptyState
          icon="flag"
          title="Sin reportes"
          message={error || 'Aún no has reportado ninguna alerta.'}
        />
      }
    />
  );
};

const createStyles = (COLORS) => StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.md, flexGrow: 1 },
  reportReason: { fontSize: FONT_SIZE.md, fontWeight: '700', color: COLORS.text },
  reportComment: { marginTop: SPACING.xs, fontSize: FONT_SIZE.sm, color: COLORS.textLight },
  reportStatus: { marginTop: SPACING.sm, fontSize: FONT_SIZE.xs, color: COLORS.textLight },
});

export default MyReportsScreen;
