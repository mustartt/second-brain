<script lang="ts">
    import {Button} from '$lib/components/ui/button';
    import * as ContextMenu from '$lib/components/ui/context-menu';
    import {toast} from "svelte-sonner";
    import {DownloadIcon, PencilLineIcon, Trash2Icon} from "lucide-svelte";
    import {appState} from "$lib/store/appstore";
    import {deleteChat, switchToActiveChat} from "$lib/services/chat-service";
    import {cn} from "$lib/utils";

    export let id: string;
    export let name: string;
    export let isActive: boolean = false;

    function deleteHandler() {
        deleteChat(id);
    }

    function openHistoryHandler() {
        switchToActiveChat(id);
    }
</script>

<ContextMenu.Root>
    <ContextMenu.Trigger>
        <Button variant="ghost"
                class={cn("h-8 px-2 relative justify-start font-normal w-full", isActive ? 'underline' : '')}
                on:click={openHistoryHandler}>
            <span class={cn('text-ellipsis overflow-hidden', isActive ? 'text-foreground' : 'text-muted-foreground')}>
                {name}
            </span>
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
        <ContextMenu.Item on:click={deleteHandler}>
            <div class="flex items-center text-red-600 font-normal">
                <Trash2Icon class="mr-2 text-foreground-alt sq-3"/>
                Delete
            </div>
        </ContextMenu.Item>
    </ContextMenu.Content>
</ContextMenu.Root>
