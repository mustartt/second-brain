<script lang="ts">
    import {Button} from '$lib/components/ui/button';
    import {Loader2Icon, SquarePenIcon} from 'lucide-svelte';
    import ChatHistoryItem from '$lib/components/chat/ChatHistoryItem.svelte';
    import {onDestroy, onMount} from 'svelte';
    import * as Tooltip from "$lib/components/ui/tooltip";
    import {activeChatState, type ChatHistoryPreview, chatHistoryState, chatState} from "$lib/store/chat-store";
    import {createNewChat, loadChats} from "$lib/services/chat-service";

    let history: ChatHistoryPreview[];
    const unsubscribe = chatHistoryState.subscribe((value) => (history = value));

    async function createChatHandler() {
        await createNewChat();
    }

    $: activeId = $activeChatState?.chatId;
    $: isLoading = $chatState.isLoading;

    onMount(() => {
        loadChats();
    });

    onDestroy(() => {
        unsubscribe();
    });
</script>

<div class="flex flex-col pr-2">
    <div class="flex-0 flex flex-row justify-between items-center mb-1">
        <h1 class="text-lg tracking-tight font-semibold mb-0.5 text-nowrap">Chat History</h1>
        <Tooltip.Root openDelay={100} closeDelay={75}>
            <Tooltip.Trigger asChild let:builder>
                <Button variant="ghost"
                        class="h-8 px-2"
                        builders={[builder]}
                        disabled={isLoading}
                        on:click={createChatHandler}>
                    <SquarePenIcon class="w-5 h-5"/>
                </Button>
            </Tooltip.Trigger>
            <Tooltip.Content side="right">
                Create new chat
            </Tooltip.Content>
        </Tooltip.Root>
    </div>
    <div class="flex-grow flex flex-col min-w-40 max-w-44 overflow-y-auto overflow-x-hidden">
        {#if isLoading}
            <div class="flex mt-12 w-full justify-center items-center">
                <Loader2Icon class="w-5 h-5 animate-spin text-muted-foreground"/>
            </div>
        {:else}
            {#each history as item}
                <ChatHistoryItem
                    id={item.id}
                    name={item.name}
                    isActive={activeId === item.id}/>
            {/each}
        {/if}
    </div>
</div>
