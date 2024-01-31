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

export interface User {
  name: string;
  userID: string;
  picture: string;
  email: string;
}

export interface UserState {
  hasAuth: boolean;
  user: User | null;
}

export interface AppStore {
  layout: LayoutState;
  chats: {
    activeChat: Chat | null;
    history: Chat[]
  };
  auth: UserState;
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

  return {
    subscribe, set, update,
    createNewChat,
    deleteChat,
    toggleSidebar,
    setActiveLayout
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
  },
  auth: {
    hasAuth: true,
    user: {
      name: 'John Foo',
      userID: 'google-oauth2|103547991597142817347',
      picture: 'https://avatars.githubusercontent.com/u/124599?v=4',
      email: 'johnfoo@gmail.com',
    }
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

export const authState = derived<typeof appState, User | null>(appState, ($store) => {
  if ($store.auth.hasAuth) {
    return $store.auth.user!;
  }
  return null;
});
