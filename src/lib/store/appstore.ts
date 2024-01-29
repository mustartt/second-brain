import {derived, writable} from "svelte/store";
import {HomeIcon} from "lucide-svelte";
import type {ComponentType} from "svelte";

interface LayoutState {
    isSidebarExpanded: boolean;

}

export type Layout = 'home' | 'answer' | 'chat' | 'files' | 'queue' | 'settings';

export interface AppStore {
    layout: LayoutState;
}

export interface SidebarItem {
    title: string,
    icon: ComponentType,
    handler: () => void
}

export const appState = writable<AppStore>({
    layout: {
        isSidebarExpanded: false
    }
});

export const layoutState = derived(appState, ($store) => $store.layout);