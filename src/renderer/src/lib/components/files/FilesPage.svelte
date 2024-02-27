<script lang="ts">
    import {onDestroy, onMount} from "svelte";
    import {toast} from "svelte-sonner";
    import {type FileViewerState, fileViewerState} from "$lib/store/files-store";
    import FilesSidebar from "$lib/components/files/FilesSidebar.svelte";
    import {
        ArrowDownUp,
        ArrowDownWideNarrow, FilePlus, FilePlusIcon,
        FolderPlusIcon,
        LayoutGrid,
        ListTree, Loader2Icon, PlusIcon, UploadIcon,
    } from "lucide-svelte";
    import * as Tabs from "$lib/components/ui/tabs";
    import * as Select from "$lib/components/ui/select";
    import * as ContextMenu from "$lib/components/ui/context-menu";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu";

    import FolderGridItem from "$lib/components/files/file-icon/FolderGridItem.svelte";
    import {Separator} from "$lib/components/ui/separator";
    import {Button, buttonVariants} from "$lib/components/ui/button";
    import {loadDataSources} from "$lib/services/datasource-service";
    import FilePathViewer from "$lib/components/files/file-path-viewer/FilePathViewer.svelte";
    import FileGridItem from "$lib/components/files/file-icon/FileGridItem.svelte";
    import CreateFolderDialogue from "$lib/components/files/CreateFolderDialogue.svelte";
    import {cn} from "$lib/utils";
    import FileUploadDialogue from "$lib/components/files/FileUploadDialogue.svelte";

    let createFolderDialogueOpen = false;
    let fileUploadDialogueOpen = false;

    let viewerState: FileViewerState | null;
    const unsub = fileViewerState.subscribe(value => {
        viewerState = value;
    });

    onMount(async () => {
        await loadDataSources();
    });

    onDestroy(() => {
        viewerState?.unsubscribe();
        unsub();
    });

</script>

<FileUploadDialogue open={fileUploadDialogueOpen} on:upload={(files) => console.log(files)}/>

<Tabs.Root value="grid" class="flex flex-row py-2 px-4 h-screen overflow-x-hidden">
    <div class="flex flex-col space-y-2">
        <h1 class="font-bold text-3xl tracking-tight">Your Files</h1>
        <FilesSidebar/>
    </div>
    <div class="flex flex-col w-full h-full">
        {#if viewerState}
            <FilePathViewer path={viewerState.path}/>
            <div class="flex justify-between items-center">
                <div class="flex items-center">
                    <DropdownMenu.Root>
                        <DropdownMenu.Trigger class={buttonVariants({ variant: 'default', size: 'sm' })}>
                            <PlusIcon class="w-5 h-5 -ml-1 mr-2"/>
                            New
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Content side="bottom">
                            <DropdownMenu.Group>
                                <DropdownMenu.Item on:click={() => (createFolderDialogueOpen = true)}>
                                    <FolderPlusIcon class="w-5 h-5 mr-2"/>
                                    New Folder
                                </DropdownMenu.Item>
                                <DropdownMenu.Item on:click={() => toast.info('not yet implemented')}>
                                    <FilePlusIcon class="w-5 h-5 mr-2"/>
                                    Upload File
                                </DropdownMenu.Item>
                            </DropdownMenu.Group>
                        </DropdownMenu.Content>
                    </DropdownMenu.Root>
                </div>
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

            <CreateFolderDialogue bind:open={createFolderDialogueOpen}/>

            <div class="flex w-full h-full mt-2 rounded p-4 overflow-y-auto">
                <Tabs.Content value="grid" class="flex w-full">
                    {#if viewerState.isLoading}
                        <div class="flex w-full justify-center -mt-16 items-center">
                            <Loader2Icon class="w-5 h-5 animate-spin mr-2"/>
                            <span class="text-muted-foreground">Loading Files...</span>
                        </div>
                    {:else}
                        <div class="w-full">
                            {#if viewerState.entries.length === 0}
                                <div class="flex w-full mt-32 justify-center items-center">
                                    <span class="text-muted-foreground">No Items</span>
                                </div>
                            {:else}
                                <div
                                    class="grid grid-cols-8 2xl:grid-cols-10 3xl:grid-cols-12 4xl:grid-cols-[repeat(14,minmax(0,1fr))] 5xl:grid-cols-[repeat(16,minmax(0,1fr))] 6xl:grid-cols-[repeat(18,minmax(0,1fr))] gap-4">
                                    {#each viewerState.entries as item}
                                        {#if item.type === 'dir'}
                                            <FolderGridItem folder={item}/>
                                        {:else}
                                            <FileGridItem name={item.name}/>
                                        {/if}
                                    {/each}
                                </div>
                            {/if}
                        </div>
                    {/if}
                </Tabs.Content>
            </div>
        {/if}
    </div>
</Tabs.Root>
