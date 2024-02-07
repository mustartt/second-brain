/// <reference types="svelte" />
/// <reference types="vite/client" />

export type FileUploadID = string;

export interface UploadProgress {
    id: string;
    status: 'queued' | 'uploading' | 'failed' | 'completed',
    error: string | null;
    progress: number,
    rate: number
}

export type UploadProgressCallback = (state: UploadProgress) => void;
export type UploadProgressUnsubscribe = () => void;

export interface API {
    startFileUpload: (file: string, token: string, update: UploadProgressCallback | undefined) => void;
}

declare global {
    interface Window {
        api: API;
    }
}
