// client-user/src/features/map/components/LeafletMapView.jsx
// Mapa nativo basado en Leaflet + tiles gratuitos de OpenStreetMap/CartoDB,
// renderizado dentro de un WebView — misma fuente de mapas que client-admin
// (web), que usa react-leaflet con esos mismos tiles. Evita por completo
// depender de una API key de Google Maps (react-native-maps en Android
// requiere una y, sin ella, el mapa se queda en negro).

import { forwardRef, useImperativeHandle, useMemo, useRef } from 'react';
import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

// Mismos tiles que client-admin (src/features/map/pages/MapPage.jsx) — gratuitos, sin API key.
const TILES = {
  light: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
  },
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
  },
};

const buildHtml = ({ center, markers, tiles, userMarker }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    html, body, #map { height: 100%; margin: 0; padding: 0; background: #0f141b; }
    .alert-pin { font-size: 24px; line-height: 1; text-align: center; filter: drop-shadow(0 1px 2px rgba(0,0,0,0.6)); }
    .user-dot { width: 14px; height: 14px; border-radius: 50%; background: #2563eb; border: 3px solid #fff; box-shadow: 0 0 0 4px rgba(37,99,235,0.3); }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    const map = L.map('map', { zoomControl: false, attributionControl: false })
      .setView([${center.latitude}, ${center.longitude}], 14);

    L.tileLayer('${tiles.url}', { attribution: '${tiles.attribution}', maxZoom: 19 }).addTo(map);

    let userLayer = null;
    let markersLayer = L.layerGroup().addTo(map);

    function setUserMarker(lat, lng) {
      if (userLayer) map.removeLayer(userLayer);
      const icon = L.divIcon({ className: '', html: '<div class="user-dot"></div>', iconSize: [14, 14] });
      userLayer = L.marker([lat, lng], { icon, zIndexOffset: 1000 }).addTo(map);
    }

    function setMarkers(items) {
      markersLayer.clearLayers();
      items.forEach((m) => {
        const icon = L.divIcon({ className: '', html: '<div class="alert-pin">' + m.emoji + '</div>', iconSize: [28, 28] });
        const marker = L.marker([m.latitude, m.longitude], { icon }).addTo(markersLayer);
        marker.on('click', () => {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'markerPress', id: m.id }));
        });
      });
    }

    function recenter(lat, lng) {
      map.flyTo([lat, lng], 15);
    }

    ${userMarker ? `setUserMarker(${userMarker.latitude}, ${userMarker.longitude});` : ''}
    setMarkers(${JSON.stringify(markers)});

    document.addEventListener('message', function (e) { handleNativeMessage(e.data); });
    window.addEventListener('message', function (e) { handleNativeMessage(e.data); });
    function handleNativeMessage(raw) {
      try {
        const msg = JSON.parse(raw);
        if (msg.type === 'recenter') recenter(msg.latitude, msg.longitude);
      } catch (e) {}
    }
  </script>
</body>
</html>
`;

export const LeafletMapView = forwardRef(({ style, region, markers, userLocation, isDark, onMarkerPress }, ref) => {
  const webviewRef = useRef(null);
  const tiles = isDark ? TILES.dark : TILES.light;

  const html = useMemo(
    () =>
      buildHtml({
        center: region,
        markers,
        tiles,
        userMarker: userLocation,
      }),
    // Solo reconstruimos el HTML cuando cambia el set de alertas o el tema.
    // region/userLocation se omiten a propósito: el centro inicial no debe
    // recargar el WebView en cada actualización de GPS — el recentrado se
    // maneja aparte vía postMessage (ver recenter()).
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [markers, tiles.url, userLocation?.latitude, userLocation?.longitude]
  );

  useImperativeHandle(ref, () => ({
    recenter: (latitude, longitude) => {
      webviewRef.current?.postMessage(JSON.stringify({ type: 'recenter', latitude, longitude }));
    },
  }));

  const handleMessage = (event) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.type === 'markerPress') onMarkerPress?.(msg.id);
    } catch {
      // ignorar mensajes no reconocidos
    }
  };

  return (
    <WebView
      ref={webviewRef}
      style={[styles.webview, style]}
      originWhitelist={['*']}
      source={{ html }}
      onMessage={handleMessage}
      javaScriptEnabled
      domStorageEnabled
    />
  );
});

LeafletMapView.displayName = 'LeafletMapView';

const styles = StyleSheet.create({
  webview: { flex: 1, backgroundColor: 'transparent' },
});

export default LeafletMapView;
