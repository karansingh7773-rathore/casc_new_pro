/// <reference types="react" />
/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_GEMINI_API_KEY: string;
    readonly VITE_NVIDIA_API_KEY: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

declare namespace JSX {
    interface IntrinsicElements {
        'iconify-icon': any;
    }
}

declare namespace React {
    namespace JSX {
        interface IntrinsicElements {
            'iconify-icon': any;
        }
    }
}
