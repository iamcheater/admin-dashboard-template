# Admin Dashboard Template — Updates

The admin dashboard template needs these changes. Apply them one at a time, in order. Each update is a separate change.

Rules for every update:

- Follow `CLAUDE.md` exactly: no text in components (`en.json`), no literal numbers outside a `constants.ts`, SCSS only in `src/styles/` with colours from tokens, no comments, and no business logic in components.
- When an update adds a component or a variant, add it to the showcase (`src/presentation-data/`) in the same change.
- When an update changes how the project works, update `CLAUDE.md` and `README.md` in the same change, so they describe the new structure.
- `npm run build` and `npm run lint` must pass after every update.

---

## 1. Turn on strict TypeScript

**Why:** `tsconfig.app.json` has no `"strict": true`, so null and `any` mistakes compile silently. AI-written code makes these mistakes often.

**Do:**

- Add `"strict": true` to `tsconfig.app.json` and `tsconfig.node.json`.
- Fix every error that `npm run build` reports. Fix the types properly: no `any`, no `as` casts to silence errors, and no `!` non-null assertions unless the value is guaranteed.
- Do not change behaviour while fixing types.

## 2. Stop committing personal Claude settings

**Why:** `.claude/settings.local.json` is committed and contains personal machine paths and one-off commands.

**Do:**

- Add `.claude/settings.local.json` to `.gitignore`.
- Remove it from git with `git rm --cached .claude/settings.local.json`. Keep the local file on disk.
- If the team needs shared permissions, put them in `.claude/settings.json` (committed), with no personal paths.

## 3. Deploy on Vercel and use the three env files

**Why:** Admin dashboards now deploy on Vercel, like the websites. The GitLab CI, Docker and nginx setup is no longer used.

**Do:**

