import * as admin from "firebase-admin";
import {
    createDataSource,
    renameDataSource,
    deleteDataSource,
} from "./datasource";
import {
    createFolder,
    renameFolder,
    moveFolder,
    deleteFolder,
} from "./folder-actions";

admin.initializeApp();

export {
    createDataSource,
    renameDataSource,
    deleteDataSource,
    createFolder,
    renameFolder,
    moveFolder,
    deleteFolder,
};
