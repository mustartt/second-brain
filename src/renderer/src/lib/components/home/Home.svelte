<script>
    import {Button} from '$lib/components/ui/button';
    import axios from 'axios';

    async function test() {
        const response = await fetch('http://localhost:8000/api/v1/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                'model': 'gpt-3.5-turbo',
                'settings': {
                    'temperature': 0.8,
                    'max_token': 256,
                    'top_p': 0.5,
                },
                'history': [
                    {
                        'role': 'system',
                        'message': 'Your are a helpful assistant.',
                    },
                ],
                message: 'What is 1232 * 5371892?',
            }),
        });
        if (response.body) {
            const reader = response.body.getReader();
            let decoder = new TextDecoder();
            let buffer = '';
            while (true) {
                const {done, value} = await reader.read();
                if (done) {
                    break;
                }
                const chunk = decoder.decode(value, {stream: true});
                buffer += chunk;

                let lines = buffer.split('\n');
                buffer = lines.pop();

                lines.forEach(line => {
                    if (line) {
                        console.log(JSON.parse(line));
                    }
                });
            }
        } else {
            console.log('Streaming not supported');
        }
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
