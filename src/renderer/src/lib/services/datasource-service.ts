import {firebaseAuth} from "$lib/services/firebase-service";
import {toast} from "svelte-sonner";
import {
    datasourceState,
    type FileViewerState,
    fileViewerState,
} from "$lib/store/files-store";
import {
    type DataSource,
    getAllCollections,
    getCollectionCursor,
} from "$lib/services/file-service";
import {get} from "svelte/store";
import {registerDirectoryChanges} from "$lib/services/file-viewer-service";

export async function loadDataSources() {
    try {
        const uid = firebaseAuth.currentUser?.uid;
        if (!uid) {
            console.error("Missing uid");
            toast.error("Unexpected error when loading datasources");
            return;
        }
        datasourceState.update((value) => {
            value.isLoading = true;
            return value;
        });
        const allCollections = await getAllCollections();
        datasourceState.update((value) => {
            value.isLoading = false;
            value.sources = allCollections;
            return value;
        });
    } catch (err) {
        console.error(err);
        toast.error("Unexpected error when loading data sources");
    }
}

export async function loadNewDataSource(source: DataSource) {
    const oldState = get(fileViewerState);
    try {
        const viewState: FileViewerState = {
            datasource: source,
            cursor: null,
            entries: [],
            isLoading: true,
            path: [source.name],
            unsubscribe: () => {
            },
        };
        fileViewerState.set(viewState);
        // unload previous state
        oldState?.unsubscribe();

        // new viewer state
        const cursor = await getCollectionCursor(source);
        const iter = await cursor.getDirectoryIterator();
        const unsub = registerDirectoryChanges(iter.getCurrentQuery());
        const loadedViewState: FileViewerState = {
            datasource: source,
            cursor: cursor,
            entries: iter.getCurrentPage(),
            isLoading: false,
            path: [source.name],
            unsubscribe: unsub,
        };
        fileViewerState.set(loadedViewState);
    } catch (err) {
        console.error(err);
        toast.error("Unexpected error when loading data source");
    }
}
