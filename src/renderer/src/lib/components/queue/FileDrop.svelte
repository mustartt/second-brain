<script lang="ts">
    import {AspectRatio} from '$lib/components/ui/aspect-ratio';
    import Dropzone from 'svelte-file-dropzone';
    import {cn} from "$lib/utils";
    import {PlusIcon} from "lucide-svelte";
    import {toast} from "svelte-sonner";

    export let maxFileSize = 1e+9; // 1GB

    export let handler: (files: File[]) => any;

    function handleFileIngest(e: any) {
        const {acceptedFiles, fileRejections} = e.detail;
        for (const error of fileRejections) {
            const {file, errors} = error;
            const reason = errors.map(err => err.code + ": " + err.message).join('\n');
            const msg = `Error: File ${file.name}`;
            toast.error(msg, {
                description: reason,
            });
        }
        handler(acceptedFiles as File[]);
    }
</script>

<div class="w-full max-w-72">
    <AspectRatio ratio={1} class="">
        <Dropzone
            containerClasses="w-full h-full p-2"
            maxSize={maxFileSize}
            disableDefaultStyles={true}
            on:drop={handleFileIngest}>
            <div class={cn(
                                "flex w-full h-full justify-center items-center rounded-2xl transition-colors border-8 border-dashed",
                                "border-muted hover:bg-muted hover:border-muted-foreground"
                                )}>
                <div class="flex flex-col items-center">
                    <PlusIcon class="w-12 h-12"/>
                    <h1 class="font-semibold text-lg ">Drop Files to Index</h1>
                </div>
            </div>
        </Dropzone>
    </AspectRatio>
</div>
