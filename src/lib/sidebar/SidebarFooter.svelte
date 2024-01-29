<script lang="ts">
    import {MoreVerticalIcon} from 'lucide-svelte';
    import {Button} from "$lib/components/ui/button";
    import * as Avatar from "$lib/components/ui/avatar";
    import * as Popover from "$lib/components/ui/popover";

    export let displayWide = true;
</script>


<Popover.Root>
    {#if displayWide}
        <div class="flex flex-row justify-between items-center">
            <div class="flex flex-row p-2">
                <Avatar.Root class="w-8 h-8">
                    <Avatar.Image src="https://github.com/shadcn.png" alt="@shadcn"/>
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
                    <Avatar.Image src="https://github.com/shadcn.png" alt="@shadcn"/>
                    <Avatar.Fallback>User</Avatar.Fallback>
                </Avatar.Root>
            </Popover.Trigger>
        </div>
    {/if}
    <Popover.Content sideOffset={16}>
        Hello World
    </Popover.Content>
</Popover.Root>

