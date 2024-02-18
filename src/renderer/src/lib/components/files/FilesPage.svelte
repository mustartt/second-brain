<script lang="ts">
    import {onMount} from "svelte";
    import {getAllCollections} from "$lib/services/file-service";
    import {firebaseAuth} from "$lib/services/firebase-service";
    import {toast} from "svelte-sonner";
    import {datasourceState} from "$lib/store/files-store";
    import FilesSidebar from "$lib/components/files/FilesSidebar.svelte";

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

<div class="flex flex-col py-2 px-4 h-screen">
    <div class="flex-0 flex flex-row justify-between items-center pt-4 pb-4">
        <h1 class="font-bold text-3xl tracking-tight">Your Files</h1>
    </div>
    <div class="flex-1 flex flex-row overflow-x-hidden">
        <FilesSidebar/>
    </div>
</div>
