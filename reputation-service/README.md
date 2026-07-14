# AlertaGT — Reputation Service

Microservicio de **reputación, reportes de alertas falsas y calificaciones de usuarios** para AlertaGT.

Responsabilidad única: la *confianza de la comunidad*. No maneja identidad (eso es `auth-service`)
ni contenido (eso es `posts-service`); consume esos servicios cuando los necesita.

- **Puerto:** `3023`
- **Base de datos:** `AlertaGT_Reputation`
- **Stack:** Node.js (ESM) + Express 5 + Mongoose, mismo patrón que `posts-service` / `notifications-service`.

## ¿Qué resuelve?

1. **Reportes de alertas falsas** — cualquier usuario puede reportar una alerta (un reporte por
   usuario y alerta). Al acumular suficientes reportes de "información falsa", la alerta se marca
   como `CONFIRMED_FALSE` automáticamente y su **autor recibe una penalización**.
2. **Calificaciones tipo Uber** — los usuarios se califican con estrellas (1-5), opcionalmente en el
   contexto de una alerta.
3. **Reputación agregada** — cada usuario tiene `trustScore` (0-100), promedio de estrellas, número
   de alertas falsas y un estado `ACTIVE` / `WARNED` / `SUSPENDED` con penalizaciones acumulables.

## Reglas de penalización

Configurables por variables de entorno (ver `configs/reputation.rules.js` y `.env-example`):

| Regla | Valor por defecto | Descripción |
|-------|------------------|-------------|
| `FALSE_REPORT_THRESHOLD` | 5 | Reportes de "información falsa" para confirmar una alerta como falsa |
| `PENALTY_PER_FALSE_ALERT` | 20 | Puntos de penalización al autor por cada alerta falsa |
| `WARN_THRESHOLD` | 40 | Puntos a partir de los cuales el usuario queda en aviso (`WARNED`) |
| `SUSPEND_THRESHOLD` | 100 | Puntos a partir de los cuales el usuario queda suspendido |
| `SUSPENSION_DAYS` | 15 | Duración de la suspensión temporal |
| `DEFAULT_TRUST_SCORE` | 70 | Confianza inicial de un usuario sin historial |

`trustScore = clamp(70 + (promedioEstrellas − 3) × 10 − puntosPenalización, 0, 100)`

### La penalización NO es permanente: se recupera

La reputación se puede volver a ganar por tres vías (todas configurables):

| Regla | Valor por defecto | Descripción |
|-------|------------------|-------------|
| `PENALTY_DECAY_DAYS` / `PENALTY_DECAY_POINTS` | 30 días / 5 pts | Buena conducta en el tiempo: sin nuevas penalizaciones, se descuentan puntos cada ciclo |
| `RECOVERY_MIN_RATING` / `RECOVERY_PER_POSITIVE_RATING` | 4★ / 2 pts | Cada calificación positiva de la comunidad reduce la penalización |
| `RECOVERY_PER_COMMUNITY_HELP` | 3 pts | Puntos recuperados por hito de "comunidad ayudada" (endpoint `/reward`) |

El decaimiento se aplica de forma perezosa (al leer/recalcular la reputación). Cualquier nueva
penalización reinicia el reloj de buena conducta.

## Endpoints principales

### Reportes (`/api/v1/reports`)
| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| POST | `/` | usuario | Reportar una alerta (`postId`, `reason`, `comment`) |
| GET | `/mine` | usuario | Mis reportes emitidos |
| GET | `/alert/:postId` | público | Veredicto agregado de una alerta |
| GET | `/` | admin/mod | Listado de reportes (paginado, filtro por `status`) |
| PATCH | `/:id/resolve` | admin/mod | Resolver reporte (`UPHELD` / `DISMISSED`) |

### Calificaciones (`/api/v1/ratings`)
| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| POST | `/` | usuario | Calificar a un usuario (`targetUserId`, `score`, `comment`, `postId?`) |
| GET | `/user/:userId` | público | Calificaciones recibidas (paginado) |
| GET | `/user/:userId/summary` | público | Promedio + distribución de estrellas |

### Reputación (`/api/v1/reputation`)
| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| GET | `/:userId` | público | Reputación pública del usuario |
| GET | `/:userId/can-publish` | público/servicio | ¿Puede publicar? (para `posts-service`) |
| POST | `/:userId/recompute` | admin/mod | Recalcular reputación |
| POST | `/:userId/penalize` | admin/mod | Penalización manual |
| POST | `/:userId/reward` | servicio/admin | Recuperación por comunidad ayudada |
| GET | `/leaderboard/top` | admin/mod | Ranking por confianza |

Documentación interactiva Swagger en `http://localhost:3023/api-docs`.

## Desarrollo local

```bash
pnpm install
cp .env-example .env   # y ajustar valores
pnpm run create-indexes
pnpm dev
```

## Integraciones

- ✅ **`posts-service` → gate de publicación:** implementado en
  `posts-service/middlewares/validate-can-publish.js`. Antes de crear un post, consulta
  `GET /reputation/:userId/can-publish` y rechaza con `403 ACCOUNT_SUSPENDED` si `allowed === false`.
  Diseño *fail-open*: si el reputation-service no responde, no bloquea la publicación.

### Pendientes (siguientes pasos, fuera de esta entrega)

- **Ocultar alertas confirmadas como falsas** en el feed de `posts-service` (consultar el veredicto
  o despublicar la alerta al confirmarse falsa).
- **Frontend (`client-admin`):** modal de "reportar alerta" con motivo, estrellas de calificación y
  badge de reputación/estado en el perfil y en el detalle de alerta.
- **Comunidad ayudada → `/reward`:** disparar la recuperación por hitos de contribución desde
  `posts-service` (p. ej. al alcanzar N comentarios/vistas recibidas).
