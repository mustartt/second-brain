<script lang="ts">
    import {onMount} from 'svelte';

    export let minWidth = 100;

    let containerW: any;

    let splitterWidth = 8; /* 2 rem */
    let mousePos: any;
    let delta = 0;
    let isMouseDown = false;
    let windowW: any;
    let initialL: any;
    let leftW: any;
    let rightW: any;

    onMount(() => {
        leftW = 2 * (containerW - splitterWidth) / 3;
        rightW = (containerW - splitterWidth) / 3;
    });

    function handleMouseMove(e: any) {
        if (isMouseDown) {
            delta = mousePos - e.clientX;
            leftW =
                initialL - delta <= minWidth ?
                    minWidth
                    : initialL - delta >= containerW - splitterWidth - minWidth ?
                        containerW - splitterWidth - minWidth
                        :
                        initialL - delta;
            rightW = containerW - leftW - splitterWidth;
        }
    }

    function handleMouseDown(e: any) {
        mousePos = e.clientX;
        initialL = leftW;
        isMouseDown = true;
    }

    function handleMouseUp() {
        isMouseDown = false;
    }

</script>

<style>
    .window-hook {
        height: 100%;
        width: 100%;
        z-index: 5000;
        position: absolute;
        top: 0;
        left: 0;
    }

    .disable-select, .disable-select * {
        user-select: none; /* supported by Chrome and Opera */
        -webkit-user-select: none; /* Safari */
        -moz-user-select: none; /* Firefox */
        -ms-user-select: none; /* Internet Explorer/Edge */
        cursor: col-resize;
    }
</style>

<svelte:window
        on:mousemove={handleMouseMove}
        on:mouseup={handleMouseUp}
/>
<section
        class={"flex " + (isMouseDown ? "disable-select" : "")}
        bind:clientWidth={containerW}>
    <div
            style="width:{leftW}px !important"
            class="flex">
        <slot name="left"></slot>
        {#if isMouseDown}
            <div class="window-hook"/>
        {/if}
    </div>
    <!-- svelte-ignore a11y -->
    <span
            role="separator"
            aria-orientation="vertical"
            aria-label="Draggable Divider"
            aria-grabbed="{isMouseDown}"
            on:mousedown={handleMouseDown}
            class="flex h-full w-2 cursor-col-resize flex-col items-center justify-center border-l-[1px] border-r-[1px] border-l-accent border-r-accent hover:bg-neutral-500">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2 14" width="2" height="14" fill="currentColor"
             class="text-neutral-400">
            <circle r="1" transform="matrix(4.37114e-08 -1 -1 -4.37114e-08 1 1)"></circle>
            <circle r="1" transform="matrix(4.37114e-08 -1 -1 -4.37114e-08 1 7)"></circle>
            <circle r="1" transform="matrix(4.37114e-08 -1 -1 -4.37114e-08 1 13)"></circle>
        </svg>
    </span>
    <div style="width:{rightW}px !important"
         class="h-full">
        <slot name="right"></slot>
        {#if isMouseDown}
            <div class="window-hook"/>
        {/if}
    </div>
</section>
