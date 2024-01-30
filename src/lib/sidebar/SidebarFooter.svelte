<script lang="ts">
    import {LogInIcon, MoreVerticalIcon} from 'lucide-svelte';
    import {Button} from "$lib/components/ui/button";
    import * as Avatar from "$lib/components/ui/avatar";
    import * as Popover from "$lib/components/ui/popover";
    import {authState, type User} from "$lib/store/appstore";
    import {onDestroy} from "svelte";
    import * as Tooltip from "$lib/components/ui/tooltip";
    import {cn} from "$lib/utils";
    import {toast} from "svelte-sonner";

    export let displayWide = true;

    let user: User | null;

    const unsub = authState.subscribe((value) => {
        user = value;
    });

    onDestroy(unsub);
</script>

{#if user}
    <Popover.Root>
        {#if displayWide}
            <div class="flex flex-row justify-between items-center">
                <div class="flex flex-row p-2">
                    <Avatar.Root class="w-8 h-8">
                        <Avatar.Image src="https://github.com/shadcn.png" alt="user profile"/>
                        <Avatar.Fallback>User</Avatar.Fallback>
                    </Avatar.Root>
                    <div class="ml-2 flex flex-col max-w-44">
                        <span class="text-sm font-medium leading-none text-nowrap text-ellipsis overflow-hidden">Sofia Davis</span>
                        <span class="text-sm text-muted-foreground text-nowrap text-ellipsis overflow-hidden">sofia.davis@example.com</span>
                    </div>
                </div>
                <div>
                    <Popover.Trigger class="p-2">
                        <MoreVerticalIcon class="w-4 h-4"/>
                    </Popover.Trigger>
                </div>
            </div>
        {:else}
            <div class="flex justify-center items-center">
                <Popover.Trigger class="p-2">
                    <Avatar.Root class="w-8 h-8 hover:bg-accent">
                        <Avatar.Image src="https://github.com/shadcn.png" alt="user profile"/>
                        <Avatar.Fallback>User</Avatar.Fallback>
                    </Avatar.Root>
                </Popover.Trigger>
            </div>
        {/if}
        <Popover.Content sideOffset={16}>
            Hello World
        </Popover.Content>
    </Popover.Root>
{:else}
    <Tooltip.Root openDelay={100} closeDelay={75}>
        <Tooltip.Trigger asChild let:builder>
            <Button variant="ghost" builders={[builder]} class={cn("relative justify-start mt-2")}
                    on:click={() => toast('not yet implemented')}>
                <LogInIcon class="w-5 h-5"/>
                {#if displayWide}
                    <div class="relative pt-0.5 font-semibold text-md ml-2">
                        Sign in
                    </div>
                {/if}
            </Button>
        </Tooltip.Trigger>
        <Tooltip.Content side="right">
            Sign in
        </Tooltip.Content>
    </Tooltip.Root>
{/if}