// client-user/babel.config.cjs
// En CommonJS (.cjs) por la misma razón que metro.config.cjs: el paquete usa
// ESM ("type": "module") y Babel/Metro cargan esta config con require().
//
// unstable_transformImportMeta: sin esta opción, babel-preset-expo deja
// `import.meta` intacto en el bundle web (en vez de reemplazarlo por
// globalThis.__ExpoImportMetaRegistry), y el navegador lo rechaza con
// "Cannot use 'import.meta' outside a module" porque el bundle se carga como
// script clásico, no como <script type="module">.
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { unstable_transformImportMeta: true }],
    ],
  };
};
