<script lang="ts">
    import FileDrop from '$lib/components/queue/FileDrop.svelte';
    import * as Card from '$lib/components/ui/card';

    import {createFileUpload} from "$lib/services/upload-service";

    async function handler(files: File[]) {
        for (const file of files) {
            createFileUpload(file);
        }
    }
</script>
<Card.Root>
    <Card.Header>
        <Card.Title>Individual Files</Card.Title>
        <Card.Description>
            Drag individual files here to quickly add them to your index.
            You can add as many as you want. Max Size 1GB.
        </Card.Description>
    </Card.Header>
    <Card.Content>
        <div class="flex justify-center items-center">
            <FileDrop handler={handler}/>
        </div>
    </Card.Content>
</Card.Root>
