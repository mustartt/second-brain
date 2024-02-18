<script lang="ts">
    import type {DataSource} from "$lib/services/file-service";
    import type {ComponentType, SvelteComponent} from "svelte";
    import {WallpaperIcon} from "lucide-svelte";
    import {Button} from "$lib/components/ui/button";
    import {loadNewDataSource} from "$lib/services/datasource-service";

    const IconMap: Record<DataSource['type'], ComponentType> = {
        'document': WallpaperIcon
    };

    export let item: DataSource;

    async function handleSwitchingCollection() {
        await loadNewDataSource(item);
    }

</script>

<Button variant="ghost" on:click={handleSwitchingCollection}>
    <div class="flex items-center text-muted-foreground">
        <svelte:component this={IconMap[item.type]} class="w-5 h-5 mr-2"/>
        <span class="font-semibold">
        {item.name}
    </span>
    </div>
</Button>
