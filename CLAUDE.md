# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

These rules are what keeps a dashboard that talks to many backend modules from turning
into a pile of components that each know a little bit of the API. Violating one is a
blocking review finding. When the code and this file disagree, fix whichever is wrong in
the same change — never leave them out of step.

---

## What this is

A starting point for an internal admin dashboard. It ships the shell (sidebar, layout,
guards), the design system (SCSS tokens, mixins, primitives), the data layer (API client,
Redux Toolkit), and one complete feature — admin identity and access — as the reference
implementation every new screen copies.

| Route                     | Gate             | Page                 |
| ------------------------- | ---------------- | -------------------- |
| `/login`                  | public           | `LoginPage`          |
| `/forgot-password`        | public           | `ForgotPasswordPage` |
| `/reset-password?token=…` | public           | `ResetPasswordPage`  |
| `/dashboard`              | signed in        | `DashboardPage`      |
| `/admins`                 | super admin only | `AdminsPage`         |
| `/account`                | signed in        | `AccountPage`        |

`/` is `LandingRedirect`: it sends the admin to the first `NAV_SECTIONS` entry their token
grants, so nav order decides the landing screen. An admin with no matching entry gets a
message, not a redirect loop. Any unknown path inside the shell redirects to `/`.

`/reset-password` is reached from a link the backend emails
(`${baseUrl}/reset-password?token=…`), so its route must stay public and its path and
`RESET_TOKEN_SEARCH_PARAM` must match the URL the backend builds — changing either breaks
every link already in an inbox.

## Stack

React 19 · TypeScript · Vite · `react-router-dom` 7 · `react-hook-form` · `react-toastify` ·
Redux Toolkit (`@reduxjs/toolkit`, `react-redux`) · SCSS (`sass`).

No RTK Query, no `createEntityAdapter`, no `createSelector`, no selectors file — selectors
are inline arrows (`state => state.authReducer.user`). Do not add Zustand, TanStack Query,
a component library, or a CSS framework without saying why in the PR — "it's what I'm
used to" is not a reason. The tokens and mixins in `src/styles/` are the design system.

## Commands

```bash
npm run dev       # Vite dev server on http://localhost:5173
npm run build     # tsc -b && vite build — this is the typecheck
npm run lint      # eslint .
npm run preview   # serve the built bundle
```

There is **no test suite and no test runner**. `npm run build` and `npm run lint` are the
only automated checks, and both must pass before work is declared done. A lint pass alone
proves nothing — the type errors live in `tsc -b`. For behaviour, run the app against a
backend (or a stub that returns the same status codes) and exercise the flow you changed.

## Running against a backend

The app expects the IAM endpoints in `src/api/iam.ts` (`/auth/login`, `/auth/me`,
`/auth/forgot-password`, `/auth/reset-password`, `/auth/reset-password/check`,
`/auth/change-password`, `/admins`) and a JWT whose payload carries `sub`,
`isSuperAdmin`, `permissions`, and `exp`.

Configuration follows the shared env convention. `.env.example` is committed and lists
every key; `.env.local`, `.env.develop`, and `.env.prod` always exist, are copied from
it, and are gitignored (`.gitignore` ignores `.env*` except `.env.example`). Vite loads
only `.env.local` automatically. `.env.develop` and `.env.prod` are reference files: their
values are what gets entered into Vercel. A new key goes into `.env.example` and all three
files in the same change.

| Variable                      | Used for                                                  |
| ----------------------------- | --------------------------------------------------------- |
| `VITE_API_BASE_URL`           | REST base                                                 |
| `VITE_DEFAULT_ADMIN_LANGUAGE` | UI language (`en` or `hy`) until the admin picks one; `en` if unset or unknown |

It falls back to `http://localhost:3000` (`api/constants.ts`), so a missing `.env.local`
fails silently against the default rather than loudly. Anything `VITE_`-prefixed is
inlined into the bundle at **build** time and is therefore public — never put a secret
there, and changing it means rebuilding, not restarting.

This origin must be in the backend's CORS allow-list. When it is not, the browser blocks
the request before it is sent and the app reports "Cannot reach the API" — the same
message as a backend that is down. Check the console for the CORS error first.

## Deploy

