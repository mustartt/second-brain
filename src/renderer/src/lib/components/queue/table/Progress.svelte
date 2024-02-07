<script lang="ts">
    import type {UploadProgress} from "../../../../env";
    import {Progress} from "$lib/components/ui/progress";
    import {AlertCircleIcon, CheckCircle2, CheckCircle2Icon, Loader2Icon} from "lucide-svelte";

    export let value: UploadProgress | null;
</script>

<div class="flex flex-row items-center max-w-36">
    {#if value}
        {#if value.status === 'completed'}
            <CheckCircle2Icon class="flex-none w-5 h-5 mr-2 text-green-600"/>
            <span class="font-semibold mt-0.5">Uploaded</span>
        {:else if value.status === 'failed'}
            <AlertCircleIcon class="flex-none w-5 h-5 mr-2 text-red-600"/>
            <span class="font-semibold mt-0.5 text-nowrap text-ellipsis overflow-x-hidden">
                {value.error}
            </span>
        {:else}
            <Progress value={value.progress * 100} max={100} class="h-2"/>
        {/if}
    {:else }
        <Loader2Icon class="w-5 h-5 animate-spin mr-2"/>
        <span class="font-semibold mt-0.5">Waiting...</span>
    {/if}
</div>
