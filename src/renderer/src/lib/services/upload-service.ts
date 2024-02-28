import {fileQueueState} from "$lib/store/file-queue";
import {ref, uploadBytesResumable, type UploadMetadata} from "firebase/storage";
import {
    firebaseAuth,
    storage,
    storageUpload,
} from "$lib/services/firebase-service";
import {v4 as uuidv4} from "uuid";
import {get} from "svelte/store";
import {PromisePool} from "$lib/services/promise-pool-service";
import {getAllCollections} from "$lib/services/file-service";
import type {FolderId} from "$lib/services/types";

interface CustomUploadMetadata {
    [key: string]: string;

    user: string;
    revision: string;
    folderId: FolderId;

    filename: string;
    path: string;
    contentType: string;
}

const defaultUploadPool = new PromisePool(2);
const fileUploadCompletionPool = new PromisePool(1);

async function getDefaultUploadLocation(): Promise<FolderId> {
    const sources = await getAllCollections();
    const docSources = sources.filter(source => source.type === "document");
    const idx = docSources.findIndex(source => source.name === "Default");
    if (idx !== -1) {
        return docSources[idx].root;
    }
    if (docSources.length === 0) {
        throw new Error("Cannot find a valid default upload location");
    }
    return docSources[0].root;
}

export async function createFileUpload(file: File, folderId: FolderId | undefined, revision: number | undefined) {
    if (folderId === undefined) {
        folderId = await getDefaultUploadLocation();
    }
    if (revision === undefined) {
        revision = 0;
    }

    const handle = uuidv4();
    fileQueueState.update(state => {
        state.set(handle, {
            id: handle,
            name: file.name,
            timeAdded: new Date(),
            fileHandle: file,
            uploadHandle: null,
            progress: {
                status: "queued",
                error: null,
                progress: 0,
            },
        });
        return state;
    });

    const state = get(fileQueueState);
    const entry = state.get(handle);
    if (entry === undefined) return;

    // add upload metadata
    defaultUploadPool.submit(async () => {
        const storageRef = ref(storageUpload, handle);
        const uid = firebaseAuth.currentUser?.uid;
        if (!uid) return;

        const customMetadata: CustomUploadMetadata = {
            user: uid,
            folderId: folderId!,
            revision: revision!.toString(),
            filename: file.name,
            path: file.path,
            contentType: file.type,
        };

        const metadata: UploadMetadata = {
            contentType: file.type,
            customMetadata: customMetadata,
        };
        const task = uploadBytesResumable(storageRef, entry.fileHandle, metadata);
        entry.uploadHandle = task;

        await new Promise<void>(resolve => {
            task.on("state_changed",
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes);
                    switch (snapshot.state) {
                    case "running":
                        fileQueueState.update(state => {
                            const entry = state.get(handle);
                            if (entry !== undefined) {
                                entry.progress.progress = progress;
                                entry.progress.status = "uploading";
                                entry.progress.error = null;
                            }
                            return state;
                        });
                        break;
                    case "paused":
                        fileQueueState.update(state => {
                            const entry = state.get(handle);
                            if (entry !== undefined) {
                                entry.progress.status = "paused";
                                entry.progress.error = null;
                            }
                            return state;
                        });
                        break;
                    }
                },
                (error) => {
                    fileQueueState.update(state => {
                        const entry = state.get(handle);
                        if (entry !== undefined) {
                            entry.progress.status = "failed";
                            entry.progress.error = error.message;
                        }
                        return state;
                    });
                    resolve();
                },
                () => {
                    fileQueueState.update(state => {
                        const entry = state.get(handle);
                        if (entry !== undefined) {
                            entry.progress.progress = 1;
                            entry.progress.status = "completed";
                            entry.progress.error = null;
                        }
                        return state;
                    });
                    setTimeout(() => {
                        fileUploadCompletionPool.submit(async () => {
                            deleteFileUpload(handle);
                            await new Promise(resolve => setTimeout(resolve, 500));
                        });
                    }, 10_000);
                    resolve();
                });
        });
    });
}

export function cancelFileUpload(id: string) {
    const state = get(fileQueueState);
    const entry = state.get(id);
    if (entry === undefined) return;
    entry.uploadHandle?.cancel();
}

export function pauseFileUpload(id: string) {
    const state = get(fileQueueState);
    const entry = state.get(id);
    if (entry === undefined) return;

    entry.uploadHandle?.pause();
}

export function resumeFileUpload(id: string) {
    const state = get(fileQueueState);
    const entry = state.get(id);
    if (entry === undefined) return;
    entry.uploadHandle?.resume();
}

export function deleteFileUpload(id: string) {
    cancelFileUpload(id);
    fileQueueState.update(state => {
        state.delete(id);
        return state;
    });
}
