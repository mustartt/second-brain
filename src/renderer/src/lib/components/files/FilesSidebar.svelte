<script lang="ts">
    import {datasourceState} from "$lib/store/files-store";
    import {onDestroy} from "svelte";
    import type {DataSource} from "$lib/services/file-service";
    import {Loader2Icon} from "lucide-svelte";
    import FileDataSource from "$lib/components/files/FileDataSource.svelte";

    let isLoading: boolean;
    let sources: DataSource[];

    const sourceUnsub = datasourceState.subscribe((value) => {
        isLoading = value.isLoading;
        sources = value.sources;
    });

    onDestroy(sourceUnsub);
</script>

<div class="flex flex-col pr-2">
    <div class="flex-0 flex flex-row justify-between items-center mb-1">
        <h1 class="text-lg tracking-tight font-semibold mb-0.5 text-nowrap">Data Sources</h1>
    </div>
    <div class="flex-grow flex flex-col min-w-40 max-w-44 overflow-y-auto overflow-x-hidden">
        {#if isLoading}
            <div class="flex mt-12 w-full justify-center items-center">
                <Loader2Icon class="w-5 h-5 animate-spin text-muted-foreground"/>
            </div>
        {:else}
            {#each sources as item}
                <FileDataSource item={item}/>
            {/each}
        {/if}
    </div>
</div>
