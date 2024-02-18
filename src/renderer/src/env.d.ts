/// <reference types="svelte" />
/// <reference types="vite/client" />


export interface API {
    crypto: {
        sha256base64(input: string): string;
    };
}

declare global {
    interface Window {
        api: API;
    }
}
