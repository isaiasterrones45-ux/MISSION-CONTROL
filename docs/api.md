# Contrato de la API — MISSION CONTROL

Base URL (desarrollo): `http://localhost:3000/api` · Formato: JSON · Campos en **camelCase en inglés**.
**Estos nombres NO se cambian sin avisar a todo el equipo.**

## Formato de error (siempre igual)
```json
{ "error": { "code": "VALIDATION_ERROR", "message": "Datos del resultado inválidos o incompletos.", "details": ["score debe ser un entero entre 0 y 10000."] } }
```
| HTTP | Cuándo |
|---|---|
| 200 | Consulta correcta (o resultado duplicado ya guardado) |
| 201 | Registro creado |
| 400 | Datos incompletos o inválidos |
| 404 | Recurso no encontrado |
| 409 | Registro duplicado |
| 503 | MySQL no disponible |
| 500 | Error inesperado |

Códigos `error.code` útiles: `VALIDATION_ERROR`, `MASS_LIMIT_EXCEEDED`, `BUDGET_EXCEEDED`, `COMPONENT_NOT_FOUND`, `USER_NOT_FOUND`, `MISSION_NOT_FOUND`, `SHIP_NOT_FOUND`, `SHIP_NOT_OWNED`, `DB_UNAVAILABLE`.

## IDs estables (los trae seed.sql)
| Planeta / Misión | id |
|---|---|
| Luna | 1 |
| Marte | 2 |
| Asteroides | 3 |

Tipos de componente: `motor`, `tanque`, `instrumento`, `energia`, `comunicacion`.
Estados de resultado: `completed`, `failed`, `aborted`.

---
## GET /api/health
`{ "status": "ok", "database": "connected" }` — para que Godot/Angular comprueben conexión.

## GET /api/planets  (Godot, Angular)
```json
[{ "id": 1, "name": "Luna", "description": "...", "difficulty": 1 }]
```

## GET /api/missions  (Godot, Angular)
Solo activas (usa `?all=true` para todas).
```json
[{ "id": 1, "planetId": 1, "planetName": "Luna", "title": "Reconocimiento lunar",
   "objective": "...", "baseBudget": 100, "difficulty": 1, "active": true }]
```

## GET /api/components  (Godot)
Filtro opcional: `?type=motor`
```json
[{ "id": 1, "name": "Motor Químico Básico", "type": "motor", "description": "...",
   "mass": 100, "cost": 20, "energyUse": 0, "fuelCapacity": 0, "thrust": 30, "energyOutput": 0 }]
```

## POST /api/users  (Godot)
Sin contraseña (MVP): devuelve el jugador si existe (200) o lo crea (201).
```json
// request
{ "name": "Piloto Demo" }
// response
{ "id": 1, "name": "Piloto Demo", "createdAt": "2026-11-13T20:00:00.000Z" }
```

## GET /api/users  (Angular, opcional)
```json
[{ "id": 1, "name": "Piloto Demo", "createdAt": "...", "missionsPlayed": 2, "missionsCompleted": 2, "bestScore": 850 }]
```

## POST /api/ships  (Godot)
El servidor **calcula** masa y costo con el catálogo; no confía en los que mande el cliente.
`missionId` es opcional: si se manda, valida contra el presupuesto de esa misión.
```json
// request
{ "userId": 1, "name": "Explorador I", "missionId": 1,
  "components": [ { "componentId": 1, "quantity": 1 }, { "componentId": 5, "quantity": 1 } ] }
// response 201
{ "id": 4, "userId": 1, "name": "Explorador I", "totalMass": 180, "totalCost": 34,
  "fuelCapacity": 60, "energyUse": 0, "energyOutput": 0, "maxMass": 600,
  "components": [ { "componentId": 1, "quantity": 1 }, { "componentId": 5, "quantity": 1 } ] }
```
Errores: 400 `MASS_LIMIT_EXCEEDED`, 400 `BUDGET_EXCEEDED`, 400 `COMPONENT_NOT_FOUND`, 404 `USER_NOT_FOUND`.

## POST /api/results  (Godot)
```json
// request
{ "userId": 1, "missionId": 2, "shipId": 5, "score": 850, "status": "completed",
  "fuelRemaining": 35, "energyRemaining": 42, "durationSeconds": 420,
  "clientRef": "9f1c2a6e-partida-0001" }
```
- `clientRef` (opcional, recomendado): un texto único por partida. Si Godot reintenta el envío, la API **no guarda doble**: responde 200 con `"duplicate": true`.
- `fuelRemaining` y `energyRemaining`: números de 0 a 100. `score`: entero 0–10000.
- La nave (`shipId`) debe pertenecer al `userId`.
```json
// response 201
{ "id": 6, "userId": 1, "userName": "Piloto Demo", "missionId": 2, "missionTitle": "Exploración marciana",
  "planetId": 2, "planetName": "Marte", "shipId": 5, "shipName": "Explorador I",
  "score": 850, "status": "completed", "fuelRemaining": 35, "energyRemaining": 42,
  "durationSeconds": 420, "date": "2026-11-13T20:10:00.000Z", "duplicate": false }
```
> Mejora futura: que el servidor calcule la puntuación a partir de eventos en vez de confiar en `score`.

## GET /api/results  (Angular)
Historial general, más reciente primero. `?limit=20&offset=0` (limit máx. 100). Devuelve un arreglo de objetos como el de arriba (sin `duplicate`).

## GET /api/results/:userId  (Angular)
Historial de un jugador. Mismos parámetros `limit` / `offset`.

## GET /api/results/detail/:id  (Angular — "Detalle de misión")
Igual que un resultado, más la nave usada:
```json
{ "id": 1, "...": "...", "ship": { "id": 1, "name": "Explorador I", "totalMass": 230, "totalCost": 62,
   "components": [ { "componentId": 1, "name": "Motor Químico Básico", "type": "motor", "quantity": 1, "mass": 100, "cost": 20 } ] } }
```

## GET /api/statistics  (Angular — Dashboard)
```json
{ "totalMissions": 5, "completedMissions": 4, "failedMissions": 1, "abortedMissions": 0,
  "successRate": 80, "averageScore": 664, "bestScore": 910, "totalPlayers": 3,
  "byPlanet": [ { "planetId": 1, "planetName": "Luna", "missions": 3, "completed": 3, "averageScore": 827 } ],
  "recentActivity": [ { "id": 5, "userName": "Comandante Orión", "planetName": "Luna", "score": 910, "status": "completed", "date": "..." } ] }
```
Con la base vacía devuelve ceros y arreglos vacíos (el dashboard no debe romperse).

## GET /api/ranking  (Angular)
`?limit=10` (máx. 50)
```json
[{ "position": 1, "userId": 3, "userName": "Comandante Orión", "totalScore": 1210, "bestScore": 910, "missionsPlayed": 2, "missionsCompleted": 1 }]
```
