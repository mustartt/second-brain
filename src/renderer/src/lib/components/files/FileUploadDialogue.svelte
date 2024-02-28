<script context="module" lang="ts">
    export type UploadEvent = { files: FileList };
</script>

<script lang="ts">
    import {createEventDispatcher} from "svelte";
    import type {ChangeEventHandler} from "svelte/elements";

    const dispatch = createEventDispatcher();

    let el: HTMLInputElement;

    export function open() {
        el.click();
    }

    const handleFileChange: ChangeEventHandler<HTMLInputElement> = (event) => {
        const files = event.currentTarget.files;
        dispatch("upload", {
            files,
        });
    };
</script>

<input bind:this={el}
       name="upload" multiple type="file" id="hidden-input"
       class="w-0 h-0 overflow-hidden"
       on:change={handleFileChange}/>
