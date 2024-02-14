<script lang="ts">
    import type {AgentTask} from "$lib/store/chat-store";
    import AgentTaskTreeItem from "$lib/components/chat/AgentTaskTreeItem.svelte";

    export let tree: AgentTask | null;
</script>

{#if tree !== null}
    <div class="flex flex-col pr-24">
        <AgentTaskTreeItem node={tree}/>
    </div>
{/if}
