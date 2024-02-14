<script lang="ts">
    import * as Avatar from "$lib/components/ui/avatar";
    import MarkdownView from "$lib/components/ui/markdown/MarkdownView.svelte";
    import {AlertCircleIcon, ClipboardIcon, Loader2Icon, RotateCcwIcon} from "lucide-svelte";
    import {Button} from "$lib/components/ui/button";
    import {authState, type User} from "$lib/store/appstore";
    import {onDestroy} from "svelte";
    import type {ChatMessage} from "$lib/store/chat-store";
    import AgentTaskTree from "$lib/components/chat/AgentTaskTree.svelte";

    export let message: ChatMessage;

    $: isUser = message.role === 'user';

    let user: User;
    const unsub = authState.subscribe(value => (user = value.user));
    onDestroy(unsub);

</script>

<div class="flex flex-col">
    <div class="flex flex-row justify-between">
        <Avatar.Root class="w-8 h-8 border-2">
            <Avatar.Image
                src={isUser ? user.picture : 'https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg'}
                alt={isUser ? 'user' : 'chatgpt'}/>
        </Avatar.Root>
        <div class="flex flex-col w-full">
            <div class="flex flex-row justify-between items-center">
                <h3 class="font-bold mb-1 ml-3 text-xl">
                    {isUser ? 'You' : 'Assistant'}
                </h3>
                <div class="flex flex-row items-center justify-end -space-x-0.5">
                    {#if !isUser}
                        <Button variant="ghost" class="h-8 px-2 py-0 text-muted-foreground">
                            <RotateCcwIcon class="w-4 h-4"/>
                        </Button>
                    {/if}
                    <Button variant="ghost" class="h-8 px-2 py-0 text-muted-foreground">
                        <ClipboardIcon class="w-4 h-4"/>
                    </Button>
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
