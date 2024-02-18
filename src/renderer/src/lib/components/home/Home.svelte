<script>
    import {Button} from '$lib/components/ui/button';
    import {
        createNewCollection,
        createNewDirectory,
        createNewFile,
        getCollectionCursor,
    } from '$lib/services/file-service';

    async function test() {
        const result = await createNewCollection('New Collection');
        console.log(result);
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
