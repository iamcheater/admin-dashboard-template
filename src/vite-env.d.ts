/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_DEFAULT_ADMIN_LANGUAGE?: string;
  readonly VITE_CONTENT_LANGUAGES?: string;
  readonly VITE_DEFAULT_CONTENT_LANGUAGE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
