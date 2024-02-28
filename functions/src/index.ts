import * as admin from "firebase-admin";
import {
    createDataSource,
    renameDataSource,
    deleteDataSource,
    createDefaultDataSourceForNewUsers,
} from "./datasource";
import {
    createFolder,
    renameFolder,
    moveFolder,
    deleteFolder,
} from "./folder-actions";
import {ingestFile} from "./ingest";

admin.initializeApp();

export {
    createDataSource,
    renameDataSource,
    deleteDataSource,
    createDefaultDataSourceForNewUsers,
    createFolder,
    renameFolder,
    moveFolder,
    deleteFolder,
    ingestFile,
};
