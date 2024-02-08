<script lang="ts">
    import {Progress} from "$lib/components/ui/progress";
    import {AlertCircleIcon, CheckCircle2, CheckCircle2Icon, Loader2Icon} from "lucide-svelte";
    import type {FileUploadProgress} from "$lib/store/file-queue";
    import * as Tooltip from "$lib/components/ui/tooltip";

    export let value: FileUploadProgress;
</script>

<div class="flex flex-row items-center max-w-36">
    {#if value.status === 'queued'}
        <Loader2Icon class="w-5 h-5 animate-spin mr-2"/>
        <span class="font-semibold mt-0.5">Waiting...</span>
    {:else if value.status === 'completed'}
        <CheckCircle2Icon class="flex-none w-5 h-5 mr-2 text-green-600"/>
        <span class="font-semibold mt-0.5">Uploaded</span>
    {:else if value.status === 'failed'}
        <AlertCircleIcon class="flex-none w-5 h-5 mr-2 text-red-600"/>
        <Tooltip.Root openDelay={200} closeDelay={100}>
            <Tooltip.Trigger>
                <span class="font-semibold mt-0.5">
                    Upload Failed
                </span>
            </Tooltip.Trigger>
            <Tooltip.Content>
                {value.error}
            </Tooltip.Content>
        </Tooltip.Root>
    {:else}
        <Progress value={value.progress * 100} max={100} class="h-2"/>
    {/if}
</div>
