<script lang="ts">
    import Sidebar from '$lib/components/sidebar/Sidebar.svelte';
    import ChatPage from '$lib/components/chat/ChatPage.svelte';
    import {Toaster} from '$lib/components/ui/sonner';
    import {type Layout, layoutState} from "$lib/store/appstore";
    import {type ComponentType, onDestroy} from "svelte";

    let activeTab: Layout;

    const layoutMap: Record<Layout, ComponentType | null> = {
        'home': null,
        'answer': null,
        'chat': ChatPage,
        'files': null,
        'queue': null,
        'settings': null,
    };

    const unsub = layoutState.subscribe(value => {
        activeTab = value.activeLayout;
    });

    onDestroy(unsub);
</script>

<main class="bg-background w-screen h-screen max-w-full max-h-full flex flex-row">
    <div class="flex-none">
        <Sidebar/>
    </div>
    <div class="flex-auto border-l-[1px] border-l-accent">
        {#if layoutMap[activeTab] }
            <svelte:component this={layoutMap[activeTab]}/>
        {/if}
    </div>
</main>

<Toaster/>
