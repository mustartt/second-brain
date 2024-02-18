import {type DataSource, type DirectoryPage, type FileEntry, PathCursor} from "$lib/services/file-service";
import {writable} from "svelte/store";

type DirectoryItem = DirectoryPage | FileEntry;

interface DatasourceViewerState {
    sources: DataSource[];
    isLoading: boolean;
}

interface FileViewerState {
    datasource: DataSource;
    path: string[];
    entries: DirectoryItem[];
    isLoading: boolean;
    cursor: PathCursor;
}

export const datasourceState = writable<DatasourceViewerState>({
    sources: [],
    isLoading: true
});

