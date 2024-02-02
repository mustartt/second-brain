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
    import UserAvatar from "$lib/components/sidebar/UserAvatar.svelte";
    import UserProfileAction from "$lib/components/sidebar/UserProfileAction.svelte";

    export let displayWide = true;

    let user: User | null;

    const unsub = authState.subscribe((value) => {
        user = value.user;
    });

    onDestroy(unsub);
</script>

{#if user}
    <Popover.Root>
        <div class="flex flex-row justify-between items-center">
            {#if displayWide}
                <Popover.Trigger class="p-2">
                    <UserAvatar user={user}/>
                </Popover.Trigger>
                <div class="ml-2 flex flex-col max-w-44">
                        <span class="text-sm font-medium leading-none text-nowrap text-ellipsis overflow-hidden">
                            {user.name}
                        </span>
                    <span class="text-sm text-muted-foreground text-nowrap text-ellipsis overflow-hidden">
                            {user.email}
                        </span>
                </div>
                <div>
                    <Popover.Trigger class="p-2">
                        <MoreVerticalIcon class="w-4 h-4 text-muted-foreground hover:text-foreground"/>
                    </Popover.Trigger>
                </div>
            {:else}
                <Popover.Trigger class="p-2">
                    <UserAvatar user={user}/>
                </Popover.Trigger>
            {/if}
            <Popover.Content sideOffset={16}>
                <UserProfileAction/>
            </Popover.Content>
        </div>
    </Popover.Root>
{/if}