Vercel builds and hosts the app from the Git repository: `main` is production, `develop`
and every other branch get preview deployments. Vercel runs `npm run build` and serves
`dist/`. Env values live in the Vercel project, not in the repo: `.env.prod` values go
into the Production environment and `.env.develop` values into Preview (scoped to the
`develop` branch). They are read at **build** time, so changing one in Vercel means
redeploying.

`vercel.json` rewrites every path to `/index.html`, which is what makes client routes
survive a reload. Vercel serves real files from `dist/` before applying the rewrite, so
assets are unaffected.

GitHub Actions (`.github/workflows/ci.yml`) runs `npm ci`, `npm run lint`, and
`npm run build` on every pull request and on pushes to `main` and `develop`. It checks;
Vercel deploys.

When starting a new project from this template, work through **Start a new project from
it** in `README.md` (logos, favicons, `TOKEN_STORAGE_KEY`, `THEME_STORAGE_KEY`,
`ADMIN_LANGUAGE_STORAGE_KEY`, `<title>`, the env files).

---

## The rules

### 1. All HTTP goes through `src/api/client.ts`

`request()` is the only place `fetch` is called. It owns the bearer token, the error
shape, and 401 handling. Anything that calls `fetch` itself bypasses all three.

`request()` options:

| Option             | Meaning                                                                 |
| ------------------ | ----------------------------------------------------------------------- |
| `method`, `body`   | `body` is JSON-encoded; omit it for `GET`                                |
| `signal`           | pass `thunkAPI.signal` through so a superseded request is really aborted |
| `anonymous`        | send no token; a 401 is an ordinary error (login, password reset)         |
| `verifiesPassword` | the endpoint answers a wrong password with 401; do **not** end the session |

A 401 on any other authenticated request means the session is over: `request()` clears
the token and throws an `ApiError` with `endsSession: true`. That flag — not the status —
is what the rest of the app reacts to. When you add an endpoint that re-checks a password
and replies 401 on a mismatch, it must pass `verifiesPassword: true`, or a typo signs the
admin out.

### 2. One `src/api/` module per backend module; nothing else builds a URL

Each file in `src/api/` mirrors one backend module (`iam.ts` today). Thunks import a
named function from it; nothing outside `src/api/` ever sees a path, a method, or a query
string. When the backend adds a route, it gets a function in the matching file.

Query objects are typed interfaces (`AdminsQuery`) built with `toQueryString`, which
drops `undefined` and `""`. Request bodies are named interfaces (`InviteAdminBody`) that
the thunk reuses as its argument type.

### 3. `src/api/types.ts` and `src/api/constants.ts` mirror the backend by hand

The repos deploy independently, so there is no shared package and no generated client.
**When a backend DTO, enum, or validator changes, change its mirror here in the same PR.**
What is mirrored:

- DTOs (`AdminUserDto`, `PaginatedDto<T>`, …) in `types.ts`
- enums as `as const` arrays or objects plus a derived type: `PERMISSIONS`/`Permission`,
  `ADMIN_ROLES`/`AdminRole`, `ADMINS_SORT_BY`/`AdminsSortBy`
- validator limits in `FIELD_LIMITS` (`fullNameMax`, `searchMax`, `passwordMin`,
  `passwordMax`) — use them for `maxLength` and client-side checks

All of them shape the UI only. The backend stays the authority. Enum labels are views onto
`text.domain` (`ADMIN_ROLE_LABELS`, `PERMISSION_LABELS`), so the copy stays in the dictionaries.

### 4. Permission checks here are UX, never security

The sidebar hides what the token does not grant, and the guards explain a screen the admin
cannot open. Both exist so an admin gets a clear message instead of a bare 403. Neither is
a control — the backend's guards are. Never write a check whose failure mode is "the user
could see something they shouldn't"; if hiding it is all that stands between a user and
the data, the endpoint is wrong and that is a backend change.

Permissions come from the **JWT claims**, not from `GET /auth/me`: the backend freezes
them into the token at login. Read them through `grants(claims, permission)` only.
`isSuperAdmin` bypasses every permission, on both sides.

Gate a screen the way its backend controller is gated — check the controller, do not
guess:

