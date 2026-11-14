# Pruebas rápidas de la API (PowerShell / Windows)

Usa `curl.exe` (con .exe, para que PowerShell no lo confunda con otro comando).

```powershell
# Salud
curl.exe http://localhost:3000/api/health

# Crear/obtener usuario
curl.exe -X POST http://localhost:3000/api/users -H "Content-Type: application/json" -d "{\"name\":\"Isaias\"}"

# Crear nave (ajusta userId al que te devolvió el paso anterior)
curl.exe -X POST http://localhost:3000/api/ships -H "Content-Type: application/json" -d "{\"userId\":1,\"name\":\"Prueba\",\"missionId\":1,\"components\":[{\"componentId\":1,\"quantity\":1},{\"componentId\":5,\"quantity\":1}]}"

# Guardar resultado (usa el id de la nave devuelta)
curl.exe -X POST http://localhost:3000/api/results -H "Content-Type: application/json" -d "{\"userId\":1,\"missionId\":1,\"shipId\":4,\"score\":800,\"status\":\"completed\",\"fuelRemaining\":30,\"energyRemaining\":40,\"durationSeconds\":300,\"clientRef\":\"prueba-1\"}"

# Repetirlo → responde 200 con "duplicate": true (no se guarda doble)

# Datos inválidos → debe responder 400
curl.exe -X POST http://localhost:3000/api/results -H "Content-Type: application/json" -d "{\"userId\":1}"
```
Checklist (sección 14 del documento maestro): ✔ resultado se guarda · ✔ no se duplica · ✔ datos incompletos → 400 · ✔ apagar MySQL → 503 `DB_UNAVAILABLE`.
