import {PathCursor} from "$lib/services/file-service";
import type {DataSource, DirectoryEntry, FileEntry} from "$lib/services/types";
import {writable} from "svelte/store";

type DirectoryItem = DirectoryEntry | FileEntry;

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
    isLoading: true,
});

export const fileViewerState = writable<FileViewerState | null>(null);

