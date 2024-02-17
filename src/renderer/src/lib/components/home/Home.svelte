<script>
    import {Button} from '$lib/components/ui/button';
    import {createNewCollection, createNewDirectory} from '$lib/services/file-service';

    async function test() {
        // const result = await createNewCollection('New Collection');
        // console.log(result);

        const uid = 'P9raM7Cu88SWRSMMM39ztANMZEN2';
        const colId = '911d862b-8509-4604-bcb1-20c7f14d4c19';
        await createNewDirectory(uid, colId, '/test dir/SomeOtherDirectory/sampleadjlai/dne/123');
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