- Delete `.gitlab-ci.yml`, `Dockerfile`, `.dockerignore`, `docker-compose.yml` and `docker-compose/`.
- Add `vercel.json` with a rewrite that sends every path to `/index.html`, so client routes survive a reload (this replaces nginx's `try_files`).
- Adopt the shared env convention. `.env.local`, `.env.develop` and `.env.prod` always exist and are all gitignored. `.env.example` is committed and lists every key. Vite loads only `.env.local` automatically. `.env.develop` and `.env.prod` are reference files whose values are entered into Vercel.
- Make sure `.gitignore` ignores `.env*` except `.env.example`.
- Rewrite the **Deploy** sections of `CLAUDE.md` and `README.md` for Vercel. Remove the "Docker image name and server paths" row from the new-project table.
- Add a GitHub Actions workflow (`.github/workflows/ci.yml`) that runs `npm ci`, `npm run lint` and `npm run build` on pull requests and on pushes to `main` and `develop`.

## 4. Admin UI in Armenian

**Why:** Clients' admins will mostly want the dashboard in Armenian. Today only `en.json` exists.

**Do:**

- Add `src/i18n/hy.json` and `src/i18n/ru.json` with exactly the same keys as `en.json`. Use real Armenian and Russian translations, not copies of the English text.
- The admin picks the UI language from a switcher in the sidebar, next to `ThemeToggle`, built the same way.
- Keep `text` a plain module export so no existing component changes. `src/i18n/index.ts` picks the dictionary once at startup from a saved choice (`ADMIN_LANGUAGE_STORAGE_KEY` in `src/lib/constants.ts`, wrapped in try/catch). Without a saved choice it uses `VITE_DEFAULT_ADMIN_LANGUAGE`. Switching the language saves the choice and reloads the page.
- Set `<html lang>` to the active language.
- Add a type check that fails the build if `hy.json` or `ru.json` is missing a key that `en.json` has (for example, type both as `typeof en`).
- Update rule 6 in `CLAUDE.md`: every new key goes into **all three** files in the same change.
- Add `VITE_DEFAULT_ADMIN_LANGUAGE` to `.env.example` and the three env files.

## 5. Translated-text field

**Why:** Admin-managed content is stored in the backend as one JSONB object per field (`title: { hy, en, ru }`). Almost every content form needs to edit one.

**Do:**

- Add content-language config: `VITE_CONTENT_LANGUAGES` (for example `hy,en,ru`) and `VITE_DEFAULT_CONTENT_LANGUAGE` (for example `hy`), read in `src/lib/`. These are the **content** languages, separate from the admin UI language in update 4.
- Add `TranslatedText` and `TranslatedTextPatch` types to `src/api/types.ts`, mirroring the backend.
- Add a `TranslatedTextField` primitive to `components/ui.tsx` (or its own file), with a single-line and a multi-line variant:
  - one input per content language, switched with language tabs;
  - each tab shows a marker when its language is filled and when it has an error;
  - only the default language is required; the others are optional;
  - an emptied language is sent as `""`, which the backend treats as "remove this translation";
  - works with `react-hook-form` through `Controller`, and respects `FIELD_LIMITS` for maximum length;
  - full keyboard support for the tabs, visible focus, and accessible names.
- When only one content language is configured, show a plain field with no tabs.
- Add a helper in `src/lib/` that builds the update payload so only changed languages are sent.
- Add every variant to the showcase.

## 6. Image upload component

**Why:** Media uploads go straight from the browser to S3 through presigned URLs from the backend's media module.

**Do:**

- Add `src/api/media.ts` with:
  - `presignUpload({ purpose, contentType, fileSize })`, which calls the backend through `request()` and returns `{ key, uploadUrl, expiresAt }`;
  - `uploadToStorage(uploadUrl, file, onProgress, signal)`, which PUTs the file to S3 with `XMLHttpRequest` so upload progress can be reported. It sends no auth header. Document it in `CLAUDE.md` rule 1 as the **one** allowed network call outside `request()`, because it goes to S3, not to the backend.
- Mirror the backend's upload purposes and size limits in `src/api/constants.ts` (`UPLOAD_PURPOSE`, `MEDIA_LIMITS`).
- Add an `ImageUpload` component that:
  - accepts a file by click or drag-and-drop;
  - checks type and size on the client before uploading, with messages from `en.json`;
  - shows a progress bar while uploading, and can cancel;
  - shows a preview after upload, with **Replace** and **Remove** actions;
  - gives the form the uploaded `key`, not the file. The page saves the key with the record;
  - covers every state: empty, drag-over, uploading, uploaded, error, disabled.
- Thunks own the presign-then-upload flow, so pages stay free of API calls (rule 5).
- Add every state to the showcase with a fake upload that needs no backend.

## 7. Section editor page pattern

**Why:** Many screens edit a single record, such as the hero, about block or contact block, rather than a list. There is no reference screen for that yet.

**Do:**

- Add a reference page, `pages/SectionEditorPage.tsx`, next to `AdminsPage` as the second pattern every new screen copies. Back it with a hypothetical `hero` section: `src/api/sections.ts`, thunks and a slice, following the "Adding a screen" steps.
- The page loads the section, shows a form with `TranslatedTextField` and `ImageUpload`, and saves with one button.
- Save is disabled until the form is dirty and valid. After saving, refetch and reset the form to the saved values.
- Show loading, error, and saved states using the kit (`Loading`, `Alert`, toasts).
- Add an **Adding a section screen** subsection to `CLAUDE.md`, beside **Adding a screen**.

## 8. Inbox screen pattern

**Why:** Form submissions (contact requests, orders, applications) need a screen to read and handle them. The backend's Telegram "View" buttons deep-link into it.

**Do:**

- Add a reference page, `pages/InboxPage.tsx`, backed by a hypothetical `submissions` module (`src/api/submissions.ts`, thunks, slice):
  - a read-only `Table` with search, a date-range filter (`PageActions.dateFilter`), a status filter and pagination, all in the URL;
  - clicking a row opens the record in a `SidePanel` via `useSelectionParam`;
  - a status of `new` or `handled`, changeable from the side panel and the row menu, with new items visually marked;
  - search treats `#<id>` as an exact id, so `/inbox?search=%23123` opens straight onto one submission.
- Mutations refetch the list, as in `AdminsPage`.
- Document the deep-link format in `CLAUDE.md`, so the backend's Telegram buttons and this screen stay in step.

## 9. Unsaved-changes guard

**Why:** An admin who edits a form and navigates away loses their work without warning.

**Do:**

- Add a `useUnsavedChangesGuard(isDirty)` hook in `src/hooks/`:
  - uses React Router's `useBlocker` to catch in-app navigation and shows a confirmation `Modal` (Stay / Discard), with copy from `en.json`;
  - adds a `beforeunload` listener while the form is dirty, to catch reloads and closing the tab;
  - stops blocking after a successful save.
- Use it in `AccountPage` and the section editor page. Mention it in **Adding a screen** in `CLAUDE.md`, for every edit form.

## 10. Long-text editor (optional)

**Why:** Legal pages, such as the privacy policy and terms, and longer descriptions need headings, lists, bold and links. A plain textarea is not enough.

**Do this update only if the lead approves the new dependency.**

- Use Tiptap (`@tiptap/react` and `@tiptap/starter-kit`), styled entirely through the SCSS tokens. No vendor theme CSS.
- Limit the toolbar to headings (H2 and H3), bold, italic, bulleted and numbered lists, links, and undo/redo.
- Store and send the content as HTML. The website renders it as sanitized HTML.
- Make it work inside `TranslatedTextField` as its multi-line variant, so each language gets its own editor tab.
- Lazy-load the editor so pages without it do not ship its code.
- Note the dependency and the reason for it in `CLAUDE.md` under **Stack**.
- Add it to the showcase.
