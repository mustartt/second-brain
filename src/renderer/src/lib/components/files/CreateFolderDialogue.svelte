<script lang="ts">
    import * as Dialog from "$lib/components/ui/dialog";
    import {Input} from "$lib/components/ui/input";
    import {Button} from "$lib/components/ui/button";
    import {get} from "svelte/store";
    import {fileViewerState} from "$lib/store/files-store";
    import {toast} from "svelte-sonner";
    import {createFolder} from "$lib/services/file-viewer-service";
    import {Loader2Icon} from "lucide-svelte";

    export let open = true;
    let newFolderName: string = "New Folder";
    let isLoading = false;

    async function createFolderHandler() {
        isLoading = true;
        const viewerState = get(fileViewerState);
        console.log(viewerState);

        const folderId = viewerState?.cursor?.getCurrentPageDetails().id;
        if (!folderId) {
            toast.error("Unexpected error occurred when creating new folder");
            isLoading = false;
            return;
        }
        try {
            await createFolder(folderId, newFolderName);
            toast.info("Created a new folder");
            open = false;
        } catch (err) {
            console.error(err);
            toast.error("Unexpected error occurred when creating new folder");
        } finally {
            isLoading = false;
        }
    }
</script>

<Dialog.Root open={open}>
    <Dialog.Content class="sm:max-w-96">
        <Dialog.Header>
            <Dialog.Title>New Folder</Dialog.Title>
            <Dialog.Description>
                Make a new folder in the current directory. Click create when you're done.
            </Dialog.Description>
        </Dialog.Header>
        <Input id="folder-name" bind:value={newFolderName}/>
        <Dialog.Footer>
            <Button variant="outline"
                    on:click={() => (open = false)}>
                Cancel
            </Button>
            <Button type="submit"
                    disabled={isLoading}
                    on:click={createFolderHandler}>
                {#if isLoading}
                    <Loader2Icon class="w-10 h-5 animate-spin text-muted-foreground"/>
                {:else}
                    <span class="w-10">Create</span>
                {/if}
            </Button>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>
