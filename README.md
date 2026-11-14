# 🚀 MISSION CONTROL: SPACE SIMULATOR

Videojuego 2D de exploración y estrategia espacial. **Godot 4** (juego) · **Angular** (web) · **Node.js + Express** (API) · **MySQL** (datos).

```
Godot ──HTTP──▶ Express API ──▶ MySQL
Angular ─HTTP─▶ Express API ──▶ MySQL
```
Godot y Angular **nunca** hablan directo con MySQL.

## Estructura
```
game-godot/   Proyecto Godot 4
web-angular/  Plataforma web Angular
backend/      API Node.js + Express
database/     schema.sql y seed.sql
docs/         api.md (contrato), acuerdos.md, godot_http_ejemplo.md
```

## Levantar el backend (Windows)
Requisitos: [Node.js LTS](https://nodejs.org), [MySQL 8](https://dev.mysql.com/downloads/installer/) encendido, Git.

```bash
cd backend
npm install
copy .env.example .env        # luego abre .env y pon tu contraseña de MySQL (DB_PASSWORD)
npm run db:init               # crea la base mission_control + datos de prueba
npm run dev                   # servidor en http://localhost:3000
```
Comprueba: abre <http://localhost:3000/api/health> → `{"status":"ok","database":"connected"}`

> ⚠️ `npm run db:init` **borra y recrea** las tablas. Úsalo solo para reiniciar la base.

## Probar endpoints rápido
- <http://localhost:3000/api/planets>
- <http://localhost:3000/api/missions>
- <http://localhost:3000/api/components>
- <http://localhost:3000/api/statistics>
- <http://localhost:3000/api/ranking>

Documentación completa de cada endpoint: [`docs/api.md`](docs/api.md).

## Variables de entorno (`backend/.env`)
| Variable | Descripción | Default |
|---|---|---|
| PORT | Puerto del API | 3000 |
| DB_HOST / DB_PORT | Servidor MySQL | localhost / 3306 |
| DB_USER / DB_PASSWORD | Credenciales MySQL | root / (vacío) |
| DB_NAME | Nombre de la base | mission_control |
| CORS_ORIGIN | Origen(es) de Angular | http://localhost:4200 |
| MAX_MASS | Masa máxima de nave | 600 |
| MAX_SCORE | Puntuación máxima aceptada | 10000 |

## Flujo de trabajo con Git
Ver `docs/acuerdos.md`. Resumen: cada quien trabaja en su rama `feature/...`, se integra a `develop` por Pull Request, y `main` solo recibe versiones estables. **Nunca subir `.env`.**
