// client-user/src/features/legal/screens/PrivacyScreen.jsx
// Política de Privacidad — misma información legal que PrivacyPolicyPage.jsx (web).

import { LegalLayout } from '../components/LegalLayout.jsx';
import { PRIVACY_UPDATED_AT, PRIVACY_INTRO, PRIVACY_SECTIONS } from '../content/privacyContent.js';

export const PrivacyScreen = ({ navigation }) => (
  <LegalLayout
    navigation={navigation}
    title="Política de Privacidad"
    updatedAt={PRIVACY_UPDATED_AT}
    intro={PRIVACY_INTRO}
    sections={PRIVACY_SECTIONS}
    crossLinkLabel="Consulta también nuestros Términos de Servicio"
    onCrossLink={() => navigation.navigate('Terms')}
  />
);

export default PrivacyScreen;
