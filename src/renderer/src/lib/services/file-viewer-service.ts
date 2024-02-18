import {get} from "svelte/store";
import {type FileViewerState, fileViewerState} from "$lib/store/files-store";
import {type DirectoryPage, type FileEntry} from "$lib/services/file-service";
import {onSnapshot, type Query} from "firebase/firestore";

export function registerDirectoryChanges(query: Query) {
    return onSnapshot(query, snapshot => {
        const newEntries = snapshot.docs.map(doc =>
            doc.data() as FileEntry | DirectoryPage);
        fileViewerState.update(value => {
            if (value) {
                value.entries = newEntries;
            }
            return value;
        });
    });
}

export async function pushDirectoryOnToPath(newDir: string) {
    const oldState = get(fileViewerState)!;

    const newState: FileViewerState = {
        datasource: oldState.datasource,
        cursor: oldState.cursor,
        entries: [],
        isLoading: true,
        path: [...oldState.path, newDir],
        unsubscribe: () => {
        },
    };
    fileViewerState.set(newState);
    // unload previous state
    oldState.unsubscribe();

    // new viewer state
    const cursor = oldState.cursor!;
    await cursor.push(newDir);

    const iter = await cursor.getDirectoryIterator();
    const unsub = registerDirectoryChanges(iter.getCurrentQuery());
    const loadedViewState: FileViewerState = {
        datasource: newState.datasource,
        cursor: cursor,
        entries: iter.getCurrentPage(),
        isLoading: false,
        path: newState.path,
        unsubscribe: unsub,
    };
    fileViewerState.set(loadedViewState);
}

export async function popDirectoryOnToPath(count: number) {
    const oldState = get(fileViewerState)!;

    const newState: FileViewerState = {
        datasource: oldState.datasource,
        cursor: oldState.cursor,
        entries: [],
        isLoading: true,
        path: oldState.path.slice(0, -count),
        unsubscribe: () => {
        },
    };
    fileViewerState.set(newState);
    // unload previous state
    oldState.unsubscribe();

    // new viewer state
    const cursor = oldState.cursor!;
    for (let i = 0; i < count; i++) {
        await cursor.pop();
    }

    const iter = await cursor.getDirectoryIterator();
    const unsub = registerDirectoryChanges(iter.getCurrentQuery());
    const loadedViewState: FileViewerState = {
        datasource: newState.datasource,
        cursor: cursor,
        entries: iter.getCurrentPage(),
        isLoading: false,
        path: newState.path,
        unsubscribe: unsub,
    };
    fileViewerState.set(loadedViewState);
}
