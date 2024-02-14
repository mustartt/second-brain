import {derived, writable} from "svelte/store";
import type {ComponentType} from "svelte";
import {v4 as uuidv4} from 'uuid';

export type Layout = 'home' | 'answer' | 'chat' | 'files' | 'queue' | 'settings';

interface LayoutState {
    isSidebarExpanded: boolean;
    activeLayout: Layout;
}

export interface SidebarItem {
    title: string;
    icon: ComponentType;
    layout: Layout;
    handler: () => void;
}

export interface User {
    name: string;
    userID: string;
    picture: string;
    email: string;
}

export interface UserState {
    isLoading: boolean;
    hasAuth: boolean;
    user: User | null;
}

export interface AppStore {
    layout: LayoutState;
    auth: UserState;
}

function createAppStore(initialState: AppStore) {
    const {subscribe, set, update} = writable<AppStore>(initialState);


    function toggleSidebar() {
        update(value => {
            value.layout.isSidebarExpanded = !value.layout.isSidebarExpanded;
            return value;
        });
    }

    function setActiveLayout(layout: Layout) {
        update(value => {
            value.layout.activeLayout = layout;
            return value;
        });
    }

    function finishLoading() {
        update(value => {
            value.auth.isLoading = false;
            return value;
        });
    }

    function updateUser(user: User | null) {
        update(value => {
            value.auth.hasAuth = user !== null;
            value.auth.user = user;
            return value;
        });
    }

    return {
        subscribe, set, update,
        toggleSidebar,
        setActiveLayout,
        updateUser, finishLoading
    };
}

const initialAppState: AppStore = {
    layout: {
        isSidebarExpanded: false,
        activeLayout: 'home'
    },
    auth: {
        isLoading: true,
        hasAuth: false,
        user: null
    }
};

export const appState = createAppStore(initialAppState);
export const layoutState = derived(appState, ($store) => $store.layout);
export const authState = derived<typeof appState, UserState>(appState, ($store) => {
    return $store.auth;
});
