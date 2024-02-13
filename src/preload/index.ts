import {contextBridge, ipcRenderer} from 'electron';
import {electronAPI} from '@electron-toolkit/preload';
import {API, type UploadProgress, type UploadProgressCallback} from "../renderer/src/env";
import {v4 as uuidv4} from "uuid";

const fileSubscribers = new Map<string, UploadProgressCallback>();
let isFileSubscriberRegistered = false;

const api: API = {
    startFileUpload: (file, token, callback) => {
        // const fileId = uuidv4();
        // ipcRenderer.send('file:upload', fileId, file, token);
        // if (callback) {
        //     fileSubscribers.set(fileId, callback);
        // }
        // if (!isFileSubscriberRegistered) {
        //     isFileSubscriberRegistered = true;
        //     ipcRenderer.on('file:progress', (event, arg: UploadProgress) => {
        //         const observer = fileSubscribers.get(arg.id);
        //         if (observer) {
        //             observer(arg);
        //             if (arg.status === 'completed') {
        //                 fileSubscribers.delete(arg.i);
        //             }
        //         }
        //     });
        // }
    }
};

if (process.contextIsolated) {
    try {
        contextBridge.exposeInMainWorld('electron', electronAPI);
        contextBridge.exposeInMainWorld('api', api);
    } catch (error) {
        console.error(error);
    }
} else {
    // @ts-ignore (define in dts)
    window.electron = electronAPI;
    // @ts-ignore (define in dts)
    window.api = api;
}
