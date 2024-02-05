<script lang="ts">
    import ChatHistory from "$lib/components/chat/ChatHistory.svelte";
    import {Pane, Splitpanes} from "svelte-splitpanes";
    import ChatMessageEntry from "$lib/components/chat/ChatMessageEntry.svelte";
    import ChatPromptTextArea from "$lib/components/chat/ChatPromptTextArea.svelte";
    import {Button} from "$lib/components/ui/button";
    import {CogIcon, PaperclipIcon, SendIcon} from "lucide-svelte";
    import * as Sheet from "$lib/components/ui/sheet";
    import {Separator} from "$lib/components/ui/separator";
    import {appState, type Chat} from "$lib/store/appstore";
    import {onDestroy} from "svelte";
    import ChatArea from "$lib/components/chat/ChatArea.svelte";

    let isSettingsOpen = false;

    let activeChat: Chat | null;

    const unsubState = appState.subscribe(value => {
        activeChat = value.chats.activeChat;
    });

    onDestroy(unsubState);
</script>

<Sheet.Root bind:open={isSettingsOpen}>
    <Sheet.Content side="right">
        <Sheet.Header>
            <Sheet.Title>Chat Settings</Sheet.Title>
            <Sheet.Description>
                Not yet implemented
            </Sheet.Description>
        </Sheet.Header>
    </Sheet.Content>
</Sheet.Root>

<div class="flex flex-col py-2 px-4 h-screen">
    <div class="flex-0 flex flex-row pt-4 pb-4">
        <h1 class="font-bold text-3xl tracking-tight">Chat Assistant</h1>
    </div>
    <div class="flex-1 flex flex-row overflow-x-hidden">
        <ChatHistory/>
        {#if activeChat === null}
            <div class="flex flex-col w-full h-full justify-center items-center ">
                <h1 class="text-2xl font-bold relative -top-10">No Active Tab</h1>
            </div>
        {:else}
            <div class="flex flex-grow">
                <Splitpanes>
                    <Pane minSize={40} size={65}>
                        <ChatArea bind:isSettingsOpen={isSettingsOpen} activeChat={activeChat}/>
                    </Pane>
                    <Pane minSize={25} size={35}>
                        <div class="flex h-full flex-col justify-center items-center">
                            <h1 class="text-2xl font-bold">Context</h1>
                        </div>
                    </Pane>
                </Splitpanes>
            </div>
        {/if}
    </div>
</div>
