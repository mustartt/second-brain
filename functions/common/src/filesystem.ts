import {firestore} from "firebase-admin";
import {FolderId, UserId, FileId, validNameRegex} from "./common";
import {z} from "zod";

// Primary Key: UUIDv4
export interface DirectoryEntry {
    id: FolderId;
    parent: FolderId;
    owner: UserId;

    type: "dir";
    name: string;       // max 256 char
    revision: number;   // monotonic revision id

    metadata: {
        fileCount: number;
        dirCount: number;
        size: number;   // size of all children
        timeCreated: firestore.Timestamp;
        timeUpdated: firestore.Timestamp;
    };
}

export type FileStatus =
    "created"
    | "added"
    | "queued"
    | "processing"
    | "processed"
    | "error";

// Primary Key: UUIDv4
export interface FileEntry {
    id: FileId;
    parent: FolderId;
    owner: UserId;

    type: "file";
    name: string;       // max 256 char
    revision: number;   // monotonic revision id

    hash: string;       // sha256 digest of file blob
    fileHandle: string; // actual file handle to the file service
    status: FileStatus;

    metadata: {
        contentType: string;
        size: number;
        timeCreated: firestore.Timestamp;
        timeUpdated: firestore.Timestamp;
    };
}

export const CreateFolderRequestSchema = z.object({
    parentId: z.string().uuid("Invalid parent UUID"),
    folderId: z.string().uuid("Invalid folder UUID"),
    name: z.string()
        .regex(validNameRegex, "Invalid Folder name")
        .min(1, "Name requires minimum of 1 characters")
        .max(256, "Name cannot exceed 256 characters"),
});

export type CreateFolderRequest = z.infer<typeof CreateFolderRequestSchema>;

export const RenameFolderRequestSchema = z.object({
    folderId: z.string().uuid("Invalid folder UUID"),
    newName: z.string()
        .regex(validNameRegex, "Invalid Folder name")
        .min(1, "Name requires minimum of 1 characters")
        .max(256, "Name cannot exceed 256 characters"),
});

export type RenameFolderRequest = z.infer<typeof RenameFolderRequestSchema>;

export const MoveFolderRequestSchema = z.object({
    folderId: z.string().uuid("Invalid folder UUID"),
    newParentId: z.string().uuid("Invalid folder UUID"),
});

export type MoveFolderRequest = z.infer<typeof MoveFolderRequestSchema>;

export const DeleteFolderRequestSchema = z.object({
    folderId: z.string().uuid("Invalid folder UUID"),
});

export type DeleteFolderRequest = z.infer<typeof DeleteFolderRequestSchema>;

export type FolderResponse = DirectoryEntry;
