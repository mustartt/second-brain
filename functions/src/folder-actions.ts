import {FunctionsErrorCode, onCall} from "firebase-functions/v2/https";
import {
    CreateFolderRequest,
    CreateFolderRequestSchema, DeleteFolderRequest, DeleteFolderRequestSchema,
    DirectoryEntry,
    FileEntry,
    FolderId, MoveFolderRequest, MoveFolderRequestSchema,
    RenameFolderRequest,
    RenameFolderRequestSchema,
} from "common";
import * as logger from "firebase-functions/logger";
import {HttpsError} from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import {
    Timestamp,
    Transaction,
    FieldValue,
    BulkWriter,
} from "firebase-admin/firestore";

function getFirestoreFSPath(id: string) {
    return `filesystem/${id}`;
}

function logAndThrow(code: FunctionsErrorCode, ...args: any[]) {
    const argsAsString = args.join(" ");
    logger.warn(code + ":", argsAsString);
    throw new HttpsError("internal", argsAsString);
}

const MAX_TRAVERSAL_DEPTH = 64;

async function getAndLockAllParentNodeRef(txn: Transaction, id: string) {
    const firestore = admin.firestore();

    let visited: admin.firestore.DocumentReference[] = [];
    let currId = id;

    while (visited.length < MAX_TRAVERSAL_DEPTH) {
        const node = await txn.get(firestore.doc(getFirestoreFSPath(currId)));
        if (!node.exists) {
            logger.error("internal:", "cannot find node", currId);
            throw new HttpsError("internal", "cannot find node", currId);
        }
        const nodeData = node.data() as DirectoryEntry | FileEntry;
        if (nodeData.type !== "dir") {
            logger.error("internal:", "node points to file", currId);
            throw new HttpsError("internal", "node points to file", currId);
        }
        visited.push(node.ref);
        if (nodeData.name === "$root") {
            break;
        }
        currId = nodeData.parent;
    }

    return visited;
}

export const createFolder = onCall<CreateFolderRequest>
(async (request) => {
    let data: CreateFolderRequest;
    try {
        data = CreateFolderRequestSchema.parse(request.data);
    } catch (err) {
        logger.warn("invalid-argument:", `${err}`);
        throw new HttpsError("invalid-argument", `${err}`);
    }
    const uid = request.auth?.uid;
    if (!uid) {
        logger.warn("unauthenticated:", "missing authentication");
        throw new HttpsError("unauthenticated", "missing authentication");
    }
    const firestore = admin.firestore();
    return await firestore.runTransaction(async (txn: Transaction) => {
        // read phase
        const parentFoldersRef = await getAndLockAllParentNodeRef(txn, data.parentId);
        const newPageDoc = await txn.get(firestore.doc(getFirestoreFSPath(data.folderId)));
        if (newPageDoc.exists) {
            logger.warn("already-exists:", "folder already exists");
            throw new HttpsError("already-exists", "folder already exists");
        }
        const parentPageDoc = await txn.get(firestore.doc(getFirestoreFSPath(data.parentId)));
        const parentPageDocData = parentPageDoc.data() as DirectoryEntry;
        if (parentPageDocData.owner !== uid) {
            logger.warn("permission-denied:", "you do not own this folder");
            throw new HttpsError("permission-denied", "you do not own this folder");
        }

        const newFolderEntry: DirectoryEntry = {
            id: data.folderId,
            parent: data.parentId,
            owner: uid,
            type: "dir",
            name: data.name,
            revision: 0,
            metadata: {
                fileCount: 0,
                dirCount: 0,
                size: 0,
                timeCreated: Timestamp.now(),
                timeUpdated: Timestamp.now(),
            },
        };

        // write phase
        txn.set(newPageDoc.ref, newFolderEntry);

        const directParentRef = parentFoldersRef[0];
        txn.update(directParentRef, {
            "metadata.timeUpdated": Timestamp.now(),
            "metadata.dirCount": FieldValue.increment(1),
        });
        for (const ref of parentFoldersRef) {
            txn.update(ref, {
                "revision": FieldValue.increment(1),
            });
        }

        return newFolderEntry;
    });
});

