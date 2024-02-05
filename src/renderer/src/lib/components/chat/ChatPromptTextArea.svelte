<script lang="ts">
    export let value = '';
    export let handleKeyPress: (event: KeyboardEvent) => void;
</script>

<div class="flex-grow p-2">
    <textarea
        bind:value
        on:keydown={handleKeyPress}
        placeholder="Message ChatGPT..."
        class="flex min-h-[5.5rem] px-3 py-2 resize-none w-full rounded-md border border-input bg-transparent ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"/>
</div>
