// client-user/src/features/legal/components/LegalLayout.jsx
// Layout compartido por Términos de Servicio y Política de Privacidad.
// Calca la estructura de LegalLayout.jsx (web): header con botón de regreso,
// tarjeta con título + fecha de actualización, secciones, y nota de contacto
// con enlace cruzado al otro documento legal.

import { useMemo } from 'react';
import { View, Text, ScrollView, Pressable, Linking, StyleSheet } from 'react-native';
import { ScreenHeader } from '../../../shared/components/common/ScreenHeader.jsx';
import { Card } from '../../../shared/components/common/Common.jsx';
import { useTheme } from '../../../shared/context/ThemeContext.jsx';
import { SPACING, FONT_SIZE } from '../../../shared/constants/theme.js';

const CONTACT_EMAIL = 'official.hexacodee@gmail.com';

export const LegalLayout = ({ navigation, title, updatedAt, intro, sections, crossLinkLabel, onCrossLink }) => {
  const { colors: COLORS } = useTheme();
  const styles = useMemo(() => createStyles(COLORS), [COLORS]);

  return (
    <View style={styles.container}>
      <ScreenHeader title={title} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <Card>
          <Text style={styles.docTitle}>{title}</Text>
          <Text style={styles.updated}>Última actualización: {updatedAt}</Text>

          <Text style={styles.paragraph}>{intro}</Text>

          {sections.map((section) => (
            <View key={section.title} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              {section.blocks.map((block, i) =>
                typeof block === 'string' ? (
                  <Text key={i} style={styles.paragraph}>{block}</Text>
                ) : (
                  <View key={i} style={styles.list}>
                    {block.items.map((item, j) => (
                      <View key={j} style={styles.listItemRow}>
                        <Text style={styles.bullet}>{'•'}</Text>
                        <Text style={styles.listItemText}>{item}</Text>
                      </View>
                    ))}
                  </View>
                )
              )}
            </View>
          ))}

          <View style={styles.footerNote}>
            <Text style={styles.paragraph}>
              ¿Tienes preguntas?{' '}
              <Text style={styles.link} onPress={() => Linking.openURL(`mailto:${CONTACT_EMAIL}`)}>
                {CONTACT_EMAIL}
              </Text>
            </Text>
            {onCrossLink ? (
              <Pressable onPress={onCrossLink}>
                <Text style={[styles.paragraph, styles.link]}>{crossLinkLabel}</Text>
              </Pressable>
            ) : null}
          </View>
        </Card>
      </ScrollView>
    </View>
  );
};

const createStyles = (COLORS) => StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.md, paddingBottom: SPACING.xxl },
  docTitle: { fontSize: FONT_SIZE.xl, fontWeight: '800', color: COLORS.text },
  updated: { marginTop: SPACING.xs, marginBottom: SPACING.md, fontSize: FONT_SIZE.xs, color: COLORS.textMuted },
  section: { marginTop: SPACING.md },
  sectionTitle: { fontSize: FONT_SIZE.md, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.xs },
  paragraph: { fontSize: FONT_SIZE.sm, color: COLORS.textLight, lineHeight: 21, marginTop: SPACING.xs },
  list: { marginTop: SPACING.xs },
  listItemRow: { flexDirection: 'row', gap: SPACING.xs, marginTop: SPACING.xs },
  bullet: { fontSize: FONT_SIZE.sm, color: COLORS.primary },
  listItemText: { flex: 1, fontSize: FONT_SIZE.sm, color: COLORS.textLight, lineHeight: 21 },
  footerNote: {
    marginTop: SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: SPACING.xs,
  },
  link: { color: COLORS.primary, fontWeight: '600' },
});

export default LegalLayout;
