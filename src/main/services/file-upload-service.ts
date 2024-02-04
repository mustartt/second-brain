import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

import {type IpcMain} from 'electron';

export class FileUploadService {
    constructor(ipc: IpcMain) {
        ipc.on('file:upload', async (_, file: string, token: string) => {
            await this.uploadFile(
                'http://127.0.0.1:5001/speedy-atom-413006/us-central1/ingest_file',
                file, token
            );
        });
    }

    async uploadFile(url: string, filePath: string, token: string): Promise<void> {
        const formData = new FormData();
        formData.append('file', fs.createReadStream(filePath));
        try {
            const response = await axios.post(url, formData, {
                headers: {
                    ...formData.getHeaders(),
                    'Authorization': `Bearer ${token}`
                },
                maxContentLength: Infinity,
                maxBodyLength: Infinity
            });
            console.log('File uploaded successfully:', response.data);
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    }
}

