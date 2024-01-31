<script lang="ts">
    import {cn} from '$lib/utils.js';
    import {Button} from '$lib/components/ui/button';
    import type {SidebarItem} from "$lib/store/appstore";

    export let builder: any;
    export let item: SidebarItem;
    export let displayWide = true;
</script>


<Button variant="ghost" builders={[builder]} class={cn("relative justify-start")}
        on:click={item.handler}>
    <svelte:component this={item.icon} class="w-5 h-5"/>
    {#if displayWide}
        <div class="relative pt-0.5 font-semibold text-md ml-2">
            {item.title}
        </div>
    {/if}
</Button>