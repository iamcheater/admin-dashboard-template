# Admin Dashboard Template

A starting point for an internal admin dashboard. React 19 + TypeScript + Vite,
Redux Toolkit, SCSS design tokens with light and dark themes.

It ships with:

- Sign in, forgot password, and reset password screens
- An authenticated shell: sidebar, responsive layout, permission-aware navigation
- A placeholder `/dashboard` screen
- `/admins`: a full reference screen (search, sort, pagination, row menu, modals)
- `/account`: profile name and password change
- A showcase (auth screen previews, buttons, inputs) that `/` opens when signed out —
  no backend needed

## Setup

```bash
npm install
cp .env.example .env.local   # point VITE_API_BASE_URL at your backend
npm run dev                  # http://localhost:5173
```

The backend must expose the auth and admin endpoints in `src/api/iam.ts` and issue a
JWT whose payload carries `sub`, `isSuperAdmin`, `permissions`, and `exp`. This
app's origin must be in the backend's CORS allow-list.

## Before your first commit

- Replace the logos in `public/images/`, the favicons in `public/icons/`, and the
  sign-in background in `public/videos/`.
- Rename `TOKEN_STORAGE_KEY` in `src/auth/constants.ts` to something unique to the project.
- Set `common.logoAlt` in `src/i18n/en.json` and the `<title>` in `index.html`.
- Set the image name and paths in `docker-compose.yml` and `.gitlab-ci.yml`.
- Remove the component showcase: delete `src/presentation-data/` and its three hook-ins in `App.tsx`, `components/Sidebar.tsx`, and `styles/main.scss`.

## Conventions

See [`CLAUDE.md`](CLAUDE.md) for the architecture rules, the runtime flows, and the
steps for adding a screen.
