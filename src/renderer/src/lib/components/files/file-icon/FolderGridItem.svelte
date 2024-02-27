<script lang="ts">
    import {deleteFolder, pushDirectoryOnToPath} from "$lib/services/file-viewer-service";
    import * as ContextMenu from "$lib/components/ui/context-menu";
    import type {DirectoryEntry} from "$lib/services/types";
    import {FolderPenIcon, FolderTreeIcon, Trash2Icon} from "lucide-svelte";
    import {toast} from "svelte-sonner";
    import RenameFolderDialogue from "$lib/components/files/RenameFolderDialogue.svelte";

    export let folder: DirectoryEntry;
    let renameDialogueOpen = false;

    async function handleDoubleClick() {
        await pushDirectoryOnToPath(folder);
    }

    async function handleDelete() {
        toast.promise(deleteFolder(folder.id), {
            loading: "Deleting folder " + folder.name,
            success: "Deleted folder " + folder.name,
            error: "Failed to delete folder " + folder.name,
        });
    }
</script>

<!--on:dragenter={() => console.log('enter', folder.id, folder.name)}-->
<!--on:dragleave={() => console.log('leave', folder.id, folder.name)}-->
<!--on:drop={(event) => console.log('drop', folder.id, folder.name, event)}-->

<RenameFolderDialogue
    folder={folder}
    open={renameDialogueOpen}
/>

<ContextMenu.Root>
    <ContextMenu.Trigger>
        <div on:dblclick={handleDoubleClick}
             role="cell"
             tabindex="0"
             class="flex flex-col items-center hover:bg-muted cursor-default rounded">
            <img src="src/assets/file-viewer/folder-12.png" alt="file icon"
                 class="aspect-auto w-12">
            <span class="text-center text-wrap max-w-24 overflow-x-hidden cursor-text text-ellipsis">
                {folder.name}
            </span>
        </div>
    </ContextMenu.Trigger>
    <ContextMenu.Content>
        <ContextMenu.Item on:click={() => (renameDialogueOpen = true)}>
            <FolderPenIcon class="w-4 h-4 mr-2 text-muted-foreground"/>
            Rename
        </ContextMenu.Item>
        <ContextMenu.Item on:click={() => toast.info('not yet implemented')}>
            <FolderTreeIcon class="w-4 h-4 mr-2 text-muted-foreground"/>
            Move
        </ContextMenu.Item>
        <ContextMenu.Item on:click={handleDelete}
                          class="text-red-700">
            <Trash2Icon class="w-4 h-4 mr-2"/>
            Delete
        </ContextMenu.Item>
    </ContextMenu.Content>
</ContextMenu.Root>
