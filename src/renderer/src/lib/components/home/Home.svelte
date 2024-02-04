<script>
    import {Button} from '$lib/components/ui/button';
    import {firebaseAuth} from '$lib/services/firebase-service';
    import {getIdToken} from 'firebase/auth';
    import axios from 'axios';

    async function test() {
        const token = await getIdToken(firebaseAuth.currentUser);
        const data = {};
        const result = await axios.post(
            'http://127.0.0.1:5001/speedy-atom-413006/us-central1/ingest_file',
            data,
            {headers: {'Authorization': `Bearer ${token}`}},
        );
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
