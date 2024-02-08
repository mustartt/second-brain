<script lang="ts">
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
    import {
        BanIcon,
        MoreHorizontalIcon,
        PauseCircleIcon,
        PlayCircleIcon,
        StopCircleIcon,
        Trash2Icon
    } from "lucide-svelte";
    import {Button} from "$lib/components/ui/button";
    import {cancelFileUpload, deleteFileUpload, pauseFileUpload, resumeFileUpload} from "$lib/services/upload-service";
    import type {FileUploadStatus} from "$lib/store/file-queue";

    export let id: string;
    export let status: FileUploadStatus;

    $: showCancel = status === 'uploading';
    $: showPause = status === 'uploading';
    $: showResume = status === 'paused';
</script>

<DropdownMenu.Root>
    <DropdownMenu.Trigger>
        <MoreHorizontalIcon/>
    </DropdownMenu.Trigger>
    <DropdownMenu.Content>
        <DropdownMenu.Group>
            <DropdownMenu.Item on:click={() => deleteFileUpload(id)}>
                <div class="flex justify-start items-center text-red-600">
                    <Trash2Icon class="w-5 h-5 mr-2"/>
                    <span class="font-semibold mb-0.5">Delete</span>
                </div>
            </DropdownMenu.Item>
            {#if showCancel}
                <DropdownMenu.Item on:click={() => cancelFileUpload(id)}>
                    <div class="flex justify-start items-center">
                        <BanIcon class="w-5 h-5 mr-2"/>
                        <span class="font-semibold mb-0.5">Cancel</span>
                    </div>
                </DropdownMenu.Item>
            {/if}
            {#if showPause}
                <DropdownMenu.Item on:click={() => pauseFileUpload(id)}>
                    <div class="flex justify-start items-center">
                        <StopCircleIcon class="w-5 h-5 mr-2"/>
                        <span class="font-semibold mb-0.5">Pause</span>
                    </div>
                </DropdownMenu.Item>
            {/if}
            {#if showResume}
                <DropdownMenu.Item on:click={() => resumeFileUpload(id)}>
                    <div class="flex justify-start items-center text-green-600">
                        <PlayCircleIcon class="w-5 h-5 mr-2"/>
                        <span class="font-semibold mb-0.5">Resume</span>
                    </div>
                </DropdownMenu.Item>
            {/if}
        </DropdownMenu.Group>
    </DropdownMenu.Content>
</DropdownMenu.Root>
