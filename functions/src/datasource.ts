import {HttpsError, onCall} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import {firestore} from "firebase-admin";
import {Timestamp} from "firebase-admin/firestore";

import {
    CreateDataSourceRequest,
    CreateDataSourceRequestSchema,
    DataSource,
    DataSourceResponse, DeleteDataSourceRequest, DeleteDataSourceRequestSchema,
    DirectoryEntry, RenameDataSourceRequest, RenameDataSourceRequestSchema,
} from "./common";
import {v4 as uuidv4} from "uuid";

export async function createNewDataSource(data: CreateDataSourceRequest, uid: string) {
    const firestore = admin.firestore();
    return await firestore.runTransaction(async (txn: firestore.Transaction) => {
        const docRef = firestore.doc(`datasource/${data.id}`);
        const doc = await txn.get(docRef);
        if (doc.exists) {
            logger.warn("already-exists:", data.id, "datasource with the same id already exists");
            throw new HttpsError("already-exists", "datasource with the same id already exists");
        }
        if (data.type !== "document") {
            logger.warn("unimplemented", data.id, "type not implemented");
            throw new HttpsError("unimplemented", "type not implemented");
        }

        const rootFolderID = uuidv4();
        const newDataSource: DataSource = {
            id: data.id,
            name: data.name,
            owner: uid,
            root: rootFolderID,
            type: data.type,
        };
        const newRootPage: DirectoryEntry = {
            id: rootFolderID,
            type: "dir",
            name: "$root",
            owner: uid,
            parent: data.id,
            revision: 0,
            metadata: {
                dirCount: 0, fileCount: 0, size: 0,
                timeCreated: Timestamp.now(),
                timeUpdated: Timestamp.now(),
            },
        };

        const rootPageRef = firestore.doc(`filesystem/${rootFolderID}`);
        txn.set(docRef, newDataSource);
        txn.set(rootPageRef, newRootPage);

        return newDataSource;
    });
}

export const createDefaultDataSourceForNewUsers = functions.auth.user().onCreate(
    async (user, context) => {
        const newId = uuidv4();
        await createNewDataSource({
            name: "Default",
            type: "document",
            id: newId,
        }, user.uid);
        logger.info("Created default datasource for user", user.uid, "source id", newId);
    });

export const createDataSource
    = onCall<CreateDataSourceRequest>(async (request): Promise<DataSourceResponse> => {
    let data: CreateDataSourceRequest;
    try {
        data = CreateDataSourceRequestSchema.parse(request.data);
    } catch (err) {
        logger.warn("invalid-argument:", `${err}`);
        throw new HttpsError("invalid-argument", `${err}`);
    }
    const uid = request.auth?.uid;
    if (!uid) {
        logger.warn("unauthenticated:", data.id, "missing authentication");
        throw new HttpsError("unauthenticated", "missing authentication");
    }

    return await createNewDataSource(data, uid);
});

export const renameDataSource
    = onCall<RenameDataSourceRequest>(async (request) => {
    let data: RenameDataSourceRequest;
    try {
        data = RenameDataSourceRequestSchema.parse(request.data);
    } catch (err) {
        logger.warn("invalid-argument:", `${err}`);
        throw new HttpsError("invalid-argument", `${err}`);
    }
    const uid = request.auth?.uid;
    if (!uid) {
        logger.warn("unauthenticated:", data.id, "missing authentication");
        throw new HttpsError("unauthenticated", "missing authentication");
    }

    const firestore = admin.firestore();

    return await firestore.runTransaction(async (txn: firestore.Transaction) => {
        const docRef = firestore.doc(`datasource/${data.id}`);
        const doc = await txn.get(docRef);
        if (!doc.exists) {
            logger.warn("not-found", data.id, "datasource does not exists");
            throw new HttpsError("not-found", "datasource does not exists");
        }
        const owner = (doc.data() as DataSource).owner;
        if (owner !== uid) {
            logger.warn("permission-denied", data.id, "user does not own this datasource");
            throw new HttpsError("permission-denied", "user does not own this datasource");
        }

        txn.update(docRef, {
            name: data.newName,
        });
        return {
            ...doc.data() as DataSource,
            name: data.newName,
        };
    });
});

export const deleteDataSource
    = onCall<DeleteDataSourceRequest>(async (request) => {
    let data: DeleteDataSourceRequest;
    try {
        data = DeleteDataSourceRequestSchema.parse(request.data);
    } catch (err) {
        logger.warn("invalid-argument:", `${err}`);
        throw new HttpsError("invalid-argument", `${err}`);
    }
    const uid = request.auth?.uid;
    if (!uid) {
        logger.warn("unauthenticated:", data.id, "missing authentication");
        throw new HttpsError("unauthenticated", "missing authentication");
    }

    const firestore = admin.firestore();

    // todo: clean up orphaned filesystem
    return await firestore.runTransaction(async (txn: firestore.Transaction) => {
        const docRef = firestore.doc(`datasource/${data.id}`);
        const doc = await txn.get(docRef);
        if (!doc.exists) {
            logger.warn("not-found", data.id, "datasource does not exists");
            throw new HttpsError("not-found", "datasource does not exists");
        }
        const owner = (doc.data() as DataSource).owner;
        if (owner !== uid) {
            logger.warn("permission-denied", data.id, "user does not own this datasource");
            throw new HttpsError("permission-denied", "user does not own this datasource");
        }
        txn.delete(docRef);
        return doc.data() as DataSource;
    });
});
