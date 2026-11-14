# Acuerdos del equipo — MISSION CONTROL

## Reglas de juego (valores iniciales, se pueden balancear)
- Presupuesto base por misión: Luna 100 · Marte 120 · Asteroides 110 (campo `baseBudget`).
- Masa máxima de la nave: **600** (se cambia con `MAX_MASS` en `.env`).
- Combustible y energía finales se reportan en escala **0–100**.
- Puntuación: entero **0–10000**.

## Contrato de datos
- Todo lo que viaja por la API está en `docs/api.md`. Cambiar un nombre = avisar a todos y actualizar ese archivo.
- IDs estables: Luna=1, Marte=2, Asteroides=3 (planetas y misiones). Usar IDs, no textos.

## Responsables de escenas (para evitar conflictos en Godot)
| Escena | Dueño |
|---|---|
| main_menu.tscn (+ instrucciones/créditos) | Joaquín |
| planet_selection.tscn | Andrew |
| ship_builder.tscn | Enrique |
| space_exploration.tscn + resultados | Adolfo |
| Angular completo | Jorge |
| backend/ y database/ | Isaías |

Solo UNA persona integra las escenas principales en `develop`.

## Ramas
`main` (estable) · `develop` (integración) · `feature/backend-api` (Isaías) · `feature/menu` (Joaquín) · `feature/planets` (Andrew) · `feature/ship-builder` (Enrique) · `feature/angular-dashboard` (Jorge) · `feature/gameplay` (Adolfo).

## Seguridad básica
- Nunca subir `.env`. Cada quien copia `.env.example` → `.env`.
- Godot y Angular NUNCA se conectan a MySQL: solo a la API.
