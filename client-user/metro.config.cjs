// client-user/metro.config.cjs
// Config de Metro en CommonJS (.cjs) porque el paquete usa ESM ("type": "module")
// y Metro carga su config con require(); un .js sería interpretado como ESM y fallaría.
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// En web, algunas dependencias exponen una build ESM con import.meta que Metro
// no puede ejecutar como bundle clásico. Forzamos la condición react-native para
// que web también resuelva la variante compatible.
config.resolver.unstable_conditionNames = ['require', 'react-native', 'default'];

module.exports = config;
