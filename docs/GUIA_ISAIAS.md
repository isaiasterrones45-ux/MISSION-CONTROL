# Guía paso a paso para Isaías (llegas y solo sigues esto)

Ya está hecho: estructura del repo, backend completo, schema.sql, seed.sql, documentación de API.
Te falta solo **instalar, probar y subir a GitHub** para que los demás arranquen.

## 1. Instalar (si no lo tienes)
- Node.js LTS · Git · MySQL 8 (MySQL Installer) · Godot 4 (solo para abrirlo/crearlo)
- Verifica en PowerShell: `node -v`, `git --version`, y que el servicio MySQL esté iniciado.

## 2. Poner el proyecto en tu PC
Descomprime `MISSION-CONTROL.zip` (por ejemplo en `C:\proyectos\MISSION-CONTROL`).

## 3. Levantar el backend
```powershell
cd C:\proyectos\MISSION-CONTROL\backend
npm install
copy .env.example .env
notepad .env          # pon tu DB_PASSWORD de MySQL y guarda
npm run db:init
npm run dev
```
Abre http://localhost:3000/api/health → debe decir `connected`.
Luego prueba /api/planets, /api/components y /api/statistics en el navegador.

**Si algo falla:**
| Mensaje | Causa probable |
|---|---|
| `ER_ACCESS_DENIED_ERROR` | Contraseña de MySQL mal en `.env` |
| `ECONNREFUSED` | MySQL apagado (Servicios de Windows → MySQL80 → Iniciar) |
| `Cannot find module` | Falta `npm install` dentro de `backend/` |
| CHECK no se aplica / error de sintaxis | MySQL muy viejo; se necesita 8.0.16+ |

## 4. Subir a GitHub
1. Crea en github.com un repositorio vacío `MISSION-CONTROL` e invita a los 5 compañeros (Settings → Collaborators).
2. En PowerShell, dentro de la carpeta `MISSION-CONTROL`:
```powershell
git init
git add .
git commit -m "Estructura inicial, backend, base de datos y documentacion"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/MISSION-CONTROL.git
git push -u origin main
git checkout -b develop
git push -u origin develop
git checkout -b feature/backend-api
```
3. Verifica en GitHub que **NO** aparezca `.env` ni `node_modules` (el `.gitignore` ya los excluye).

## 5. Avisar al equipo (mensaje sugerido)
> Repo listo: <URL>. Clonen y cambien a develop. Lean `README.md` y `docs/api.md` (el contrato de datos). Backend: `cd backend`, `npm install`, copiar `.env.example` a `.env`, `npm run db:init`, `npm run dev`. Planetas/misiones: Luna=1, Marte=2, Asteroides=3. Cada quien en su rama `feature/...`. Godot: usen `docs/godot_http_ejemplo.md`.

## 6. Crear el proyecto Godot (5 min)
Abre Godot 4 → Nuevo proyecto → ruta `MISSION-CONTROL\game-godot` → Renderer "Compatibility" → Crear.
Haz commit de `project.godot` y súbelo a `develop` para que todos trabajen sobre el MISMO proyecto.
(Si prefieres, pide a Joaquín que lo cree él.)

## 7. Lo que sigue
Cuando llegues dime en qué punto vas y seguimos: revisar pull requests, probar endpoints de cada quien, integración Godot ↔ API ↔ Angular.
