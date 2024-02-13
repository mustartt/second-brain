// import axios from 'axios';
// import FormData from 'form-data';
// import fs from 'fs';
//
// import {ipcMain, type IpcMain, type WebContents} from 'electron';
// import {FileUploadID, UploadProgress} from "../../renderer/src/env";
//
// export class FileUploadService {
//     private ipc: IpcMain;
//     private webcontent: WebContents;
//
//     constructor(ipc: IpcMain, webContents: WebContents) {
//         this.ipc = ipc;
//         this.webcontent = webContents;
//         this.register();
//     }
//
//     register() {
//         this.ipc.on('file:upload', async (_,
//                                           id: FileUploadID, file: string, token: string,) => {
//             await this.uploadFile(id,
//                 'https://us-central1-speedy-atom-413006.cloudfunctions.net/ingest_file',
//                 file, token
//             );
//         });
//     }
//
//     emitUploadStatus(status: UploadProgress) {
//         this.webcontent.send('file:progress', status);
//     }
//
//     async uploadFile(id: FileUploadID, url: string, filePath: string, token: string): Promise<void> {
//         this.emitUploadStatus({
//             id, status: 'queued',
//             error: null,
//             progress: 0,
//             rate: 0
//         });
//
//         const formData = new FormData();
//         formData.append('file', fs.createReadStream(filePath));
//         try {
//             const response = await axios.post(url, formData, {
//                 headers: {
//                     ...formData.getHeaders(),
//                     'Authorization': `Bearer ${token}`
//                 },
//                 maxContentLength: Infinity,
//                 maxBodyLength: Infinity,
//                 onUploadProgress: (event) => {
//                     this.emitUploadStatus({
//                         id, status: 'uploading',
//                         error: null,
//                         progress: event.progress || 0,
//                         rate: event.rate || 0,
//                     });
//                 }
//             });
//             this.emitUploadStatus({
//                 id, status: 'completed',
//                 error: null,
//                 progress: 1,
//                 rate: 0,
//             });
//         } catch (error) {
//             const errorMessage = error instanceof Error ? error.message : 'Unknown Error';
//             this.emitUploadStatus({
//                 id, status: 'failed',
//                 error: errorMessage,
//                 progress: 1,
//                 rate: 0,
//             });
//             console.error('Error uploading file:', id, error);
//         }
//     }
// }
//
