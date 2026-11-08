# Admin Dashboard Template

A starting point for internal admin dashboards. Copy it, rename a few things, point it at
your backend, and start building screens. The shell, design system, data layer, and
sign-in flow are already done.

**Stack:** React 19 · TypeScript · Vite · React Router 7 · Redux Toolkit ·
react-hook-form · SCSS with light and dark themes.

## What you get

- **Sign-in flow:** sign in, forgot password, and reset password from an emailed link.
- **App shell:** a responsive sidebar that only shows what the admin's role allows, a
  light/dark switch that starts from the OS setting, and route guards that explain
  instead of showing a blank 403.
- **A reference feature:** `/admins` (search, sort, pagination, row menu, create and
  delete modals) and `/account` (edit name, change password, sign out). Copy these
  when you build a new screen.
- **A component kit:** buttons, fields, dropdowns, a date picker, tables, modals, side
  panels, toasts, and more, all with keyboard support and both themes.
- **A showcase:** every kit component and the design tokens, browsable without a
  backend. It shows up only in development and never ships in a production build.

## 1. Try it

```bash
npm install
npm run dev
```

Open http://localhost:5173. With no backend running, you land on the showcase. The
sidebar's **Auth screens**, **Components**, and **Foundations** sections show what the kit
looks like and how it behaves. Use the switch at the bottom of the sidebar to see both
themes.

## 2. Start a new project from it

### Copy the code

```bash
git clone --depth 1 <this-repo-url> my-admin
cd my-admin
rm -rf .git && git init
npm install
```

Then make these changes. Each one takes a minute.

| What | Where |
| --- | --- |
| Project name | `name` in `package.json` |
| Browser tab title | `<title>` in `index.html` |
| Logo (light and dark) | `public/images/logo-light.svg`, `public/images/logo-dark.svg` |
| Logo alt text | `common.logoAlt` in `src/i18n/en.json` |
| Favicons | `public/icons/` (`favicon.svg`, `favicon.ico`, the two PNGs, `apple-touch-icon.png`); bump `?v=` in `index.html` so browsers fetch the new ones |
| Sign-in background video | `public/videos/auth-background.mp4` |
| Storage keys (so two dashboards on one domain do not share a session) | `TOKEN_STORAGE_KEY` in `src/auth/constants.ts`, `THEME_STORAGE_KEY` in `src/lib/constants.ts` |
| Brand colours | `$theme-light` and `$theme-dark` in `src/styles/_variables.scss` (change both) |
| Docker image name and server paths | `docker-compose.yml`, `.gitlab-ci.yml` |

### Connect your backend

```bash
cp .env.example .env.local
```

Set `VITE_API_BASE_URL` in `.env.local` to your API, for example
`http://localhost:3000`. The backend needs:

- The auth and admin endpoints listed in `src/api/iam.ts` (`/auth/login`, `/auth/me`,
  `/auth/forgot-password`, `/auth/reset-password`, `/auth/reset-password/check`,
  `/auth/change-password`, `/admins`).
- A JWT whose payload has `sub`, `isSuperAdmin`, `permissions`, and `exp`.
- This app's origin in its CORS allow-list. When it is missing, the app says
  "Cannot reach the API", the same as when the backend is down. Check the browser
  console for a CORS error first.
- Password-reset emails that link to `<your-app-url>/reset-password?token=…`.

Sign in at http://localhost:5173/login. Signed-in admins land on their first screen as
usual. In development, the showcase sections stay at the bottom of the sidebar.

### Keep or remove the showcase

Keeping it costs nothing: production builds leave it out. Most teams keep it while
building, as a reference. To remove it, delete `src/presentation-data/` and its two
hook-ins, which are marked by `import.meta.env.DEV`:

- `src/App.tsx`: the `ShowcaseRoutes` constant, the route block that renders it, and
  their imports.
- `src/components/Sidebar.tsx`: `...presentationNavSections()` and its import.

Then run `npm run build` to confirm nothing else referenced it.

## 3. Build your first screen

[`CLAUDE.md`](CLAUDE.md) has the rules this codebase follows and a step-by-step guide
under **Adding a screen**. In short, for a new backend module:

1. **API:** add `src/api/<module>.ts` with one function per endpoint, and mirror the
   DTOs and enums in `src/api/types.ts`.
2. **State:** add thunks in `src/redux/actions/<module>.ts` and a slice in
   `src/redux/features/<module>.ts`, then register the slice in `src/redux/store.ts`.
3. **Page:** copy `src/pages/AdminsPage.tsx` as a starting point. Put text in
   `src/i18n/en.json` and numbers in `src/pages/constants.ts`.
4. **Route and nav:** add the route in `src/App.tsx` and the sidebar entry in
   `src/components/nav.ts`, with the same permission gate the backend uses.
5. **Check:** run `npm run build && npm run lint`, then try the screen against the
   backend.

Before writing a new component, check the showcase. The kit probably has it already.

## Commands

| Command | Does |
| --- | --- |
| `npm run dev` | Dev server on http://localhost:5173, with the showcase |
| `npm run build` | Type-checks (`tsc -b`) and builds to `dist/` |
| `npm run lint` | ESLint |
| `npm run preview` | Serves the production build locally |

There is no test suite. `build` and `lint` are the automated checks, and both must pass.

## Deploying

GitLab CI builds a Docker image on pushes to `develop` (deployed automatically) and
`master` (deployed by a manual job). It copies the `ENV_DEV` or `ENV_PROD` CI variable
to `.env` before building, because `VITE_API_BASE_URL` is baked in at build time.
Changing it means rebuilding, not restarting. nginx serves the build and sends every path
to `index.html` so client routes survive a reload.

Anything starting with `VITE_` ends up in the public bundle. Never put a secret there.

## Project layout

```
src/
  api/                 HTTP client and one file per backend module
  auth/                the session token and JWT decoding
  redux/               store, thunks (actions/), and slices (features/)
  components/          the shell and the component kit
  pages/               one file per screen
  hooks/               URL state, positioning, theme
  lib/                 formatting, dates, toasts, theme, and other helpers
  i18n/en.json         every user-facing string
  styles/              design tokens, mixins, one partial per component
  presentation-data/   the showcase (development only)
```

The rules behind this layout, and how the session, API calls, and URL state work at
runtime, are in [`CLAUDE.md`](CLAUDE.md). Read it before your first pull request.
