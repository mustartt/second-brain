<script lang="ts">
    import {Button} from '$lib/components/ui/button';
    import {SquarePenIcon} from 'lucide-svelte';
    import ChatHistoryItem from '$lib/components/chat/ChatHistoryItem.svelte';
    import {appState, type ChatHistoryPreview, chatHistoryState} from '$lib/store/appstore';
    import {onDestroy, onMount} from 'svelte';
    import * as Tooltip from "$lib/components/ui/tooltip";
    import {createNewChatHistory, deleteChatHistory, getAllChatHistory} from "$lib/services/chat-service";

    let history: ChatHistoryPreview[];
    const unsubscribe = chatHistoryState.subscribe((value) => (history = value));

    function deleteHandler(id: string) {

    }

    function createNewChat() {
        createNewChatHistory();
    }

    onMount(() => {
        getAllChatHistory();
    });

    onDestroy(() => {
        unsubscribe();
    });
</script>

<div class="flex flex-col pr-2">
    <div class="flex-0 flex flex-row justify-between items-center">
        <h1 class="text-lg tracking-tight font-semibold mb-0.5 text-nowrap">Chat History</h1>
        <Tooltip.Root openDelay={100} closeDelay={75}>
            <Tooltip.Trigger asChild let:builder>
                <Button variant="ghost" builders={[builder]} on:click={createNewChat}>
                    <SquarePenIcon class="w-5 h-5"/>
                </Button>
            </Tooltip.Trigger>
            <Tooltip.Content side="right">
                Create new chat
            </Tooltip.Content>
        </Tooltip.Root>
    </div>
    <div class="flex-grow flex flex-col min-w-40 max-w-44 overflow-y-auto overflow-x-hidden">
        {#each history as item}
            <ChatHistoryItem id={item.id} name={item.name}/>
        {/each}
    </div>
</div>