export const renameFolder = onCall<RenameFolderRequest>
(async (request) => {
    let data: RenameFolderRequest;
    try {
        data = RenameFolderRequestSchema.parse(request.data);
    } catch (err) {
        logger.warn("invalid-argument:", `${err}`);
        throw new HttpsError("invalid-argument", `${err}`);
    }
    const uid = request.auth?.uid;
    if (!uid) {
        logger.warn("unauthenticated:", "missing authentication");
        throw new HttpsError("unauthenticated", "missing authentication");
    }
    const firestore = admin.firestore();
    return await firestore.runTransaction(async (txn: Transaction) => {
        // read phase
        const foldersRef = await getAndLockAllParentNodeRef(txn, data.folderId);
        const targetRef = foldersRef[0];
        const targetData = (await txn.get(targetRef)).data() as DirectoryEntry | FileEntry;
        if (targetData.type !== "dir") {
            logger.warn("failed-precondition", data.folderId, "target is not a directory");
            throw new HttpsError("failed-precondition", "target is not a directory");
        }
        if (targetData.owner !== uid) {
            logger.warn("permission-denied:", "you do not own this folder");
            throw new HttpsError("permission-denied", "you do not own this folder");
        }
        if (targetData.name === "$root") {
            logger.warn("failed-precondition", data.folderId, "target is the root directory");
            throw new HttpsError("failed-precondition", "target is the root directory");
        }

        // write phase
        const updatedFolder = {
            ...targetData,
            name: data.newName,
            revision: targetData.revision + 1,
            metadata: {
                ...targetData.metadata,
                timeUpdated: Timestamp.now(),
            },
        };
        txn.set(targetRef, updatedFolder);

        for (const ref of foldersRef.slice(1)) {
            txn.update(ref, {
                "revision": FieldValue.increment(1),
            });
        }
        return updatedFolder;
    });
});

function validateMoveRequest(current: DirectoryEntry | FileEntry, target: DirectoryEntry | FileEntry, uid: string) {
    if (current.type !== "dir") {
        logAndThrow("invalid-argument", "can only move a directory");
    }
    if (current.name === "$root") {
        logAndThrow("invalid-argument", "cannot move the root directory");
    }
    if (current.owner !== uid) {
        logAndThrow("permission-denied", "does not own the resource");
    }
    if (target.type !== "dir") {
        logAndThrow("invalid-argument", "can only move to directory");
    }
    if (target.owner !== uid) {
        logAndThrow("permission-denied", "does not own the resource");
    }
}

function intersection<T>(setA: Set<T>, setB: Set<T>) {
    let intersect = new Set<T>();
    for (let elem of setB) {
        if (setA.has(elem)) {
            intersect.add(elem);
        }
    }
    return intersect;
}

function difference<T>(setA: Set<T>, setB: Set<T>) {
    let diff = new Set<T>(setA);
    for (let elem of setB) {
        diff.delete(elem);
    }
    return diff;
}

