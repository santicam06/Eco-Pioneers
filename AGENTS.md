# AGENTS.md

## Commands
- **Start server**: `npm start` (`node server.js`, defaults to port `8080` or `PORT`).
- **Build CSS (watch mode)**: `npm run tw:build`
- **Build CSS (one-off, non-blocking)**: `npx @tailwindcss/cli -i ./public/css/tailwind.css -o ./public/css/main.css`
- **Tests / Lint**: None configured (`npm test` is a placeholder that exits with `1`).

## Environment Requirements
Requires `.env` in the project root with:
- `PGHOST`, `PGDATABASE`, `PGUSER`, `PGPASSWORD` — PostgreSQL credentials (`modules/projects.js` connects on port `5432` with `ssl: { rejectUnauthorized: false }`).
- `SESSIONSECRET` — Secret for `client-sessions` cookie encryption in `server.js`.
- `PORT` (optional) — HTTP port (defaults to `8080`).

## Architecture & Non-Obvious Conventions
- **Startup & Schema Sync**: `server.js` only calls `app.listen()` after `projectData.initialize()` succeeds. `initialize()` runs `sequelize.sync({ alter: true })` against PostgreSQL on every boot.
- **Models (`modules/projects.js`)**: Defines `Sector`, `Project`, and `User` with `createdAt: false` and `updatedAt: false`. `Project.belongsTo(Sector, { foreignKey: 'sector_id' })`.
- **Static JSON Files Are Not Used at Runtime**: `data/projectData.json` and `data/sectorData.json` are legacy/seed reference files. All runtime reads and writes go through Sequelize in `modules/projects.js`.
- **Hardcoded Sector IDs in Views**: Sector `<select>` inputs in `views/addProject.ejs` and `views/editProject.ejs` hardcode IDs `1`–`5` (Land Sinks, Industry, Transportation, Electricity, Food, Agriculture, and Land Use) and navbar filter links query `/solutions/projects?sector=<name>` (matched via `Op.iLike` on `Sector.sector_name`).
- **HTTP Method Override**: HTML forms for updating and deleting projects use `POST` with query-string override (`?_method=PUT` and `?_method=DELETE`) handled by `method-override('_method')`.
- **Auth & Role Mismatch**:
  - `res.locals.session` exposes the `client-sessions` object to all EJS templates.
  - EJS templates (`views/projects.ejs`, `views/project.ejs`) show Add/Edit/Delete UI whenever `session.user` is truthy, but the server routes in `server.js` enforce both `ensureLogin` and `ensureAdmin` (`req.session.user.role === 'admin'`, returning HTTP `403` via `views/500.ejs` otherwise).
  - There is no signup route; `User` records (with `bcryptjs` password hashes) are provisioned in the database.
- **Styling Pipeline**: Uses Tailwind CSS v4 + DaisyUI v5 (`data-theme="luxury"`). Edit `public/css/tailwind.css` (which defines `.page-container` and `.standard-hero` utility classes) and recompile to `public/css/main.css`. Do not hand-edit `public/css/main.css`.
- **Gitignore Gotcha**: `public/images/*` is ignored in `.gitignore`. Use `git add -f` when intentionally committing static image assets.
