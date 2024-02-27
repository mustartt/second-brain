<script lang="ts">
    import * as Dialog from "$lib/components/ui/dialog";
    import {Input} from "$lib/components/ui/input";
    import {Button} from "$lib/components/ui/button";
    import {get} from "svelte/store";
    import {fileViewerState} from "$lib/store/files-store";
    import {toast} from "svelte-sonner";
    import {Loader2Icon} from "lucide-svelte";
    import type {DirectoryEntry} from "$lib/services/types";
    import {renameFolder} from "$lib/services/file-viewer-service";

    export let open = true;
    export let folder: DirectoryEntry;

    let newFolderName: string = folder.name;
    let isLoading = false;

    async function renameHandler() {
        isLoading = true;
        const viewerState = get(fileViewerState);
        console.log(viewerState);

        const folderId = viewerState?.cursor?.getCurrentPageDetails().id;
        if (!folderId) {
            toast.error("Unexpected error occurred when renaming folder");
            isLoading = false;
            return;
        }
        try {
            await renameFolder(folder.id, newFolderName);
            toast.info("Folder renamed");
            open = false;
        } catch (err) {
            console.error(err);
            toast.error("Unexpected error occurred when renaming new folder");
        } finally {
            isLoading = false;
        }
    }
</script>

<Dialog.Root open={open}>
    <Dialog.Content class="sm:max-w-96">
        <Dialog.Header>
            <Dialog.Title>Rename Folder</Dialog.Title>
            <Dialog.Description>
                Rename the current folder. Click rename when you're done.
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
                    on:click={renameHandler}>
                {#if isLoading}
                    <Loader2Icon class="w-14 h-5 animate-spin text-muted-foreground"/>
                {:else}
                    <span class="w-14">Rename</span>
                {/if}
            </Button>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>
