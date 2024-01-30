<script lang="ts">
    export let displayWide = true;
</script>


<div class="flex flex-row items-center space-x-2 p-2">
    <img src="vite.svg" class="h-8 w-8" alt="logo"/>
    {#if displayWide}
        <h1 class="font-semibold text-2xl tracking-tight pr-4">Second Brain</h1>
    {/if}
</div>