export const moveFolder = onCall<MoveFolderRequest>
(async (request) => {
    let data: MoveFolderRequest;
    try {
        data = MoveFolderRequestSchema.parse(request.data);
    } catch (err) {
        logAndThrow("invalid-argument", `${err}`);
    }
    const uid = request.auth?.uid;
    if (!uid) {
        logAndThrow("unauthenticated", "missing authentication");
    }
    const firestore = admin.firestore();
    return await firestore.runTransaction(async (txn: Transaction) => {
        // read phase
        const currentFolderSnapshot = await txn.get(firestore.doc(getFirestoreFSPath(data.folderId)));
        if (!currentFolderSnapshot.exists) {
            logAndThrow("not-found", "current folder does not exists");
        }
        const currentFolderData = currentFolderSnapshot.data() as DirectoryEntry | FileEntry;
        const destinationFolderSnapshot = await txn.get(firestore.doc(getFirestoreFSPath(data.newParentId)));
        if (!destinationFolderSnapshot.exists) {
            logAndThrow("not-found", "target folder does not exists");
        }
        const targetFolderData = destinationFolderSnapshot.data() as DirectoryEntry | FileEntry;
        validateMoveRequest(currentFolderData, targetFolderData, uid!);

        const fromRefs = await getAndLockAllParentNodeRef(txn, currentFolderData.parent);
        const toRefs = await getAndLockAllParentNodeRef(txn, data.newParentId);

        const fromIds = new Set(fromRefs.map(ref => ref.id));
        const toIds = new Set(toRefs.map(ref => ref.id));

        const bothParents = intersection(fromIds, toIds);
        const fromParents = difference(fromIds, toIds);
        const toParents = difference(toIds, fromIds);

        // write phase
        txn.update(currentFolderSnapshot.ref, {
            parent: data.newParentId,
        });
        txn.update(fromRefs[0], {
            "metadata.dirCount": FieldValue.increment(-1),
            "metadata.timeUpdated": Timestamp.now(),
        });
        txn.update(toRefs[0], {
            "metadata.dirCount": FieldValue.increment(1),
            "metadata.timeUpdated": Timestamp.now(),
        });

        for (const fromRef of fromRefs) {
            if (fromParents.has(fromRef.id)) {
                txn.update(fromRef, {
                    "revision": FieldValue.increment(1),
                    "metadata.size": FieldValue.increment(-currentFolderData.metadata.size),
                });
            }
        }
        for (const toRef of toRefs) {
            if (toParents.has(toRef.id)) {
                txn.update(toRef, {
                    "revision": FieldValue.increment(1),
                    "metadata.size": FieldValue.increment(currentFolderData.metadata.size),
                });
            }
        }
        for (const parentRef of fromRefs) {
            if (bothParents.has(parentRef.id)) {
                txn.update(parentRef, {
                    "revision": FieldValue.increment(1),
                });
            }
        }

        return {
            ...currentFolderData,
            parent: data.newParentId,
        };
    });
});

async function recursiveDeleteSubDirectory(firestore: admin.firestore.Firestore, writer: BulkWriter, id: FolderId) {
    while (true) {
        const query = firestore.collection("filesystem")
            .where("parent", "==", id)
            .limit(100);
        const result = await query.get();
        if (result.size === 0) {
            break;
        }
        for (const doc of result.docs) {
            const docData = doc.data() as DirectoryEntry | FileEntry;
            if (docData.type === "file") {
                writer.delete(doc.ref);
            } else {
                await recursiveDeleteSubDirectory(firestore, writer, docData.id);
                writer.delete(doc.ref);
            }
        }
    }
}

function validateDeleteRequest(folderData: DirectoryEntry | FileEntry, uid: string) {
    if (folderData.type !== "dir") {
        logAndThrow("invalid-argument", `target must be a folder`);
    }
    if (folderData.owner !== uid) {
        logAndThrow("permission-denied", "does not own the target folder");
    }
}

export const deleteFolder = onCall<DeleteFolderRequest>
(async (request) => {
    let data: DeleteFolderRequest;
    try {
        data = DeleteFolderRequestSchema.parse(request.data);
    } catch (err) {
        logAndThrow("invalid-argument", `${err}`);
    }
    const uid = request.auth?.uid;
    if (!uid) {
        logAndThrow("unauthenticated", "missing authentication");
    }

    const firestore = admin.firestore();
    const writer = firestore.bulkWriter();

    const folderData = await firestore.runTransaction(async (txn: Transaction) => {
        // read phase
        const folderRef = firestore.doc(getFirestoreFSPath(data!.folderId));
        const folderSnapshot = await txn.get(folderRef);
        if (!folderSnapshot.exists) {
            logAndThrow("not-found", "folder is not found");
        }
        const folderData = folderSnapshot.data() as DirectoryEntry | FileEntry;
        validateDeleteRequest(folderData, uid!);
        const parentRefs = await getAndLockAllParentNodeRef(txn, folderData.parent);

        // write phase
        txn.delete(folderRef);

        if (parentRefs.length > 0) {
            const directParent = parentRefs[0];
            txn.update(directParent, {
                "metadata.dirCount": FieldValue.increment(-1),
            });
        }
        for (const parent of parentRefs) {
            txn.update(parent, {
                "revision": FieldValue.increment(1),
                "metadata.size": FieldValue.increment(-folderData.metadata.size),
            });
        }
        return folderData;
    });

    await recursiveDeleteSubDirectory(firestore, writer, data!.folderId);
    await writer.close();

    return folderData;
});
