<script lang="ts">
    import ChatHistory from "$lib/components/chat/ChatHistory.svelte";
    import {Pane, Splitpanes} from "svelte-splitpanes";
    import ChatMessageEntry from "$lib/components/chat/ChatMessageEntry.svelte";
    import ChatPromptTextArea from "$lib/components/chat/ChatPromptTextArea.svelte";
    import {Button} from "$lib/components/ui/button";
    import * as Sheet from "$lib/components/ui/sheet";
    import {Separator} from "$lib/components/ui/separator";
    import {onDestroy} from "svelte";
    import ChatArea from "$lib/components/chat/ChatArea.svelte";
    import {activeChatState, type Chat} from "$lib/store/chat-store";
    import ContextPanel from "$lib/components/chat/ContextPanel.svelte";
    import {CogIcon, PanelRightClose, PanelRightCloseIcon, PanelRightOpenIcon} from "lucide-svelte";
    import {contextState} from "$lib/store/context-store";

    let isSettingsOpen = false;
    let activeChat: Chat | null;
    let showContext: boolean;

    const unsubState = activeChatState.subscribe(value => (activeChat = value));
    const unsubContext = contextState.subscribe(value => (showContext = value.isOpen));
    onDestroy(() => {
        unsubState();
        unsubContext();
    });

    function handleSplitterClick() {
    }

    function handlePaneMaximize() {
    }
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

<Splitpanes on:splitter-click={handleSplitterClick}
            on:pane-maximize={handlePaneMaximize}>
    <Pane minSize={55} maxSize={100}>
        <div class="flex flex-col py-2 px-4 h-screen">
            <div class="flex-0 flex flex-row justify-between items-center pt-4 pb-4">
                <h1 class="font-bold text-3xl tracking-tight">Chat Assistant</h1>
                <div class="flex items-center">
                    <Button variant="ghost" on:click={() => (isSettingsOpen = !isSettingsOpen)}>
                        <CogIcon class="w-5 h-5"/>
                    </Button>
                    <Button variant="ghost" on:click={() => contextState.toggleShowContext(!showContext)}>
                        {#if showContext}
                            <PanelRightCloseIcon class="w-5 h-5"/>
                        {:else}
                            <PanelRightOpenIcon class="w-5 h-5"/>
                        {/if}
                    </Button>
                </div>
            </div>
            <div class="flex-1 flex flex-row overflow-x-hidden">
                <ChatHistory/>
                <ChatArea
                    bind:isSettingsOpen={isSettingsOpen}
                    activeChat={activeChat}/>
            </div>
        </div>
    </Pane>
    {#if showContext}
        <Pane minSize={25} size={30}>
            <ContextPanel/>
        </Pane>
    {/if}
</Splitpanes>
