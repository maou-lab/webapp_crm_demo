/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AIRTABLE_TOKEN?: string;
  readonly VITE_AIRTABLE_BASE_ID?: string;
  readonly VITE_AIRTABLE_TABLE_ID?: string;
  readonly VITE_RDV_WEBHOOK_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
