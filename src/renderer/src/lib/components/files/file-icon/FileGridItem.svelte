<script lang="ts">
    export let name: string = 'New Document';

</script>

<div on:dragenter={() => console.log('enter', name)}
     on:dragleave={() => console.log('leave', name)}
     on:drop={(event) => console.log('drop', name, event)}
     role="cell"
     tabindex="0"
     class="flex flex-col items-center hover:bg-muted cursor-default rounded">
    <img src="src/assets/file-viewer/document-12.png" alt="file icon"
         class="aspect-auto w-12">
    <span class="text-wrap max-w-24 overflow-x-hidden cursor-text text-ellipsis">
        {name}
    </span>
</div>
