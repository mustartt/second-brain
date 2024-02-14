<script lang="ts">
    import {CogIcon, Loader2Icon, PaperclipIcon, SendIcon} from 'lucide-svelte';
    import {Button} from '$lib/components/ui/button';
    import ChatMessageEntry from '$lib/components/chat/ChatMessageEntry.svelte';
    import {Separator} from '$lib/components/ui/separator';
    import ChatPromptTextArea from '$lib/components/chat/ChatPromptTextArea.svelte';
    import {createNewChat, saveChatHistory, sendUserMessage} from "$lib/services/chat-service";
    import type {Chat} from "$lib/store/chat-store";
    import WelcomeMessage from "$lib/components/chat/WelcomeMessage.svelte";

    export let isSettingsOpen: boolean;
    export let activeChat: Chat | null;
    let currentTextValue = '';

    $: isSendBlocked = activeChat ? activeChat.isSendBlocked : false;
    $: isLoading = activeChat ? activeChat.isLoading : false;
    $: messages = activeChat?.messages?.history || [];

    async function sendUserMessageHandler() {
        const newChatValue = currentTextValue.trim();
        currentTextValue = '';

        if (!activeChat) {
            await createNewChat();
        }
        await sendUserMessage(activeChat!.chatId, newChatValue);
        saveChatStateDebounce();
    }

    function handleTextAreaKeydown(event: KeyboardEvent) {
        if (isSendBlocked) return;
        if (currentTextValue.length == 0) return;

        saveChatStateDebounce();

        if (event.key === 'Enter' && !event.shiftKey) {
            sendUserMessageHandler();
            event.preventDefault();
        }
    }

    let timeoutID: NodeJS.Timeout;

    function saveChatStateDebounce() {
        clearTimeout(timeoutID);
        timeoutID = setTimeout(() => {
            if (activeChat) {
                saveChatHistory(activeChat.chatId);
            }
        }, 5000);
    }
</script>

<div class="flex w-full h-full flex-col justify-between">
    <div class="flex flex-col h-full">
        <div class="flex flex-grow overflow-y-auto">
            {#if isLoading}
                <div class="flex w-full justify-center items-center">
                    <Loader2Icon class="h-8 w-8 animate-spin text-muted-foreground"/>
                </div>
            {:else if !activeChat || messages.length === 0}
                <WelcomeMessage/>
            {:else}
                <div class="flex flex-col w-full space-y-4">
                    {#each messages as message}
                        <ChatMessageEntry message={message}/>
                    {/each}
                    <!-- empty spacing at the bottom of the messages -->
                    <div class="w-full min-h-32"/>
                </div>

            {/if}
        </div>
        <div class="flex-grow-0 flex flex-col">
            <Separator/>
            <div class="flex flex-row justify-between items-center mt-2">
                <ChatPromptTextArea bind:value={currentTextValue}
                                    handleKeyPress={handleTextAreaKeydown}/>
                <div class="flex flex-col space-y-2">
                    <Button variant="outline">
                        <PaperclipIcon class="w-4 h-4"/>
                    </Button>
                    <Button variant="outline"
                            disabled={isSendBlocked}
                            on:click={sendUserMessageHandler}>
                        <SendIcon class="w-4 h-4"/>
                    </Button>
                </div>
            </div>
        </div>
    </div>
</div>
