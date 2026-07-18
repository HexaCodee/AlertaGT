// client-user/src/features/reports/screens/ReportDetailScreen.jsx
// Detalle de un reporte propio + veredicto de la alerta asociada.

import { useEffect, useState, useCallback, useMemo } from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { useReports } from '../hooks/useReports.js';
import { Card, LoadingSpinner } from '../../../shared/components/common/Common.jsx';
import { useTheme } from '../../../shared/context/ThemeContext.jsx';
import { SPACING, FONT_SIZE } from '../../../shared/constants/theme.js';

const VERDICT_LABEL = {
  ACTIVE: 'Sin reportes relevantes',
  FLAGGED: 'Con reportes de la comunidad',
  CONFIRMED_FALSE: 'Confirmada como falsa',
};

export const ReportDetailScreen = ({ route }) => {
  const { colors: COLORS } = useTheme();
  const styles = useMemo(() => createStyles(COLORS), [COLORS]);
  const { report } = route.params || {};
  const { fetchAlertVerdict } = useReports();
  const [verdict, setVerdict] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    if (report?.postId) {
      setVerdict(await fetchAlertVerdict(report.postId));
    }
    setLoading(false);
  }, [fetchAlertVerdict, report]);

  useEffect(() => { load(); }, [load]);

  if (!report) return <LoadingSpinner message="Cargando reporte..." />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card>
        <Text style={styles.label}>Motivo</Text>
        <Text style={styles.value}>{report.reason}</Text>
        {report.comment ? (
          <>
            <Text style={styles.label}>Comentario</Text>
            <Text style={styles.value}>{report.comment}</Text>
          </>
        ) : null}
        <Text style={styles.label}>Estado del reporte</Text>
        <Text style={styles.value}>{report.status}</Text>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Veredicto de la alerta</Text>
        {loading ? (
          <LoadingSpinner message="Cargando veredicto..." style={styles.spinner} />
        ) : verdict ? (
          <>
            <Text style={styles.value}>{VERDICT_LABEL[verdict.verdict] || verdict.verdict}</Text>
            <Text style={styles.meta}>Reportes totales: {verdict.reportsCount ?? 0}</Text>
            <Text style={styles.meta}>Reportes de info falsa: {verdict.falseReportsCount ?? 0}</Text>
          </>
        ) : (
          <Text style={styles.meta}>No se pudo cargar el veredicto de la alerta.</Text>
        )}
      </Card>
    </ScrollView>
  );
};

const createStyles = (COLORS) => StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.md },
  label: { marginTop: SPACING.sm, fontSize: FONT_SIZE.xs, fontWeight: '700', color: COLORS.textLight, textTransform: 'uppercase' },
  value: { fontSize: FONT_SIZE.md, color: COLORS.text },
  sectionTitle: { fontSize: FONT_SIZE.md, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm },
  meta: { marginTop: SPACING.xs, fontSize: FONT_SIZE.sm, color: COLORS.textLight },
  spinner: { flex: 0, paddingVertical: SPACING.md },
});

export default ReportDetailScreen;
