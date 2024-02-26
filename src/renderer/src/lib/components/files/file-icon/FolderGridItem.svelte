<script lang="ts">
    import {pushDirectoryOnToPath} from "$lib/services/file-viewer-service";
    import type {DirectoryEntry} from "$lib/services/file-service";

    export let folder: DirectoryEntry;

    async function handleDoubleClick() {
        await pushDirectoryOnToPath(folder);
    }

</script>

<div on:dragenter={() => console.log('enter', folder.id, folder.name)}
     on:dragleave={() => console.log('leave', folder.id, folder.name)}
     on:drop={(event) => console.log('drop', folder.id, folder.name, event)}
     on:dblclick={handleDoubleClick}
     role="cell"
     tabindex="0"
     class="flex flex-col items-center hover:bg-muted cursor-default rounded">
    <img src="src/assets/file-viewer/folder-12.png" alt="file icon"
         class="aspect-auto w-12">
    <span class="text-wrap max-w-24 overflow-x-hidden cursor-text text-ellipsis">
        {folder.name}
    </span>
</div>
