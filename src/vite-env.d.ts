interface ImportMetaEnv {
  VITE_HR_HOST: string;
  VITE_HR_PORT: string;
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
