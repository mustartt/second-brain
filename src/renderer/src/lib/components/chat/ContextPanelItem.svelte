<script lang="ts">
    import * as Card from "$lib/components/ui/card";
    import type {ContextSource} from "$lib/store/chat-store";
    import {FileIcon} from "lucide-svelte";

    export let item: ContextSource;
    $: filename = item.metadata.get('filename') || 'Unknown file';

</script>

<Card.Root>
    <Card.Header>
        <Card.Title class="flex justify-between items-center overflow-hidden">
            <span class="flex-auto flex items-center min-w-0 pr-2">
                <FileIcon class="flex-shrink-0 text-muted-foreground mr-2"/>
                <span class="flex-grow text-ellipsis overflow-hidden text-nowrap">{filename}</span>
            </span>
            <span class="flex-0 text-muted-foreground">
                {#if item.score !== 0}
                    {(item.score * 100).toPrecision(3)}%
                {/if}
            </span>
        </Card.Title>
    </Card.Header>
    <Card.Content>
        {#each item.content.split('\n') as line}
            <p class="text-sm">{line}</p>
        {/each}
    </Card.Content>
</Card.Root>
