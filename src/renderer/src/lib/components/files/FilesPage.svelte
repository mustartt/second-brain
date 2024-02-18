<script lang="ts">
    import {onDestroy, onMount} from "svelte";
    import {getAllCollections} from "$lib/services/file-service";
    import {firebaseAuth} from "$lib/services/firebase-service";
    import {toast} from "svelte-sonner";
    import {datasourceState, type FileViewerState, fileViewerState} from "$lib/store/files-store";
    import FilesSidebar from "$lib/components/files/FilesSidebar.svelte";
    import {
        ArrowDownUp,
        ArrowDownWideNarrow, ArrowUpWideNarrow,
        ChevronRightIcon,
        FolderIcon,
        FolderOpenIcon, FolderPlusIcon,
        LayoutGrid,
        LayoutGridIcon,
        ListTree, Loader2Icon, UploadIcon
    } from "lucide-svelte";
    import * as Tabs from "$lib/components/ui/tabs";
    import * as Select from "$lib/components/ui/select";
    import * as ContextMenu from "$lib/components/ui/context-menu";
    import FolderGridItem from "$lib/components/files/file-icon/FolderGridItem.svelte";
    import {Separator} from "$lib/components/ui/separator";
    import {Button} from "$lib/components/ui/button";
    import {loadDataSources} from "$lib/services/datasource-service";
    import FilePathViewer from "$lib/components/files/file-path-viewer/FilePathViewer.svelte";
    import FileGridItem from "$lib/components/files/file-icon/FileGridItem.svelte";


    let viewerState: FileViewerState | null;
    const unsub = fileViewerState.subscribe(value => {
        viewerState = value;
    });

    onMount(async () => {
        await loadDataSources();
    });

    onDestroy(unsub);
</script>

<Tabs.Root value="grid" class="flex flex-col py-2 px-4 h-screen">
    <div class="flex-0 flex flex-row justify-between items-center pt-4 pb-4">
        <h1 class="font-bold text-3xl tracking-tight">Your Files</h1>
    </div>
    <div class="flex-1 flex flex-row overflow-x-hidden">
        <FilesSidebar/>
        <div class="flex flex-col w-full h-full">
            {#if viewerState}
                <div class="flex justify-between items-center">
                    <FilePathViewer path={viewerState.path}/>
                    <div class="flex items-center space-x-2">
                        <div class="flex items-center space-x-1">
                            <Select.Root>
                                <Select.Trigger class="h-8 space-x-2">
                                    <ArrowDownUp class="w-5 h-5 text-muted-foreground"/>
                                    <Select.Value placeholder="Name"/>
                                </Select.Trigger>
                                <Select.Content>
                                    <Select.Item value="name">Name</Select.Item>
                                    <Select.Item value="size">Size</Select.Item>
                                    <Select.Item value="time-created">Created</Select.Item>
                                    <Select.Item value="time-updated">Updated</Select.Item>
                                </Select.Content>
                            </Select.Root>
                            <Button variant="outline" class="h-8 px-2">
                                <ArrowDownWideNarrow class="h-5 w-5"/>
                                <!-- <ArrowUpWideNarrow class="h-5 w-5"/>-->
                            </Button>
                        </div>
                        <Separator orientation="vertical"/>
                        <Tabs.List>
                            <Tabs.Trigger value="list">
                                <ListTree class="w-5 h-5"/>
                            </Tabs.Trigger>
                            <Tabs.Trigger value="grid">
                                <LayoutGrid class="w-5 h-5"/>
                            </Tabs.Trigger>
                        </Tabs.List>
                    </div>
                </div>

                <div class="flex w-full h-full mt-2 rounded p-4 overflow-y-auto">
                    <Tabs.Content value="grid" class="flex">
                        {#if viewerState.isLoading}
                            <div class="w-full mt-32 justify-center items-center">
                                <Loader2Icon class="w-5 h-5 animate-spin mr-2"/>
                                <span class="text-muted-foreground">Loading Files...</span>
                            </div>
                        {:else}
                            <ContextMenu.Root>
                                <ContextMenu.Trigger>
                                    {#if viewerState.entries.length === 0}
                                        <div class="flex w-full mt-32 justify-center items-center">
                                            <span class="text-muted-foreground">No Items</span>
                                        </div>
                                    {:else}
                                        <div class="grid grid-cols-8 2xl:grid-cols-10 container gap-4">
                                            {#each viewerState.entries as item}
                                                {#if item.type === 'dir'}
                                                    <FolderGridItem name={item.name}/>
                                                {:else}
                                                    <FileGridItem name={item.name}/>
                                                {/if}
                                            {/each}
                                        </div>
                                    {/if}
                                    <ContextMenu.Content class="w-52">
                                        <ContextMenu.Item on:click={() => toast.info('not implemented')}>
                                            <FolderPlusIcon class="w-5 h-5 text-muted-foreground mr-2"/>
                                            New Folder
                                        </ContextMenu.Item>
                                        <ContextMenu.Separator/>
                                        <ContextMenu.Item on:click={() => toast.info('not implemented')}>
                                            <UploadIcon class="w-5 h-5 text-muted-foreground mr-2"/>
                                            Upload File
                                        </ContextMenu.Item>
                                    </ContextMenu.Content>
                                </ContextMenu.Trigger>
                            </ContextMenu.Root>
                        {/if}
                    </Tabs.Content>
                </div>
            {/if}
        </div>
    </div>
</Tabs.Root>
