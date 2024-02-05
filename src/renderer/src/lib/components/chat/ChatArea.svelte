<script lang="ts">
    import {CogIcon, PaperclipIcon, SendIcon} from 'lucide-svelte';
    import {Button} from '$lib/components/ui/button';
    import ChatMessageEntry from '$lib/components/chat/ChatMessageEntry.svelte';
    import {Separator} from '$lib/components/ui/separator';
    import ChatPromptTextArea from '$lib/components/chat/ChatPromptTextArea.svelte';
    import {appState, type Chat, type ChatMessage} from "$lib/store/appstore";
    import {v4 as uuidv4} from 'uuid';
    import {saveChatHistory} from "$lib/services/chat-service";

    export let isSettingsOpen: boolean;
    export let activeChat: Chat;

    let currentTextValue = '';

    function sendUserMessage() {

        const newChatMessage: ChatMessage = {
            id: uuidv4(),
            role: 'user',
            content: currentTextValue.trim(),
            context: {},
            shouldDisplay: true
        };

        appState.setActiveChatIsBlocked(true);
        appState.addActiveChatMessage(newChatMessage);

        currentTextValue = '';

        setTimeout(() => {
            appState.setActiveChatIsBlocked(false);
        }, 3000);

        saveChatStateDebounce();
    }

    function handleTextAreaKeydown(event: KeyboardEvent) {
        if (activeChat.isSendBlocked) return;
        if (currentTextValue.length == 0) return;

        saveChatStateDebounce();

        if (event.key === 'Enter' && !event.shiftKey) {
            sendUserMessage();
            event.preventDefault();
        }
    }

    let timeoutID: NodeJS.Timeout;

    function saveChatStateDebounce() {
        clearTimeout(timeoutID);
        timeoutID = setTimeout(() => {
            saveChatHistory();
        }, 5000);
    }

</script>

<div class="flex h-full flex-col justify-between">
    <div class="flex flex-col h-full container max-w-4xl mx-auto">
        <div class="flex flex-grow overflow-y-auto">
            <div class="flex flex-col w-full space-y-4">
                {#each activeChat.history as message}
                    <ChatMessageEntry
                        content={message.content}
                        isUser={message.role === 'user'}/>
                {/each}
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
                <ChatPromptTextArea bind:value={currentTextValue}
                                    handleKeyPress={handleTextAreaKeydown}/>
                <div class="flex flex-col space-y-2">
                    <Button variant="outline">
                        <PaperclipIcon class="w-4 h-4"/>
                    </Button>
                    <Button variant="outline"
                            disabled={activeChat.isSendBlocked}
                            on:click={sendUserMessage}>
                        <SendIcon class="w-4 h-4"/>
                    </Button>
                </div>
            </div>
        </div>
    </div>
</div>
