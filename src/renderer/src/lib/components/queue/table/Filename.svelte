<script lang="ts">
    import {FileIcon} from "lucide-svelte";

    export let name: string;
</script>

<div class="flex flex-row justify-start items-center">
    <FileIcon class="w-5 h-5 mr-2 text-muted-foreground"/>
    <span class="text-nowrap font-semibold mt-0.5 max-w-48 overflow-x-hidden text-ellipsis">
        {name}
    </span>
</div>