| Backend guard                       | Route wrapper                       | Nav entry                    |
| ----------------------------------- | ----------------------------------- | ---------------------------- |
| `@RequirePermissions(X)`            | `<RequirePermission permission={X}>` | `permission: X`              |
| `SuperAdminGuard`                   | `<RequireSuperAdmin>`               | `superAdminOnly: true`       |
| JWT only                            | none (inside `RequireAuth`)         | neither                      |

The route and the nav entry must name the same gate. When they disagree, the sidebar
offers a link to a screen that refuses to open. A page behind a guard does not re-check
the same gate inside itself — that branch can never run.

### 5. No business logic in components

A page composes: it dispatches thunks, reads state, holds form state, and renders. Every
other concern already has a home:

| It is…                                         | It goes in            |
| ---------------------------------------------- | --------------------- |
| endpoint shape, request payload, DTO, enum     | `src/api/`            |
| an API call                                    | `src/redux/actions/`  |
| state shape, loading flags                     | `src/redux/features/` |
| dates, passwords, toasts, formatting, labels   | `src/lib/`            |
| the token, JWT decode, `grants()`              | `src/auth/`           |
| URL-param state, positioning, debounce         | `src/hooks/`          |
| anything reused and visual                     | `src/components/`     |

A page **never imports a request function** from `src/api/` — that is the thunk's job.
It may import types, enum objects, label maps, and `FIELD_LIMITS` from `api/types.ts` and
`api/constants.ts`.

If a page grows a helper another page would want, it moves before it is copied
(`formatAdminRole` in `lib/format.ts` is shared by `Sidebar` and `AccountPage` for this
reason).

### 6. Every user-facing string comes from `src/i18n/`; every literal number from a `constants.ts`

**No text in a component.** Headings, labels, hints, placeholders, buttons, `aria-label`,
`title`, empty states, confirm prompts, errors, status labels — all live in the
dictionaries and are read through `text` from `src/i18n`. A quoted sentence in a `.tsx`
file is a blocking finding.

**Two dictionaries, one shape.** The admin UI ships in English (`en.json`) and Armenian
(`hy.json`). **Every key goes into both files in the same change**, with a real
translation — never a copy of the English. `i18n/index.ts` types the pair so the build
fails when either file has a key the other lacks; it cannot see a missing `{placeholder}`
or a wrong array length (12 months, 7 weekdays), so check those by eye. Armenian copy
stays short: pick the shortest natural word, use Armenian punctuation (`։`, `՞`, `«»`),
and never attach a case ending to an interpolated value (`Ջնջվեց՝ {name}։`, not
`{name}-ը ջնջվեց։`), because the right ending depends on the name.

Keys mirror the tree: `common` for what appears on more than one screen; `api`, `auth`,
`nav`, `guards`, `validation`, `password`, `table`, `pagination`, `pageActions`,
`datePicker`, `theme`, `language` for the layers that own them; `format` for date
patterns and month and weekday names; `domain` for enum label maps; and one object per
screen named after the page. English copy is sentence case ("Change password", not
"Change Password"), and the app says "sign in" / "sign out", never "log in" / "log out".
Delete a key from both files when the last reader goes.

Interpolation is `format(template, values)` with `{name}` placeholders — never string
concatenation and never a template literal around a JSON value. A sentence that wraps an
element (`<code>`, `<strong>`) splits into `…Lead` / `…Tail` keys around it, and each
language orders its own words around the element. No markup and no `\n` in the JSON.

**Dates go through `lib/format.ts`, never `Intl` or `toLocale…`.** Chrome ships without
Armenian locale data, so `Intl.DateTimeFormat("hy")` prints English month names. Date
words and orders live in each dictionary's `format` object (`months`, `monthsShort`,
`weekdaysShort` Sunday-first, and patterns like `dayMonthYear`), and the per-language
first day of the week and 12/24-hour clock are `LANGUAGE_CONVENTIONS` in
`lib/constants.ts`.

**Language** is owned by `lib/language.ts`, outside React like the theme. It is fixed for
the page's lifetime: `ACTIVE_LANGUAGE` is read once at startup from
`ADMIN_LANGUAGE_STORAGE_KEY`, then `VITE_DEFAULT_ADMIN_LANGUAGE`, then `en`, and `text` is
a plain module export of that dictionary. The sidebar's `LanguageToggle` saves the choice
and reloads the page — that is why no component needs to re-render on a language change.
`startLanguage()` in `main.tsx` sets `<html lang>`. Adding a language means a dictionary,
an `ADMIN_LANGUAGE` entry, its `LANGUAGE_CONVENTIONS`, a toggle option, and a font that
covers its script (`$font-sans` and the Google Fonts link in `index.html`; DM Sans has no
Armenian, so Noto Sans Armenian is loaded after it).

