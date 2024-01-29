<script lang="ts">
    import {layoutState, type SidebarItem} from "$lib/store/appstore";
    import {Separator} from "$lib/components/ui/separator";
    import * as Tooltip from "$lib/components/ui/tooltip";
    import {
        FileStackIcon,
        GlobeIcon,
        HomeIcon,
        MessageSquareTextIcon,
        SettingsIcon,
        UploadCloudIcon
    } from "lucide-svelte";
    import Header from "$lib/sidebar/Header.svelte";
    import SidebarNavButton from "$lib/sidebar/SidebarNavButton.svelte";
    import SidebarFooter from "$lib/sidebar/SidebarFooter.svelte";

    let isExpanded = true;

    layoutState.subscribe((store) => {
        isExpanded = store.isSidebarExpanded;
    });

    const sidebarItems: SidebarItem[] = [
        {
            title: 'Home',
            icon: HomeIcon,
            handler: () => console.log('sidebar: home')
        },
        {
            title: 'Answer',
            icon: GlobeIcon,
            handler: () => console.log('sidebar: answer')
        },
        {
            title: 'Chat',
            icon: MessageSquareTextIcon,
            handler: () => console.log('sidebar: chat')
        },
        {
            title: 'Files',
            icon: FileStackIcon,
            handler: () => console.log('sidebar: files')
        },
        {
            title: 'Queue',
            icon: UploadCloudIcon,
            handler: () => console.log('sidebar: queue')
        },
        {
            title: 'Settings',
            icon: SettingsIcon,
            handler: () => console.log('sidebar: settings')
        }
    ];

</script>

<aside class="flex flex-col justify-between h-full p-2">
    <div>
        <Header displayWide={isExpanded}/>
        <Separator/>
        <nav class="flex flex-col space-y-0">
            {#each sidebarItems as item}
                <Tooltip.Root openDelay={100} closeDelay={75}>
                    <Tooltip.Trigger asChild let:builder>
                        <SidebarNavButton item={item} builder={builder} displayWide={isExpanded}/>
                    </Tooltip.Trigger>
                    <Tooltip.Content side="right">
                        {item.title}
                    </Tooltip.Content>
                </Tooltip.Root>
            {/each}
        </nav>
    </div>
    <div>
        <Separator/>
        <SidebarFooter displayWide={isExpanded}/>
    </div>
</aside>