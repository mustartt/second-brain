<script lang="ts">
    import Sidebar from "$lib/components/sidebar/Sidebar.svelte";
    import ChatPage from "$lib/components/chat/ChatPage.svelte";
    import {Toaster} from "$lib/components/ui/sonner";
</script>

<main class="bg-background w-screen h-screen max-w-full max-h-full flex flex-row">
    <div class="flex-none">
        <Sidebar/>
    </div>
    <div class="flex-auto border-l-[1px] border-l-accent">
        <ChatPage/>
    </div>
</main>
<Toaster/>