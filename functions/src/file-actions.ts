import {CreateFileRequest, DirectoryEntry, FileEntry} from "./common";
import * as admin from "firebase-admin";
import {FieldValue, Timestamp, Transaction} from "firebase-admin/firestore";
import {
    getAndLockAllParentNodeRef,
    getFirestoreFSPath,
    logAndThrow,
} from "./folder-actions";

export async function createFileHandler(data: CreateFileRequest) {
    const firestore = admin.firestore();
    return await firestore.runTransaction(async (txn: Transaction) => {
        // read phase
        const parentFoldersRef = await getAndLockAllParentNodeRef(txn, data.parentId);
        const newFileDoc = await txn.get(firestore.doc(getFirestoreFSPath(data.fileId)));
        if (newFileDoc.exists) {
            logAndThrow("already-exists", "file already exists");
        }
        const parentPageDoc = await txn.get(firestore.doc(getFirestoreFSPath(data.parentId)));
        const parentPageDocData = parentPageDoc.data() as DirectoryEntry;
        if (parentPageDocData.owner !== data.user) {
            logAndThrow("permission-denied", "you do not own this folder");
        }

        const newFileEntry: FileEntry = {
            id: data.fileId,
            parent: data.parentId,
            owner: data.user,
            type: "file",
            name: data.name,
            revision: 0,
            hash: data.hash,
            fileHandle: data.handle,
            status: "created",
            metadata: {
                contentType: data.metadata.contentType,
                size: data.metadata.size,
                timeCreated: Timestamp.now(),
                timeUpdated: Timestamp.now(),
            },
        };

        // write phase
        txn.set(newFileDoc.ref, newFileEntry);

        const directParentRef = parentFoldersRef[0];
        txn.update(directParentRef, {
            "metadata.timeUpdated": Timestamp.now(),
            "metadata.fileCount": FieldValue.increment(1),
        });
        for (const ref of parentFoldersRef) {
            txn.update(ref, {
                "revision": FieldValue.increment(1),
                "metadata.size": FieldValue.increment(data.metadata.size),
            });
        }

        return newFileEntry;
    });
}