**No literal number.** Anything other than `0`, `1`, or an array index is a named export in
the `constants.ts` of the directory that owns it:

| File                      | Holds                                                         |
| ------------------------- | ------------------------------------------------------------- |
| `api/constants.ts`        | `HTTP_STATUS`, `FIELD_LIMITS`, default base URL                |
| `auth/constants.ts`       | storage key, token segment index                              |
| `lib/constants.ts`        | `PATHNAMES`, URL param names, time units, toast durations, regexes, sort order |
| `components/constants.ts` | icon geometry, asset paths, gaps, keyboard keys, modal sizes   |
| `pages/constants.ts`      | page sizes, default sorts, column widths, dialog names         |

Closed sets of string values (`ADMIN_DIALOG`, `MODAL_SIZE`, `AUTH_BACKGROUND_TYPE`) are
`as const` objects with a derived union type, and props and state use that type — never a
bare `string`.

Design-system numbers are not exceptions to rule 7: a spacing value goes in
`_variables.scss` and reaches the component as a class, never as
`style={{ marginTop: 14 }}`.

### 7. All styling is SCSS in `src/styles/`, and colour always comes from a token

Every stylesheet lives in `src/styles/`; there are no CSS files elsewhere, no CSS modules,
no styled-components. `main.scss` is the only entry, imported once by `main.tsx`; vendor
CSS (`react-toastify`) is pulled in there too. Every partial is `@use`d by `main.scss`, and
a partial whose selectors no component renders is deleted, not kept "in case". The one
exception is the showcase's `_presentation.scss`, imported by its lazy `ShowcaseRoutes`
chunk so production never ships it (see **The showcase**).

| File              | Holds                                                               |
| ----------------- | ------------------------------------------------------------------- |
| `_variables.scss` | breakpoints, z-index layers, spacing, radii, durations, theme maps  |
| `_mixins.scss`    | mixins and functions; the only place `var(--…)` is spelled out      |
| `_tokens.scss`    | emits the CSS custom properties for both themes                     |
| `_base.scss`      | reset and bare element styles                                       |
| one per component | `_sidebar.scss`, `_data-table.scss`, `_modal-card.scss`, …          |

- **Colour is never literal.** Add it to **both** `$theme-light` and `$theme-dark` in
  `_variables.scss` and read it with `m.token("name")`. A key missing from the dark map
  silently inherits the light value.
- **Breakpoints:** `@include m.respond-below("desktop" | "laptop" | "tablet" | "mobile")`
  (1200 / 1024 / 768 / 576). Never a raw `@media`; add a mixin for a new media feature
  (`m.hover-capable`, `m.reduced-motion`, `m.prefers-dark`).
- **Layers:** `z-index: m.z("raised" | "backdrop" | "drawer" | "modal" | "popup" |
  "tooltip")`. Anything portaled to `body` that must appear over a modal (dropdown menus,
  date picker, row menu) uses `"popup"` or above.
- SCSS variables for compile-time values; CSS custom properties for anything that changes
  between light and dark, because the theme switches at runtime.
- **Theme:** `lib/theme.ts` owns it, outside React like the token: it starts from the OS
  (`prefers-color-scheme`) and follows it until the admin picks one in the sidebar's
  `ThemeToggle`; that choice is saved under `THEME_STORAGE_KEY` and wins from then on.
  The theme is the `data-theme` attribute on `<html>`, set by `startTheme()` in
  `main.tsx`; `_tokens.scss` emits the dark map for `[data-theme="dark"]`, plus an
  `m.prefers-dark` fallback for the moment before the script runs. Components read it
  through `useTheme()` (the `Logo` picks its image this way), never through `matchMedia`.
- Inline `style` is only for a measurement computed at runtime (anchored panel
  coordinates, a column width from `pages/constants.ts`) — never colour, never a shortcut
  around a class.

### 8. Respect the lint rules rather than silencing them

