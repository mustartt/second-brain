<script lang="ts">
    import {Button} from "$lib/components/ui/button";
    import {httpsCallable} from "firebase/functions";
    import {functions} from "$lib/services/firebase-service";

    async function test() {
        const deleteFolder = httpsCallable(functions, "deleteFolder");

        console.time("time");
        const result = await deleteFolder({
            folderId: "703fff5f-7093-499d-bfed-2cdaf078938f",
        });
        console.log(result);
        console.timeEnd("time");
    }

    async function test2() {
        const createDataSource = httpsCallable(functions, "createDataSource");
        const createFolder = httpsCallable(functions, "createFolder");

        const ds = (await createDataSource({
            id: "118924b4-554c-412c-8497-2af71c3c27fa",
            type: "document",
            name: "New Test Data Source",
        })).data;
        const rootId = (ds as any).root;
        console.log("rootId", rootId);

        await createFolder({
            parentId: rootId,
            folderId: "703fff5f-7093-499d-bfed-2cdaf078938f",
            name: "Dir 1",
        });
        await createFolder({
            parentId: "703fff5f-7093-499d-bfed-2cdaf078938f",
            folderId: "e6ba72f9-686a-4af7-8984-6acd57fd7d44",
            name: "Dir 2",
        });
    }
</script>

<div class="flex justify-center items-center h-full">
    <div class="container flex flex-col space-y-4">
        <h1 class="text-3xl tracking-tight font-bold text-center">Welcome!</h1>
        <div class="flex justify-center">
            <Button on:click={test} variant="outline">Test 1</Button>
            <Button on:click={test2} variant="outline">Test 2</Button>
        </div>
    </div>
</div>
