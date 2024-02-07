import type {UploadProgress} from "../../env";
import {derived, readable, writable} from "svelte/store";
import {v4 as uuidv4} from 'uuid';

interface Document {
    id: string;
    name: string;
    timeAdded: Date;
    progress: UploadProgress | null;
}


function createFileQueueStore() {
    const {
        subscribe,
        update,
        set
    } = writable<Map<string, Document>>(new Map());

    function addDocument(name: string) {
        const id = uuidv4();
        const time = new Date();
        update(value => {
            value.set(id, {
                id, name,
                timeAdded: time,
                progress: null
            });
            return value;
        });
        return id;
    }

    function updateDocument(id: string, progress: UploadProgress) {
        update(value => {
            const doc = value.get(id);
            if (doc) {
                doc.progress = progress;
            }
            return value;
        });
    }

    function removeDocument(id: string) {
        update(value => {
            value.delete(id);
            return value;
        });
    }

    return {
        subscribe, update, set,
        addDocument,
        updateDocument,
        removeDocument
    };
}

export const fileQueueState = createFileQueueStore();
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
