<script lang="ts">
    import * as Avatar from "$lib/components/ui/avatar";
    import * as Tooltip from "$lib/components/ui/tooltip";
    import MarkdownView from "$lib/components/ui/markdown/MarkdownView.svelte";
    import {AlertCircleIcon, ClipboardIcon, LibraryIcon, Loader2Icon, RotateCcwIcon} from "lucide-svelte";
    import {Button} from "$lib/components/ui/button";
    import {authState, type User} from "$lib/store/appstore";
    import {onDestroy} from "svelte";
    import type {ChatMessage} from "$lib/store/chat-store";
    import AgentTaskTree from "$lib/components/chat/AgentTaskTree.svelte";
    import {toast} from "svelte-sonner";
    import {contextState} from "$lib/store/context-store";

    export let message: ChatMessage;

    $: isUser = message.role === 'user';
    $: hasContext = message.context.length > 0;

    let user: User | null;
    const unsub = authState.subscribe(value => (user = value.user));
    onDestroy(unsub);

    function handleLoadContext() {
        contextState.loadContext(message.context);
    }
</script>

<div class="flex flex-col">
    <div class="flex flex-row justify-between">
        <Avatar.Root class="w-8 h-8 border-2">
            <Avatar.Image
                src={isUser ? user?.picture : 'https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg'}
                alt={isUser ? 'user' : 'chatgpt'}/>
        </Avatar.Root>
        <div class="flex flex-col w-full">
            <div class="flex flex-row justify-between items-center">
                <h3 class="font-bold mb-1 ml-3 text-xl">
                    {isUser ? 'You' : 'Assistant'}
                </h3>
                <div class="flex flex-row items-center justify-end">
                    {#if hasContext}
                        <Tooltip.Root openDelay={100} closeDelay={50} group="chat-msg">
                            <Tooltip.Trigger>
                                <Button variant="ghost"
                                        on:click={handleLoadContext}
                                        class="h-8 px-2 py-0 text-muted-foreground">
                                    <LibraryIcon class="w-4 h-4"/>
                                </Button>
                            </Tooltip.Trigger>
                            <Tooltip.Content>
                                Show Source Context
                            </Tooltip.Content>
                        </Tooltip.Root>
                    {/if}
                    {#if !isUser}
                        <Tooltip.Root openDelay={100} closeDelay={50} group="chat-msg">
                            <Tooltip.Trigger>
                                <Button variant="ghost"
                                        on:click={() => toast.info('not yet implemented')}
                                        class="h-8 px-2 py-0 text-muted-foreground">
                                    <RotateCcwIcon class="w-4 h-4"/>
                                </Button>
                            </Tooltip.Trigger>
                            <Tooltip.Content>
                                Generate Another Response
                            </Tooltip.Content>
                        </Tooltip.Root>
                    {/if}
                    <Tooltip.Root openDelay={100} closeDelay={50} group="chat-msg">
                        <Tooltip.Trigger>
                            <Button variant="ghost"
                                    on:click={() => toast.info('not yet implemented')}
                                    class="h-8 px-2 py-0 text-muted-foreground">
                                <ClipboardIcon class="w-4 h-4"/>
                            </Button>
                        </Tooltip.Trigger>
                        <Tooltip.Content>
                            Copy to Clipboard
                        </Tooltip.Content>
                    </Tooltip.Root>
                </div>
            </div>
            <div class="ml-3">
                <AgentTaskTree tree={message.progressTree}/>
                <MarkdownView text={message.content}/>
                {#if !message.isComplete}
                    <span class="flex justify-center items-center mt-2 p-2">
                        <Loader2Icon class="w-5 h-5 animate-spin text-muted-foreground"/>
                        <span class="ml-2 tracking-tight text-muted-foreground animate-pulse">
                            Generating Response...
                        </span>
                    </span>
                {/if}
                {#if message.error}
                    <span
                        class="flex items-center mt-2 p-2 bg-red-600 bg-opacity-20 rounded-md border-muted">
                        <AlertCircleIcon class="w-5 h-5 text-red-600"/>
                        <span class="ml-2">
                            {message.error}
                        </span>
                    </span>
                {/if}
            </div>
        </div>
    </div>
</div>
