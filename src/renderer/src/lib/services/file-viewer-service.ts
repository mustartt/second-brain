import {get} from "svelte/store";
import {type FileViewerState, fileViewerState} from "$lib/store/files-store";
import {undefined} from "zod";
import {type DirectoryPage, type FileEntry, getCollectionCursor} from "$lib/services/file-service";
import {onSnapshot} from "firebase/firestore";

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
    const unsub = onSnapshot(iter.getCurrentQuery(), snapshot => {
        const newEntries = snapshot.docs.map(doc =>
            doc.data() as FileEntry | DirectoryPage);
        fileViewerState.update(value => {
            if (value) {
                value.entries = newEntries;
            }
            return value;
        });
    });
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
