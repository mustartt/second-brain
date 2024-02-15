import {writable} from "svelte/store";
import type {ContextSource} from "$lib/store/chat-store";

interface ContextStoreState {
    isOpen: boolean;
    sources: ContextSource[];
}

function createContextStore() {
    const {subscribe, set, update}
        = writable<ContextStoreState>({isOpen: false, sources: []});

    function loadContext(sources: ContextSource[]) {
        set({sources, isOpen: true});
    }

    function toggleShowContext(open: boolean) {
        update((value) => {
            value.isOpen = open;
            return value;
        });
    }

    function clearContext() {
        set({sources: [], isOpen: false});
    }

    return {
        subscribe, set, update,
        loadContext,
        clearContext,
        toggleShowContext
    };
}

export const contextState = createContextStore();
