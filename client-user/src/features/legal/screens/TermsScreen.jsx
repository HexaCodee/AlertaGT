// client-user/src/features/legal/screens/TermsScreen.jsx
// Términos de Servicio — misma información legal que TermsOfServicePage.jsx (web).

import { LegalLayout } from '../components/LegalLayout.jsx';
import { TERMS_UPDATED_AT, TERMS_INTRO, TERMS_SECTIONS } from '../content/termsContent.js';

export const TermsScreen = ({ navigation }) => (
  <LegalLayout
    navigation={navigation}
    title="Términos de Servicio"
    updatedAt={TERMS_UPDATED_AT}
    intro={TERMS_INTRO}
    sections={TERMS_SECTIONS}
    crossLinkLabel="Consulta también nuestra Política de Privacidad"
    onCrossLink={() => navigation.navigate('Privacy')}
  />
);

export default TermsScreen;
