<script lang="ts">

    import ChatHistory from "$lib/components/chat/ChatHistory.svelte";
</script>

<div class="flex flex-col py-2 px-4 h-screen">
    <div class="flex-0 flex flex-row pt-4 pb-4">
        <h1 class="font-bold text-3xl tracking-tight">Chat Assistant</h1>
    </div>
    <div class="flex-1 flex flex-row overflow-x-hidden">
        <ChatHistory/>
        <div class="border-l-[1px]">
            Chat
        </div>
        <div>
            Context
        </div>
    </div>
</div>