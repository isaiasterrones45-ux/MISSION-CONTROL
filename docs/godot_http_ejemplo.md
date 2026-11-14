# Ejemplos de HTTP en Godot 4 (para Andrew, Enrique y Adolfo)

Recomendación: crear un **Autoload** llamado `Api` (Proyecto → Configuración → Autoload) con este script
`scripts/api.gd`, y que todos lo reutilicen. Así la URL solo se cambia en un lugar.

```gdscript
extends Node

const BASE_URL := "http://localhost:3000/api"

# Llama a un endpoint. Devuelve un Dictionary: { ok, status, data }
func request_json(method: int, path: String, body: Variant = null) -> Dictionary:
	var http := HTTPRequest.new()
	add_child(http)
	var headers := ["Content-Type: application/json"]
	var payload := "" if body == null else JSON.stringify(body)
	var err := http.request(BASE_URL + path, headers, method, payload)
	if err != OK:
		http.queue_free()
		return { "ok": false, "status": 0, "data": { "error": { "message": "No se pudo iniciar la petición" } } }

	var res = await http.request_completed   # [result, code, headers, body]
	http.queue_free()
	if res[0] != HTTPRequest.RESULT_SUCCESS:
		return { "ok": false, "status": 0, "data": { "error": { "message": "No hay conexión con el servidor" } } }

	var parsed = JSON.parse_string((res[3] as PackedByteArray).get_string_from_utf8())
	return { "ok": res[1] >= 200 and res[1] < 300, "status": res[1], "data": parsed }
```

## Usos
```gdscript
# GET planetas
var r = await Api.request_json(HTTPClient.METHOD_GET, "/planets")
if r.ok:
	for p in r.data: print(p.id, " ", p.name)
else:
	print("Error: ", r.data.error.message)   # mostrar aviso en pantalla, NO cerrar el juego

# Crear/obtener jugador
var u = await Api.request_json(HTTPClient.METHOD_POST, "/users", { "name": "Piloto Demo" })

# Guardar nave
var ship = await Api.request_json(HTTPClient.METHOD_POST, "/ships", {
	"userId": 1, "name": "Mi nave", "missionId": 1,
	"components": [ { "componentId": 1, "quantity": 1 }, { "componentId": 5, "quantity": 1 } ]
})

# Enviar resultado (Adolfo)
var resultado = await Api.request_json(HTTPClient.METHOD_POST, "/results", {
	"userId": 1, "missionId": 1, "shipId": 4, "score": 850, "status": "completed",
	"fuelRemaining": 35, "energyRemaining": 42, "durationSeconds": 420,
	"clientRef": str(Time.get_unix_time_from_system()) + "-1"
})
```
> En el editor de Godot, `localhost` funciona si el backend corre en la misma PC. Para probar entre compañeros, usen la IP de la PC que corre el backend.
