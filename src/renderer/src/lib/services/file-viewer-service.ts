import {get} from "svelte/store";
import {type FileViewerState, fileViewerState} from "$lib/store/files-store";
import {onSnapshot, type Query} from "firebase/firestore";
import {httpsCallable} from "firebase/functions";
import {functions} from "$lib/services/firebase-service";
import type {
    CreateFolderRequest, DeleteFolderRequest,
    FileEntry,
    FolderId,
    FolderResponse, RenameFolderRequest,
} from "./types";
import type {DirectoryEntry} from "$lib/services/types";
import {v4 as uuidv4} from "uuid";

export function registerDirectoryChanges(query: Query) {
    return onSnapshot(query, snapshot => {
        const newEntries = snapshot.docs.map(doc =>
            doc.data() as FileEntry | DirectoryEntry);
        fileViewerState.update(value => {
            if (value) {
                value.entries = newEntries;
            }
            return value;
        });
    });
}

export async function pushDirectoryOnToPath(folder: DirectoryEntry) {
    const oldState = get(fileViewerState)!;

    const newState: FileViewerState = {
        datasource: oldState.datasource,
        cursor: oldState.cursor,
        entries: [],
        isLoading: true,
        path: [...oldState.path, folder.name],
        unsubscribe: () => {
        },
    };
    fileViewerState.set(newState);
    // unload previous state
    oldState.unsubscribe();

    // new viewer state
    const cursor = oldState.cursor!;
    await cursor.push(folder.id);

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

export async function createFolder(parentFolderId: FolderId, name: string) {
    const func = httpsCallable<CreateFolderRequest, FolderResponse>(functions, "createFolder");
    const folderId = uuidv4();
    const result = await func({
        folderId: folderId,
        parentId: parentFolderId,
        name: name,
    });
    return result.data;
}

export async function renameFolder(folderId: FolderId, newName: string) {
    const func = httpsCallable<RenameFolderRequest, FolderResponse>(functions, "renameFolder");
    const result = await func({
        folderId: folderId,
        newName,
    });
    return result.data;
}

export async function deleteFolder(folderId: FolderId) {
    const func = httpsCallable<DeleteFolderRequest, FolderResponse>(functions, "deleteFolder");
    const result = await func({
        folderId: folderId,
    });
    return result.data;
}
