<script lang="ts">
    import {ChevronRightIcon, FolderIcon, FolderOpenIcon} from 'lucide-svelte';

    export let path: string[];
</script>

<div class="flex items-center text-muted-foreground">
    {#each path as item, index}
        {#if index + 1 !== path.length}
            <span class="flex items-center font-semibold hover:bg-muted py-1 px-2 rounded">
                <FolderOpenIcon class="w-4 h-4 mr-2"/>
                {item}
            </span>
            <ChevronRightIcon class="h-6 w-6 mt-0.5 mr-1"/>
        {:else }
            <span class="flex items-center font-semibold text-foreground hover:bg-muted py-1 px-2 rounded">
                <FolderIcon class="w-4 h-4 mr-2"/>
                {item}
            </span>
        {/if}
    {/each}
</div>
