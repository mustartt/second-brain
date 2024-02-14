<script lang="ts">
    import type {AgentTask} from "$lib/store/chat-store";
    import {CheckCircle2Icon, Loader2Icon} from "lucide-svelte";

    export let node: AgentTask;
</script>

<div class="flex flex-col">
    <div class="flex justify-between items-center">
        <span class="flex items-center">
            {#if !node.isComplete}
                <Loader2Icon class="text-foreground w-4 h-4 animate-spin"/>
            {:else}
                <CheckCircle2Icon class="text-foreground w-4 h-4"/>
            {/if}
            <span class="text-muted-foreground ml-1 -mt-[2px] text-sm">
                task: {node.type} <span class="text-xs text-zinc-600">{node.id}</span>
            </span>
        </span>
        {#if node.isComplete && node.duration !== 0}
            <span class="text-muted-foreground text-sm">{node.duration.toFixed(2)}s</span>
        {/if}
    </div>
    <div class="flex flex-col ml-6">
        {#each node.children as child}
            <svelte:self node={child}/>
        {/each}
    </div>
</div>



