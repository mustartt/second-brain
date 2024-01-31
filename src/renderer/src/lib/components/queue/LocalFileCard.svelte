<script lang="ts">
    import FileDrop from '$lib/components/queue/FileDrop.svelte';
    import * as Card from '$lib/components/ui/card';

    function handler(files: File[]) {
        console.log(files);
    }
</script>
<Card.Root>
    <Card.Header>
        <Card.Title>Individual Files</Card.Title>
        <Card.Description>
            Drag you individual files here to quickly add them to your index.
            You can add as many as you want. Max Size 1GB.
        </Card.Description>
    </Card.Header>
    <Card.Content>
        <div class="flex justify-center items-center">
            <FileDrop handler={handler}/>
        </div>
    </Card.Content>
</Card.Root>
