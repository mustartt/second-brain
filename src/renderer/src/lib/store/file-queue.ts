import {derived, writable} from "svelte/store";
import type {UploadTask} from "firebase/storage";

export type FileUploadStatus = 'queued' | 'paused' | 'uploading' | 'failed' | 'completed';

export interface FileUploadProgress {
    status: FileUploadStatus,
    error: string | null;
    progress: number,
}

interface Document {
    id: string;
    name: string;
    timeAdded: Date;
    fileHandle: File;
    uploadHandle: UploadTask | null;
    progress: FileUploadProgress;
}

export const fileQueueState = writable<Map<string, Document>>(new Map());
export const fileQueueView = derived(fileQueueState, ($store) => {
    const items = Array.from($store.entries());
    items.sort((a, b) => {
        if (a[1].timeAdded < b[1].timeAdded) {
            return -1;
        }
        return 1;
    });
    return items.map(item => item[1]);
});
