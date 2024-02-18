import {contextBridge, ipcRenderer} from 'electron';
import {electronAPI} from '@electron-toolkit/preload';
import {API} from "../renderer/src/env";
import {createHash} from 'crypto';

const api: API = {
    crypto: {
        sha256base64: (input: string): string => {
            const hash = createHash('sha256');
            hash.update(input);
            return hash.digest('base64url');
        }
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
