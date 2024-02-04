<script lang="ts">
    import ChatHistory from "$lib/components/chat/ChatHistory.svelte";
    import {Pane, Splitpanes} from "svelte-splitpanes";
    import ChatMessageEntry from "$lib/components/chat/ChatMessageEntry.svelte";
    import ChatPromptTextArea from "$lib/components/chat/ChatPromptTextArea.svelte";
    import {Button} from "$lib/components/ui/button";
    import {CogIcon, PaperclipIcon, SendIcon} from "lucide-svelte";
    import * as Sheet from "$lib/components/ui/sheet";
    import {Separator} from "$lib/components/ui/separator";
    import {appState} from "$lib/store/appstore";
    import {onDestroy} from "svelte";

    let isSettingsOpen = false;

    let hasActiveTab: boolean;

    const unsubState = appState.subscribe(value => {
        hasActiveTab = value.chats.activeChat !== null;
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
        {#if !hasActiveTab}
            <div class="flex flex-col w-full h-full justify-center items-center ">
                <h1 class="text-2xl font-bold relative -top-10">No Active Tab</h1>
            </div>
        {:else}
            <div class="flex flex-grow">
                <Splitpanes>
                    <Pane minSize={40} size={65}>
                        <div class="flex h-full flex-col justify-between">
                            <div class="flex flex-col h-full container max-w-4xl mx-auto">
                                <div class="flex flex-grow overflow-y-auto">
                                    <div class="flex flex-col w-full space-y-4">
                                        <ChatMessageEntry content="123\n\n" isUser={true}/>
                                        <ChatMessageEntry content="123\n\n" isUser={false}/>
                                        <ChatMessageEntry content="123\n\n" isUser={true}/>
                                    </div>
                                </div>
                                <div class="flex-grow-0 flex flex-col">
                                    <Separator/>
                                    <div class="flex flex-row justify-between items-center mt-2">
                                        <div>
                                            <!-- for other toolbars here eventually -->
                                        </div>
                                        <div class="flex flex-row justify-end items-center">
                                            <Button variant="outline" class="h-8 px-2 py-1 text-muted-foreground"
                                                    on:click={() => (isSettingsOpen = !isSettingsOpen)}>
                                                <CogIcon class="w-4 h-4"/>
                                            </Button>
                                        </div>
                                    </div>
                                    <div class="flex flex-row justify-between items-center">
                                        <ChatPromptTextArea/>
                                        <div class="flex flex-col space-y-2">
                                            <Button variant="outline">
                                                <PaperclipIcon class="w-4 h-4"/>
                                            </Button>
                                            <Button variant="outline">
                                                <SendIcon class="w-4 h-4"/>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
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
