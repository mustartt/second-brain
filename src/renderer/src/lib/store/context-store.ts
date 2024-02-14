import {writable} from "svelte/store";
import type {ContextSource} from "$lib/store/chat-store";

function createContextStore() {
    const {subscribe, set, update} = writable<ContextSource[]>([]);

    function loadContext(sources: ContextSource[]) {
        set(sources);
    }

    function clearContext() {
        set([]);
    }

    return {
        subscribe, set, update,
        loadContext,
        clearContext
    };
}

export const contextState = createContextStore();