`eslint-plugin-react-hooks` v7 is on, and its rules catch real bugs:

- **No `setState` in an effect body.** Derive during render, initialise lazily, or set it
  in an event handler or async callback. `PageActions` shows the "adjust state while
  rendering" pattern for syncing local input with the URL.
- **No refs read during render.** State that lives outside React belongs outside React —
  see `auth/session.ts`, which holds the token in a module variable.
- **Fast Refresh needs one concern per file.** A file exporting a component exports only
  components. Contexts live in their own `.ts` file (`nav-context.ts`); a slice file never
  exports a component — which is why `redux/provider.tsx` is the only component in
  `src/redux/`.

An `eslint-disable` needs a reason in the PR description. Two in one file means the
design is wrong.

---

## How the pieces connect at runtime

### The session

The token lives in a module variable in `auth/session.ts`, mirrored into `localStorage`,
**not** in the store — so `request()` can read it synchronously and the raw JWT never
lands in DevTools. `redux/features/auth.ts` holds the React-facing mirror: `claims`
(authorization, decoded from the JWT, what `grants()` reads) and `user` (an `AdminUserDto`
for display). Do not conflate them.

```
LoginPage → dispatch(login).unwrap() → POST /auth/login
  → decodeToken()        claims come from the JWT payload, base64url-decoded in-app
  → setSession()         module variable + localStorage
  → login.fulfilled      the slice stores claims
  → dispatch(getProfile) the same handler, for the display user only
```

At startup the slice's initial state calls `restoreClaims()`, which drops an expired or
unreadable token, and `main.tsx` dispatches `getProfile` once when a token survives —
that, not a component effect, resolves `isRestoring`. Do not move it into a guard:
`/login` does not mount `RequireAuth`, so a stale token would leave the login screen
restoring forever.

Only `auth/session.ts` touches the token. `clearSession()` is called from exactly four
places: `request()` on a session-ending 401, `restoreClaims()` on an expired token, and the
`signOut` and `resetPassword` thunks. Do not add a fifth.

Sign-out on expiry runs like this: `request()` gets a 401, calls `clearSession()`, and
throws `ApiError(401, message, endsSession: true)`; the thunk rejects with
`{ message, status, endsSession }`; the single listener in `redux/listeners.ts` sees
`endsSession`, dispatches `sessionExpired()`, and toasts the message once; `RequireAuth`
then redirects to `/login`. A 403 is authorization, not authentication — it never signs
anyone out.

### Calling the API

A component dispatches a thunk and awaits `.unwrap()`, which re-throws the rejected payload
so an ordinary `try`/`catch` can branch on it:

```tsx
try {
  await dispatch(login({ email, password })).unwrap();
  await dispatch(getProfile()).unwrap();
} catch (error) {
  notifyFailure(error, text.login.failed);
}
```

`notifyFailure` toasts the server's own message (falling back to the given copy) and stays
silent for aborted requests and for `endsSession` rejections, which the listener has
already toasted. So a wrong password at login *does* show "Invalid credentials" — only a
genuinely ended session is deduplicated.

Thunks are plain `createAsyncThunk` with `{ rejectValue: RejectValue }`: try/catch, return
the payload, `rejectWithValue(toRejectValue(error))` on failure. A thunk that can be
superseded (lists, profile, token checks) takes `signal` from the thunk API and passes it
to the `api/` function, and the page aborts the previous dispatch in its effect cleanup:

```ts
useEffect(() => {
  const promise = dispatch(listAdmins(query));
  return () => promise.abort();
}, [dispatch, /* every query input */]);
```

Detect that cancellation in the slice with `meta.aborted`, never by comparing `payload` to
a sentinel. When a result belongs to a specific argument (a token, an id), store the
argument in `pending` and ignore a late `fulfilled`/`rejected` whose `meta.arg` no longer
matches — see `checkedResetToken` in the auth slice.

Slices write all three cases by hand, **one loading flag per thunk**:

```ts
builder
  .addCase(listAdmins.pending, (state) => {
    state.listLoading = true;
    state.listError = null;
  })
  .addCase(listAdmins.fulfilled, (state, { payload }) => {
    state.admins = payload.data;
    state.meta = payload.meta;
    state.listLoading = false;
  })
  .addCase(listAdmins.rejected, (state, { payload, meta }) => {
    if (meta.aborted) return;
    state.listError = payload?.message ?? null;
    state.listLoading = false;
  });
```

