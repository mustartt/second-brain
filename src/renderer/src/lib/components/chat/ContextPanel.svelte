<script lang="ts">
    import ContextPanelItem from "$lib/components/chat/ContextPanelItem.svelte";
    import {contextState} from "$lib/store/context-store";
    import {onDestroy} from "svelte";
    import type {ContextSource} from "$lib/store/chat-store";
    import {LibraryIcon} from "lucide-svelte";

    let items: ContextSource[];
    const unsub = contextState.subscribe(value => (items = value));
    onDestroy(unsub);
</script>

<div class="flex h-full flex-col px-4 py-2">
    <div class="flex flex-row justify-between items-center pt-4 pb-4">
        <h1 class="font-bold text-3xl tracking-tight">Context</h1>
    </div>
    <div class="flex flex-col w-full space-y-4 overflow-y-auto pb-32 pr-2">
        {#if items.length > 0}
            {#each items as item}
                <ContextPanelItem item={item}/>
            {/each}
        {:else}
            <div class="flex flex-col justify-center items-center mt-[30vh]">
                <h1 class="text-lg font-semibold">No Active Context</h1>
                <p class="flex items-center text-muted-foreground">
                    Please choose a message with
                    <LibraryIcon class="h-6 w-6 mx-2 text-foreground bg-muted rounded p-1"/>
                    icon
                </p>
            </div>
        {/if}
    </div>
</div>
