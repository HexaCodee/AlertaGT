// client-user/src/navigation/AuthStack.jsx
// Stack de autenticación: Login y Register (sin header).

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '../features/auth/screens/LoginScreen.jsx';
import { RegisterScreen } from '../features/auth/screens/RegisterScreen.jsx';
import { TermsScreen } from '../features/legal/screens/TermsScreen.jsx';
import { PrivacyScreen } from '../features/legal/screens/PrivacyScreen.jsx';

const Stack = createNativeStackNavigator();

export const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="Terms" component={TermsScreen} />
    <Stack.Screen name="Privacy" component={PrivacyScreen} />
  </Stack.Navigator>
);

export default AuthStack;
