<script lang="ts">
    import {Button} from '$lib/components/ui/button';
    import * as ContextMenu from '$lib/components/ui/context-menu';
    import {toast} from "svelte-sonner";
    import {DownloadIcon, PencilLineIcon, Trash2Icon} from "lucide-svelte";

    export let id: string;
    export let name: string;
    export let deleteHandler: (id: string) => void;
</script>

<ContextMenu.Root>
    <ContextMenu.Trigger>
        <Button variant="ghost" class="h-8 px-2 relative justify-start font-normal w-full">
            <span class="text-ellipsis overflow-hidden">{name}</span>
        </Button>
    </ContextMenu.Trigger>
    <ContextMenu.Content>
        <ContextMenu.Item on:click={() => toast('not implemented yet')}>
            <div class="flex items-center font-normal">
                <DownloadIcon class="mr-2 text-foreground-alt sq-3"/>
                Download
            </div>
        </ContextMenu.Item>
        <ContextMenu.Item on:click={() => toast('not implemented yet')}>
            <div class="flex items-center font-normal">
                <PencilLineIcon class="mr-2 text-foreground-alt sq-3"/>
                Rename
            </div>
        </ContextMenu.Item>
        <ContextMenu.Item on:click={() => deleteHandler(id)}>
            <div class="flex items-center text-red-600 font-normal">
                <Trash2Icon class="mr-2 text-foreground-alt sq-3"/>
                Delete
            </div>
        </ContextMenu.Item>
    </ContextMenu.Content>
</ContextMenu.Root>