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

interface ChatSettings {
    model: string;
    temperature: number;
    maxLength: number;
}

interface ChatMessage {
    id: string;
    role: string;
    shouldDisplay: boolean;
    content: string;
    context: any; // todo: add context type
}

export interface Chat {
    id: string;
    name: string;
    history: ChatMessage[];
    settings: ChatSettings;
}

export interface ChatHistoryPreview {
    id: string;
    name: string;
}

export interface ChatState {
    isLoading: boolean;
    activeChat: Chat | null;
    history: Chat[];
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

export type Document = LocalDocument;
type DocumentStatus = 'pending' | 'started' | 'finished' | 'error';

export interface IDocument {
    id: string;
    name: string;
    path: string;
    timeAdded: Date;
    status: DocumentStatus;
    error: string | null;
}

export interface LocalDocument extends IDocument {
    type: 'fs';
}

export interface DocumentQueue {
    items: Document[];
}

export interface AppStore {
    layout: LayoutState;
    chats: ChatState;
    queue: DocumentQueue;
    auth: UserState;
}

function createAppStore(initialState: AppStore) {
    const {subscribe, set, update} = writable<AppStore>(initialState);

    function createNewChat() {
        const defaultChatSettings = {
            model: 'gpt-3.5-turbo',
            temperature: 0.8,
            maxLength: 256
        };
        const newChatObject: Chat = {
            id: uuidv4(),
            name: 'New Chat',
            history: [],
            settings: defaultChatSettings
        };
        update(value => {
            value.chats.history = [newChatObject, ...value.chats.history];
            value.chats.activeChat = newChatObject;
            return value;
        });
        return newChatObject;
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

    function loadChats(chats: Chat[]) {
        update(value => {
            value.chats.activeChat = null;
            value.chats.history = chats;
            return value;
        });
    }

    function setChatsIsLoading(isLoading: boolean) {
        update(value => {
            value.chats.isLoading = isLoading;
            return value;
        });
    }


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

    function addDocumentToQueue(doc: Document) {
        update(value => {
            value.queue.items.push(doc);
            return value;
        });
    }

    function popDocumentFromQueue(callback: (doc: Document | null) => void) {
        update(value => {
            if (value.queue.items.length > 0) {
                const doc = value.queue.items.shift();
                callback(doc);
            }
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
        createNewChat,
        deleteChat,
        loadChats,
        setChatsIsLoading,
        toggleSidebar,
        setActiveLayout,
        addDocumentToQueue,
        popDocumentFromQueue,
        updateUser, finishLoading
    };
}

const initialAppState: AppStore = {
    layout: {
        isSidebarExpanded: false,
        activeLayout: 'home'
    },
    chats: {
        isLoading: true,
        activeChat: null,
        history: []
    },
    queue: {
        items: []
    },
    auth: {
        isLoading: true,
        hasAuth: false,
        user: null
    }
};

// exposed stores

export const appState = createAppStore(initialAppState);

export const layoutState = derived(appState, ($store) => $store.layout);
export const chatHistoryState = derived<typeof appState, ChatHistoryPreview[]>(appState,
    ($store) => $store.chats.history.map(chat => {
        return {
            id: chat.id,
            name: chat.name
        };
    }));

export const authState = derived<typeof appState, UserState>(appState, ($store) => {
    return $store.auth;
});
