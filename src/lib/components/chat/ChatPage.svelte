<script lang="ts">
    import ChatHistory from "$lib/components/chat/ChatHistory.svelte";
    import {Pane, Splitpanes} from "svelte-splitpanes";
    import ChatMessageEntry from "$lib/components/chat/ChatMessageEntry.svelte";
</script>

<div class="flex flex-col py-2 px-4 h-screen">
    <div class="flex-0 flex flex-row pt-4 pb-4">
        <h1 class="font-bold text-3xl tracking-tight">Chat Assistant</h1>
    </div>
    <div class="flex-1 flex flex-row overflow-x-hidden">
        <ChatHistory/>
        <div class="flex flex-grow">
            <Splitpanes>
                <Pane minSize={40} size={65}>
                    <div class="flex h-full flex-col justify-between">
                        <div class="flex-grow overflow-y-auto">
                            <div class="container max-w-3xl mx-auto">
                                <ChatMessageEntry/>
                                <ChatMessageEntry/>
                                <ChatMessageEntry/>

                            </div>
                        </div>
                        <div class="flex-grow-0 h-32 bg-muted">Chat</div>
                    </div>
                </Pane>
                <Pane minSize={25} size={35}>
                    <div class="flex h-full flex-col justify-center items-center">
                        <h1 class="text-2xl font-bold">Context</h1>
                    </div>
                </Pane>
            </Splitpanes>
        </div>
    </div>
</div>