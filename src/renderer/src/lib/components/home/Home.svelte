<script>
    import {Button} from '$lib/components/ui/button';
    import {
        createNewCollection,
        createNewDirectory,
        createNewFile,
        getCollectionCursor,
    } from '$lib/services/file-service';

    async function test() {
        // const result = await createNewCollection('New Collection');
        // console.log(result);

        const uid = 'P9raM7Cu88SWRSMMM39ztANMZEN2';
        const colId = 'e4f8e0ea-bafc-4b83-8b89-4ba5fca7c6a6';

        const cursor = await getCollectionCursor(uid, colId);
        await cursor.push('test dir');

        console.log(cursor.getCurrentPath());
        const iter = await cursor.getDirectoryIterator();
        console.log(iter.getCurrentPage());

        await cursor.pop();
        console.log(cursor.getCurrentPath());
        const iter2 = await cursor.getDirectoryIterator();
        console.log(iter2.getCurrentPage());
    }
</script>

<div class="flex justify-center items-center h-full">
    <div class="container flex flex-col space-y-4">
        <h1 class="text-3xl tracking-tight font-bold text-center">Welcome!</h1>
        <div class="flex justify-center">
            <Button on:click={test} variant="outline">Test Me</Button>
        </div>
    </div>
</div>
