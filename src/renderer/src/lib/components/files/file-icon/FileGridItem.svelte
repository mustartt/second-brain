<script lang="ts">
    import type {FileEntry, FileStatus} from "$lib/services/types";
    import {toast} from "svelte-sonner";
    import {FilePenIcon, FolderPenIcon, FolderTreeIcon, Trash2Icon} from "lucide-svelte";
    import * as ContextMenu from "$lib/components/ui/context-menu";

    export let file: FileEntry;

    const statusTextMap: Record<FileStatus, string> = {
        created: "created",
        queued: "queued",
        processing: "processing",
        processed: "",
        error: "error",
    };
</script>

<!--on:dragenter={() => console.log('enter', name)}-->
<!--on:dragleave={() => console.log('leave', name)}-->
<!--on:drop={(event) => console.log('drop', name, event)}-->

<ContextMenu.Root>
    <ContextMenu.Trigger>
        <div role="cell"
             tabindex="0"
             class="flex flex-col items-center hover:bg-muted cursor-default rounded">
            <img src="src/assets/file-viewer/document-12.png" alt="file icon"
                 class="aspect-auto w-12">
            <span class="text-wrap text-center max-w-24 overflow-x-hidden cursor-text text-ellipsis">
                {file.name}
            </span>
            <span class="text-center text-xs text-muted-foreground">
                {statusTextMap[file.status]}
            </span>
        </div>
    </ContextMenu.Trigger>
    <ContextMenu.Content>
        <ContextMenu.Item on:click={() => toast.info('not yet implemented')}>
            <FilePenIcon class="w-4 h-4 mr-2 text-muted-foreground"/>
            Rename
        </ContextMenu.Item>
        <ContextMenu.Item on:click={() => toast.info('not yet implemented')}>
            <FolderTreeIcon class="w-4 h-4 mr-2 text-muted-foreground"/>
            Move
        </ContextMenu.Item>
        <ContextMenu.Item on:click={() => toast.info('not yet implemented')}
                          class="text-red-700">
            <Trash2Icon class="w-4 h-4 mr-2"/>
            Delete
        </ContextMenu.Item>
    </ContextMenu.Content>
</ContextMenu.Root>
