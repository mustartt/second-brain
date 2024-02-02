<script lang="ts">
    import LocalFileCard from "$lib/components/queue/LocalFileCard.svelte";

</script>

<div class="flex flex-col py-2 px-4 h-screen">
    <div class="flex-0 flex flex-row pt-4 pb-4">
        <h1 class="font-bold text-3xl tracking-tight">File Queue</h1>
    </div>
    <div class="flex-1 flex flex-row overflow-x-hidden space-x-2">
        <div class="flex flex-col w-1/2">
            <LocalFileCard/>
        </div>
        <div class="flex justify-center items-center w-1/2">

        </div>
    </div>
</div>
