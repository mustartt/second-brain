<script lang="ts">
    import * as Avatar from "$lib/components/ui/avatar";
    import MarkdownView from "$lib/components/ui/markdown/MarkdownView.svelte";
    import {ClipboardIcon, RotateCcwIcon} from "lucide-svelte";
    import {Button} from "$lib/components/ui/button";
    import {authState, type User} from "$lib/store/appstore";
    import {onDestroy} from "svelte";

    export let content: string;
    export let isUser: boolean = true;

    let user: User | null;
    const unsub = authState.subscribe(value => (user = value));
    onDestroy(unsub);
</script>

<div class="flex flex-col">
    <div class="flex flex-row justify-between">
        <Avatar.Root class="w-8 h-8 border-2">
            <Avatar.Image src={isUser ? user?.picture : 'chat_logo.svg'}
                          alt={isUser ? 'user' : 'chatgpt'}/>
            <Avatar.Fallback>User</Avatar.Fallback>
        </Avatar.Root>
        <div class="flex flex-col w-full">
            <div class="flex flex-row justify-between items-center">
                <h3 class="font-bold mb-1 ml-3 text-xl">You</h3>
                <div class="flex flex-row items-center justify-end -space-x-0.5">
                    <Button variant="ghost" class="h-8 px-2 py-0 text-muted-foreground">
                        <ClipboardIcon class="w-4 h-4"/>
                    </Button>
                    {#if isUser}
                        <Button variant="ghost" class="h-8 px-2 py-0 text-muted-foreground">
                            <RotateCcwIcon class="w-4 h-4"/>
                        </Button>
                    {/if}
                </div>
            </div>
            <div class="ml-3">
                <MarkdownView text={content}/>
            </div>
        </div>
    </div>
</div>