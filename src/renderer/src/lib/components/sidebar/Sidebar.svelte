<script lang="ts">
    import {appState, type Layout, layoutState, type SidebarItem} from "$lib/store/appstore";
    import {Separator} from "$lib/components/ui/separator";
    import * as Tooltip from "$lib/components/ui/tooltip";
    import {
        FileStackIcon,
        GlobeIcon,
        HomeIcon,
        MessageSquareTextIcon, PanelLeftIcon,
        SettingsIcon,
        UploadCloudIcon
    } from "lucide-svelte";
    import Header from "$lib/components/sidebar/Header.svelte";
    import SidebarNavButton from "$lib/components/sidebar/SidebarNavButton.svelte";
    import SidebarFooter from "$lib/components/sidebar/SidebarFooter.svelte";
    import {onDestroy} from "svelte";

    let isExpanded = true;
    let activeTab: Layout;

    const unsubscribe = layoutState.subscribe((store) => {
        isExpanded = store.isSidebarExpanded;
        activeTab = store.activeLayout;
    });

    onDestroy(unsubscribe);

    const sidebarItems: SidebarItem[] = [
        {
            title: 'Home',
            layout: 'home',
            icon: HomeIcon,
            handler: () => console.log('sidebar: home')
        },
        {
            title: 'Answer',
            icon: GlobeIcon,
            layout: 'answer',
            handler: () => console.log('sidebar: answer')
        },
        {
            title: 'Chat',
            layout: 'chat',
            icon: MessageSquareTextIcon,
            handler: () => console.log('sidebar: chat')
        },
        {
            title: 'Files',
            layout: 'files',
            icon: FileStackIcon,
            handler: () => console.log('sidebar: files')
        },
        {
            title: 'Queue',
            layout: 'queue',
            icon: UploadCloudIcon,
            handler: () => console.log('sidebar: queue')
        },
        {
            title: 'Settings',
            layout: 'settings',
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
            <Tooltip.Root openDelay={100} closeDelay={75}>
                <Tooltip.Trigger asChild let:builder>
                    <SidebarNavButton item={{
                      title: '',
                      layout: 'home',
                      icon: PanelLeftIcon,
                      handler: () => appState.toggleSidebar()
                    }} builder={builder} displayWide={isExpanded} isActive={isExpanded}/>
                </Tooltip.Trigger>
                <Tooltip.Content side="right">
                    Toggle Sidebar
                </Tooltip.Content>
            </Tooltip.Root>
            <Separator/>
            {#each sidebarItems as item}
                <Tooltip.Root openDelay={100} closeDelay={75}>
                    <Tooltip.Trigger asChild let:builder>
                        <SidebarNavButton
                            item={item}
                            builder={builder}
                            displayWide={isExpanded}
                            isActive={activeTab === item.layout}
                        />
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
