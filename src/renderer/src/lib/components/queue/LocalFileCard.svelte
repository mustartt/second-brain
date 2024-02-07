<script lang="ts">
    import FileDrop from '$lib/components/queue/FileDrop.svelte';
    import * as Card from '$lib/components/ui/card';
    import {getAuthToken} from "$lib/services/firebase-service";
    import {defaultUploadPool, fileUploadCompletionPool} from "$lib/services/upload-service";
    import {fileQueueState} from "$lib/store/file-queue";

    async function handler(files: File[]) {
        for (const file of files) {
            const id = fileQueueState.addDocument(file.name);
            defaultUploadPool.submit(async () => {
                const token = await getAuthToken();
                const status = await new Promise<'completed' | 'failed'>((resolve) => {
                    window.api.startFileUpload(file.path, token, (progress) => {
                        fileQueueState.updateDocument(id, progress);
                        if (progress.status === 'completed' || progress.status === 'failed') {
                            resolve(progress.status);
                        }
                    });
                });
                if (status === 'completed') {
                    setTimeout(() => {
                        fileUploadCompletionPool.submit(async () => {
                            fileQueueState.removeDocument(id);
                            await new Promise(resolve => setTimeout(resolve, 500));
                        });
                    }, 10_000);
                }
            });
        }
    }
</script>
<Card.Root>
    <Card.Header>
        <Card.Title>Individual Files</Card.Title>
        <Card.Description>
            Drag you individual files here to quickly add them to your index.
            You can add as many as you want. Max Size 1GB.
        </Card.Description>
    </Card.Header>
    <Card.Content>
        <div class="flex justify-center items-center">
            <FileDrop handler={handler}/>
        </div>
    </Card.Content>
</Card.Root>
