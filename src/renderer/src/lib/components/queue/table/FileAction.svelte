<script lang="ts">
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
    import {MoreHorizontalIcon} from "lucide-svelte";
    import {Button} from "$lib/components/ui/button";
    import {toast} from "svelte-sonner";
    import {defaultUploadPool} from "$lib/services/upload-service";
    import {fileQueueState} from "$lib/store/file-queue";

    export let id: string;

    function handleCancel() {
        toast.info('not yet implemented');
    }

    function handleRetry() {
        toast.info('not yet implemented');
    }

    function handleDelete() {
        defaultUploadPool.cancel(id);
        fileQueueState.removeDocument(id);
    }
</script>

<DropdownMenu.Root>
    <DropdownMenu.Trigger>
        <MoreHorizontalIcon/>
    </DropdownMenu.Trigger>
    <DropdownMenu.Content>
        <DropdownMenu.Group>
            <DropdownMenu.Item on:click={handleCancel}>
                Cancel
            </DropdownMenu.Item>
            <DropdownMenu.Item on:click={handleDelete}>
                Delete
            </DropdownMenu.Item>
            <DropdownMenu.Item on:click={handleRetry}>
                Retry
            </DropdownMenu.Item>
        </DropdownMenu.Group>
    </DropdownMenu.Content>
</DropdownMenu.Root>
