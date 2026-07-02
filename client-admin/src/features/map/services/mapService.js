const POSTS_API_BASE = (import.meta.env.VITE_POSTS_API_URL ?? 'http://localhost:3020/api/v1').replace(/\/+$/, '')

// Alertas cercanas a una coordenada (usa el endpoint de proximidad ya existente)
export const getNearbyAlerts = async ({ latitude, longitude, maxDistance = 10000 }) => {
  const url = `${POSTS_API_BASE}/posts/proximity/search?latitude=${latitude}&longitude=${longitude}&maxDistance=${maxDistance}`
  const res = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error('No se pudieron cargar las alertas del mapa')
  const data = await res.json()
  const list = Array.isArray(data) ? data : data.data || []
  // Normaliza y deja solo las que tienen coordenadas válidas para el mapa
  return list
    .map((a) => ({
      id: a._id,
      title: a.title,
      category: a.category,
      riskType: a.riskType,
      text: a.text,
      distance: a.distance ?? 0,
      latitude: a.location?.latitude,
      longitude: a.location?.longitude,
      address: a.location?.address,
    }))
    .filter((a) => a.latitude != null && a.longitude != null)
}
