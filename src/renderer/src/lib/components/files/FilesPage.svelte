<script lang="ts">
    import {onMount} from "svelte";
    import {getAllCollections} from "$lib/services/file-service";
    import {firebaseAuth} from "$lib/services/firebase-service";
    import {toast} from "svelte-sonner";
    import {datasourceState} from "$lib/store/files-store";
    import FilesSidebar from "$lib/components/files/FilesSidebar.svelte";
    import {
        ArrowDownUp,
        ArrowDownWideNarrow, ArrowUpWideNarrow,
        ChevronRightIcon,
        FolderIcon,
        FolderOpenIcon,
        LayoutGrid,
        LayoutGridIcon,
        ListTree
    } from "lucide-svelte";
    import * as Tabs from "$lib/components/ui/tabs";
    import * as Select from "$lib/components/ui/select";
    import FolderGridItem from "$lib/components/files/file-icon/FolderGridItem.svelte";
    import {Separator} from "$lib/components/ui/separator";
    import {Button} from "$lib/components/ui/button";

    const list = [
        'Desktop',
        'Downloads',
        'Documents',
        'textbook',
        'adhe unit 4-6 notes.txt',
        'Chapter 2 - Cell surface structure.txt',
        'Untitled-2024-02-04-1329.excalidraw',
        'test1.pdf',
        'Module 3.1_ Overview, Groups, and Characteristics.pdf',
        'Desktop',
        'Downloads',
        'Documents',
        'textbook',
        'adhe unit 4-6 notes.txt',
        'Chapter 2 - Cell surface structure.txt',
        'Untitled-2024-02-04-1329.excalidraw',
        'test1.pdf',
        'Module 3.1_ Overview, Groups, and Characteristics.pdf',
        'textbook',
        'adhe unit 4-6 notes.txt',
        'Chapter 2 - Cell surface structure.txt',
        'Untitled-2024-02-04-1329.excalidraw',
        'test1.pdf',
        'Module 3.1_ Overview, Groups, and Characteristics.pdf',
        'textbook',
        'adhe unit 4-6 notes.txt',
        'Chapter 2 - Cell surface structure.txt',
        'Untitled-2024-02-04-1329.excalidraw',
        'test1.pdf',
        'Module 3.1_ Overview, Groups, and Characteristics.pdf',
        'textbook',
        'adhe unit 4-6 notes.txt',
        'Chapter 2 - Cell surface structure.txt',
        'Untitled-2024-02-04-1329.excalidraw',
        'test1.pdf',
        'Module 3.1_ Overview, Groups, and Characteristics.pdf'
    ];

    onMount(async () => {
        try {
            const uid = firebaseAuth.currentUser?.uid;
            if (!uid) {
                console.error('Missing uid');
                toast.error('Unexpected error when loading datasources');
                return;
            }
            datasourceState.update((value) => {
                value.isLoading = true;
                return value;
            });
            const allCollections = await getAllCollections(uid);
            datasourceState.update((value) => {
                value.isLoading = false;
                value.sources = allCollections;
                return value;
            });
        } catch (err) {
            console.error(err);
            toast.error('Unexpected error when loading datasources');
        }
    });
</script>

<Tabs.Root value="grid" class="flex flex-col py-2 px-4 h-screen">
    <div class="flex-0 flex flex-row justify-between items-center pt-4 pb-4">
        <h1 class="font-bold text-3xl tracking-tight">Your Files</h1>
    </div>
    <div class="flex-1 flex flex-row overflow-x-hidden">
        <FilesSidebar/>
        <div class="flex flex-col w-full h-full">
            <div class="flex justify-between items-center">
                <div class="flex items-center text-muted-foreground">
                    <span class="flex items-center font-semibold">
                        <FolderOpenIcon class="w-4 h-4 mr-2"/>
                        Synced Files
                    </span>
                    <ChevronRightIcon class="h-6 w-6 mt-0.5 mr-1"/>
                    <span class="flex items-center font-semibold hover:bg-muted py-1 px-2 rounded">
                        <FolderOpenIcon class="w-4 h-4 mr-2"/>
                        User
                    </span>
                    <ChevronRightIcon class="h-6 w-6 mt-0.5 mr-1"/>
                    <span class="flex items-center font-semibold text-foreground">
                        <FolderIcon class="w-4 h-4 mr-2"/>
                        Documents
                    </span>
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
            <div class="w-full h-full mt-2 rounded p-4 overflow-y-auto">
                <Tabs.Content value="grid">
                    <div class="grid grid-cols-8 2xl:grid-cols-10 container gap-4">
                        {#each list as item}
                            <FolderGridItem name={item}/>
                        {/each}
                    </div>
                </Tabs.Content>
            </div>
        </div>
    </div>
</Tabs.Root>
