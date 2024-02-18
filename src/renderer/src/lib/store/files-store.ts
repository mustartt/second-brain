import {type DataSource, type DirectoryPage, type FileEntry, PathCursor} from "$lib/services/file-service";
import {writable} from "svelte/store";

type DirectoryItem = DirectoryPage | FileEntry;

interface DatasourceViewerState {
    sources: DataSource[];
    isLoading: boolean;
}

export interface FileViewerState {
    datasource: DataSource;
    path: string[];
    entries: DirectoryItem[];
    isLoading: boolean;

    cursor: PathCursor | null;
    unsubscribe: () => void;
}

export const datasourceState = writable<DatasourceViewerState>({
    sources: [],
    isLoading: true
});

export const fileViewerState = writable<FileViewerState | null>(null);

