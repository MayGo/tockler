/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly MAIN_VITE_SOME_KEY: string;
    // more env variables...
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
