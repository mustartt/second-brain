import {fileQueueState} from "$lib/store/file-queue";
import {ref, uploadBytesResumable} from "firebase/storage";
import {storage} from "$lib/services/firebase-service";
import {v4 as uuidv4} from 'uuid';
import {get} from "svelte/store";
import {PromisePool} from "$lib/services/promise-pool-service";

const defaultUploadPool = new PromisePool(2);
const fileUploadCompletionPool = new PromisePool(1);

export function createFileUpload(file: File) {
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
                progress: 0
            }
        });
        return state;
    });

    const state = get(fileQueueState);
    const entry = state.get(handle);
    if (entry === undefined) return;

    defaultUploadPool.submit(async () => {
        const storageRef = ref(storage, 'files/' + handle);
        const task = uploadBytesResumable(storageRef, entry.fileHandle);
        entry.uploadHandle = task;
        await new Promise<void>(resolve => {
            task.on('state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes);
                    switch (snapshot.state) {
                        case 'running':
                            fileQueueState.update(state => {
                                const entry = state.get(handle);
                                if (entry !== undefined) {
                                    entry.progress.progress = progress;
                                    entry.progress.status = 'uploading';
                                    entry.progress.error = null;
                                }
                                return state;
                            });
                            break;
                        case 'paused':
                            fileQueueState.update(state => {
                                const entry = state.get(handle);
                                if (entry !== undefined) {
                                    entry.progress.status = 'paused';
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
                            entry.progress.status = 'failed';
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
                            entry.progress.status = 'completed';
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

    entry.uploadHandle.cancel();
}

export function pauseFileUpload(id: string) {
    const state = get(fileQueueState);
    const entry = state.get(id);
    if (entry === undefined) return;

    entry.uploadHandle.pause();
}

export function resumeFileUpload(id: string) {
    const state = get(fileQueueState);
    const entry = state.get(id);
    if (entry === undefined) return;

    entry.uploadHandle.resume();
}

export function deleteFileUpload(id: string) {
    cancelFileUpload(id);
    fileQueueState.update(state => {
        state.delete(id);
        return state;
    });
}