Never reuse one flag for two thunks, and never put a side effect (`localStorage`, network,
toast) in a reducer — persistence belongs in `auth/session.ts`, which thunks call.

**Mutations do not hand-patch records in state:** call the thunk, then refetch the list
(`AdminsPage` bumps a `reloadCount` that sits in the list effect's dependencies). The one
exception is the signed-in admin's own `user`/`claims`, which `updateAccount` and
`changePassword` replace wholesale from the response.

### URL state

Paging, search, filters, sort, and selection live in the query string, never in component
state, so every list view is linkable and survives a reload:

| Hook                  | Owns                                                       |
| --------------------- | ---------------------------------------------------------- |
| `usePageParam`        | `page` (omitted on page 1)                                 |
| `usePageActionParams` | `search` and the filter / multi-filter / toggle params; any change resets `page` |
| `useSortParams`       | `sortBy` + `sortOrder`; pass the backend's allowed values so a hand-edited URL falls back to the default instead of earning a 400 |
| `useSelectionParam`   | one selected id (for a side panel or detail view)          |

`Table` reads the same sort params, so a column is sortable by setting `sortable: true` and
using the backend's sort value as its `key`. `Pagination` clamps an out-of-range `page`.

### Forms

Forms use `react-hook-form` with `mode: "onTouched"`, and register validation from `text`
and `lib/` (`REGEX_PATTERN`, `describeNewPasswordProblem`, `FIELD_LIMITS`). Two traps:

- **Destructure `formState` at the top of the component**, unconditionally:
  `const { errors, touchedFields, isValid, isDirty } = form.formState;`. `formState` is a
  proxy that only tracks what was read during render; reading `isValid` only inside a
  conditionally rendered modal subscribes too late and the submit button never enables.
- Show a field's error only once it is touched (`touched.x ? errors.x?.message : undefined`)
  and disable submit on `!isValid` (plus `!isDirty` for edit forms) and while the thunk's
  loading flag is set.

### Layers, focus, and Escape

`Modal` and `SidePanel` register in `components/modal-layers.ts`: only the top layer reacts
to Escape, Tab is trapped inside it, the first focusable element gets focus on open, and
focus returns to the opener on close. Anything that opens *inside* a layer (dropdown,
multi-dropdown, date picker, tooltip) must call `event.stopPropagation()` on **Escape
only** while it is open — so Escape closes the innermost thing first — and must leave Tab
alone so the layer's trap still works. A popover that holds focus returns it to its
trigger when it closes.

## Layout

```
src/
  main.tsx                 root render, startTheme, startLanguage, startup getProfile, the main stylesheet import
  App.tsx                  router: every route and its gate, the ToastContainer
  i18n/  en.json hy.json index.ts  every user-facing string, per language; `text` + `format`
  api/
    client.ts              the only fetch(); token, ApiError, 401 → endsSession
    types.ts               hand-mirrored DTOs and enums
    constants.ts           HTTP_STATUS, FIELD_LIMITS, default base URL
    iam.ts                 one file per backend module
  redux/
    store.ts               configureStore, RootState, useAppDispatch/useAppSelector
    provider.tsx           <Providers>
    listeners.ts           the single listener: endsSession → sessionExpired + toast
    types.ts               RejectValue, toRejectValue, isRejectValue
    features/<domain>.ts   createSlice: state shape + explicit addCase triples
    actions/<domain>.ts    createAsyncThunk over src/api/
  auth/   session.ts constants.ts      token outside React, JWT decode, grants()
  components/
    AppLayout Sidebar PageHeader guards nav nav-context     the shell
    AuthScreen                                              card shell for signed-out screens
    ui.tsx                 Button, Field, TextField, PasswordField, Alert, Loading, EmptyState, Tooltip
    Table Pagination PageActions                            list screens
    Dropdown MultiDropdown DatePicker                       pickers (portaled, keyboard-complete)
    Modal SidePanel PopUp RowMenu modal-layers              overlays
    TruncatedText PageViewToggle ThemeToggle LanguageToggle CustomSkeleton icons Logo ScrollToTop
  hooks/                   URL-param state, anchored panels, dismiss layers, debounce, theme
  lib/                     date, format, password, toast, motion, theme, language, anchor, options, pagination
  pages/                   one file per screen + constants.ts
  presentation-data/       the component showcase; deleted when a project starts (see below)
  styles/                  main.scss + one partial per component
```

`components/ui.tsx` and the other primitives are presentational. A component that imports
from `src/redux/` or a request function is not a primitive — it is a page section, and it
belongs next to the page. (The shell — `Sidebar`, `guards` — is the one place that reads
the store.)

The kit includes pieces the reference feature does not use yet — `MultiDropdown`,
`DatePicker` (date range filter via `PageActions.dateFilter`), `SidePanel`, `PopUp`,
`RowMenu` (via `Table.menu`), `TruncatedText`, `PageViewToggle`. Reach for them before
writing a new one.

## Adding a screen

Using a hypothetical `drivers` backend module with `GET /drivers` behind
`@RequirePermissions(DRIVERS_VIEW)`:

1. **API** — `src/api/drivers.ts` with the endpoint functions; DTOs, enums, sort values,
   and any new `FIELD_LIMITS` in `api/types.ts` / `api/constants.ts`; add the permission to
   `PERMISSIONS` and its label to `text.domain.permissions`.

   ```ts
   export interface DriversQuery { page?: number; limit?: number; search?: string; sortBy?: DriversSortBy; sortOrder?: SortOrder }
   export const listDrivers = (query: DriversQuery, signal?: AbortSignal) =>
     request<PaginatedDto<DriverDto>>(`/drivers${toQueryString({ ...query })}`, { signal });
   ```

2. **Thunks** — `redux/actions/drivers.ts`, one `createAsyncThunk` per call, typed
   `<Returned, Arg, { rejectValue: RejectValue }>`, `signal` passed through for reads.
3. **Slice** — `redux/features/drivers.ts` modelled on `features/admins.ts`: list, meta,
   `listError`, one loading flag per thunk, all three cases, `meta.aborted` guard on the
   list. Register it in `store.ts` as `driversReducer`.
4. **Page** — `pages/DriversPage.tsx` modelled on `AdminsPage`: `PageHeader`,
   `PageActions`, `Table`, `Pagination`, modals keyed by a `DRIVER_DIALOG` const in
   `pages/constants.ts`, page size and default sort there too. Copy under `text.drivers`.
   Column widths must add up to less than 100% (`ADMINS_COLUMN_WIDTH` leaves about 10%)
   when the table has `actions` or `menu` — at 100% the actions column gets no room and
   the row menu disappears.
5. **Route** — in `App.tsx`, inside the `AppLayout` route, wrapped in the gate the backend
   controller uses (rule 4); add the path to `PATHNAMES`.
6. **Nav** — an entry in `components/nav.ts` with the same gate, an icon from `icons.tsx`,
   and its label under `text.nav.items`.
7. **Styles** — a `_drivers.scss` partial only if the kit's classes are not enough, `@use`d
   from `main.scss`.
8. `npm run build && npm run lint`, then exercise the screen against the backend.

## The showcase (`src/presentation-data/`)

In development the sidebar gains **Start here**, **Auth screens**, **Components**, and **Foundations**
sections: a living catalogue of the kit, rendered inside the shell next to the sidebar.

- **Auth screens** are preview copies of `LoginPage`, `ForgotPasswordPage`, and
  `ResetPasswordPage`: the same `AuthScreen`, fields, copy, and validation, but submitting
  only shows a toast. The real screens stay at `/login`, `/forgot-password`, and
  `/reset-password`.
- **Components** (buttons, inputs, tables, filter bar, modals, feedback) render every
  variant of a primitive with fake data from `sample-data.ts`.
- **Foundations** shows the design tokens and every export of `icons.tsx`. Icons are
  read from the module, so new ones appear on their own. Token values and swatches are
  generated from the SCSS maps, but which tokens appear is the hand-kept
  `COLOR_TOKEN_GROUPS` / `SCALE_TOKENS` list, so a new token needs adding there.
  **Brand playground** lets you try brand colours on the whole dashboard: `brand.ts`
  derives the accent and status tokens for both themes from four picks and injects them
  as one `<style>` element (the only place colour is set at runtime, and only here). The
  picks persist in `localStorage` until reset, and the page prints the matching lines to
  paste into `_variables.scss`.

Nothing in the showcase calls the API, and its routes sit outside `RequireAuth`, so it
works with no backend. While it exists, `/` lands a signed-out visitor on the **Welcome**
page (`PresentationLanding` → `WelcomePage`), a condensed version of `README.md` with links
into each section; a signed-in admin still goes through `LandingRedirect`. When the README
changes, update `welcome` in `text.json` to match.

**It exists only in development.** Both hook-ins check `import.meta.env.DEV`, and the pages
load through one lazy `ShowcaseRoutes` chunk that also imports `_presentation.scss`, so a
production build contains none of its code, copy, or styles. Keep it that way: nothing in
the folder may run work at import time that the hook-ins would pull into the main bundle
(the sidebar entries are a function, `presentationNavSections()`, for this reason), and
after touching the hook-ins check that `grep -c showcase dist/assets/*` is 0 after
`npm run build`.

The folder is self-contained so it can be cut in one go, which makes it the one
exception to rules 6 and 7: it keeps its own copy (`text.json`, read as
`presentationText`), its own `constants.ts`, and its own `_presentation.scss`. Its own
copy is English only — switching to Armenian translates the kit's components inside the
showcase, not the showcase's descriptions. Within the folder every other rule still
applies. It is wired in at exactly two places:

- `App.tsx`: `ShowcaseRoutes` (lazy, `null` outside development) and the layout route
  holding `PresentationLanding` as the index — declared before the `RequireAuth` block so
  it wins — plus `SHOWCASE_ROUTE`
- `components/Sidebar.tsx`: `...presentationNavSections()` appended to the sections

To remove it, delete those two hook-ins and the folder. Apart from them, nothing outside
the folder may import from it. When a primitive gains a variant or prop, a token is added
to a theme map, or an auth page changes its fields or validation, update the showcase in
the same change (`COLOR_TOKEN_GROUPS` and `SCALE_TOKENS` list what the tokens page shows).

## Comments

**Do not write comments.** No inline comments, no trailing comments, no JSDoc, no file or
class docblocks, no section banners, no commented-out code — in `.ts`, `.tsx`, and `.scss`
alike. Say it in the code instead: rename the thing, extract the function, add a named
constant, let the types carry it. Reasoning that does not fit in code goes in the PR
description or in this file.

Not comments, and still expected: this file, `README.md`, and anything a tool requires —
an `eslint-disable` directive, the `/// <reference types="vite/client" />` in
`vite-env.d.ts`.

---

## Review checklist

- [ ] No `fetch` outside `api/client.ts`; no URL, method, or query string outside `src/api/`
- [ ] A new endpoint that answers a wrong password with 401 passes `verifiesPassword`
- [ ] Backend DTO / enum / validator changes mirrored in `src/api/` in the same PR
- [ ] Route gate and nav gate both match the backend controller's guard
- [ ] No permission check relied on for anything but a clearer message
- [ ] Pages import no request function; logic sits in `api/`, `lib/`, `auth/`, or `redux/`
- [ ] Each thunk has its own loading flag and all three cases; superseded reads abort
- [ ] Mutations refetch rather than patch; no side effects in reducers
- [ ] List state (page, search, filters, sort) lives in the URL
- [ ] `formState` destructured at the top of the component
- [ ] No user-facing string in a component; interpolation through `format()`; sentence case
- [ ] Every new or changed key is in both `en.json` and `hy.json`, translated, with the
      same placeholders; dates formatted through `lib/format.ts`, never `Intl`
- [ ] No literal number outside a `constants.ts`; closed string sets are typed unions
- [ ] No stylesheet outside `src/styles/`; colour only via `m.token()`, in both theme maps
- [ ] Breakpoints via `respond-below`, layers via `m.z()`, no raw `@media`
- [ ] Interactive elements have a visible focus state and an accessible name; anything
      that traps focus is dismissable by keyboard and stops only Escape from propagating
- [ ] Wide content (tables, code) scrolls inside its own container; the page body never
      scrolls horizontally
- [ ] No new dependency or `eslint-disable` without a reason in the PR
- [ ] No comments; no dead code, dead partials, or unused dictionary keys left behind
- [ ] `npm run build` and `npm run lint` pass
