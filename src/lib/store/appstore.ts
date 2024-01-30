import {derived, writable} from "svelte/store";
import {HomeIcon} from "lucide-svelte";
import type {ComponentType} from "svelte";
import {v4 as uuidv4} from 'uuid';
import exp from "node:constants";

export type Layout = 'home' | 'answer' | 'chat' | 'files' | 'queue' | 'settings';

interface LayoutState {
    isSidebarExpanded: boolean;
    activeLayout: Layout;
}


export interface SidebarItem {
    title: string,
    icon: ComponentType,
    handler: () => void
}

interface ChatSettings {

}

interface Chat {
    id: string;
    name: string;
    history: any; // todo: add history type
    settings: ChatSettings;
}

export interface ChatHistoryPreview {
    id: string;
    name: string;
}

export interface AppStore {
    layout: LayoutState;
    chats: {
        activeChat: Chat | null;
        history: Chat[]
    };
}

function createAppStore(initialState: AppStore) {
    const {subscribe, set, update} = writable<AppStore>(initialState);

    function createNewChat() {
        const newChatObject: Chat = {
            id: uuidv4(),
            name: 'New Chat',
            history: [],
            settings: {}
        };
        update(value => {
            value.chats.history = [newChatObject, ...value.chats.history];
            value.chats.activeChat = newChatObject;
            return value;
        });
    }

    function deleteChat(id: string) {
        update(value => {
            if (value.chats.activeChat?.id === id) {
                value.chats.activeChat = null;
            }
            value.chats.history = value.chats.history.filter(chat => chat.id !== id);
            return value;
        });
    }

    return {
        subscribe, set, update,
        createNewChat,
        deleteChat
    };
}

export const appState = createAppStore({
    layout: {
        isSidebarExpanded: false,
        activeLayout: 'home'
    },
    chats: {
        activeChat: null,
        history: []
    }
});

export const layoutState = derived(appState, ($store) => $store.layout);
export const chatHistoryState = derived<typeof appState, ChatHistoryPreview[]>(appState,
    ($store) => $store.chats.history.map(chat => {
        return {
            id: chat.id,
            name: chat.name
        };
    }));