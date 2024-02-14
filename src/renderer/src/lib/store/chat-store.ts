import {derived, type Writable, writable} from "svelte/store";
import {v4 as uuidv4} from "uuid";
import type {ChatAgentTask} from "$lib/services/chat-service";

interface ChatSettings {
    model: string;
    systemPrompt: string;
    temperature: number;
    maxLength: number;
}

interface DocumentTextContext {
    type: 'document_text';
    score: number;
    content: string;
    metadata: Map<string, string>;
}

export type ContextSource = DocumentTextContext;

export interface AgentTask {
    id: string;
    parentId: string;
    type: string;
    isComplete: boolean;
    duration: number;
    children: AgentTask[];
}

export interface ChatMessage {
    msgId: string;
    role: string;
    content: string;
    context: ContextSource[];
    progressTree: AgentTask | null;
    timestamp: Date;
    isComplete: boolean;
    error: string | null;
}

export interface ChatHistory {
    chatId: string;
    history: ChatMessage[];
}

export interface Chat {
    chatId: string;

    name: string;
    settings: ChatSettings;

    isSendBlocked: boolean;
    isSaving: boolean;

    isLoading: boolean;
    messages: ChatHistory | null;

    timeCreated: Date;
    timeUpdated: Date;
}

interface ChatState {
    activeChatId: string | null;
    isLoading: boolean;
    chats: Map<string, Chat>;
}

export interface ChatHistoryPreview {
    id: string;
    name: string;
    timeCreated: Date;
    timeUpdated: Date;
}

let counter = 1;

function createChatState() {
    const {subscribe, set, update} = writable<ChatState>({
        activeChatId: null,
        isLoading: true,
        chats: new Map()
    });

    function createNewChat() {
        const chatId = uuidv4();
        const defaultChatSettings = {
            model: 'gpt-3.5-turbo',
            temperature: 0.8,
            maxLength: 256,
            systemPrompt: 'You are a helpful assistant.'
        };
        const defaultChatHistory = {
            chatId: chatId,
            history: []
        };
        const newChatObject: Chat = {
            chatId: chatId,
            name: 'New Chat ' + counter++,
            settings: defaultChatSettings,
            isSendBlocked: false,
            isSaving: false,
            isLoading: false,
            messages: defaultChatHistory,
            timeCreated: new Date(),
            timeUpdated: new Date()
        };
        update(value => {
            value.chats.set(chatId, newChatObject);
            return value;
        });
        return newChatObject;
    }

    function deleteChat(id: string) {
        update(value => {
            if (value.activeChatId === id) {
                value.activeChatId = null;
            }
            value.chats.delete(id);
            return value;
        });
    }

    function renameChat(id: string, newName: string) {
        update(value => {
            const chat = value.chats.get(id);
            if (chat) {
                chat.name = newName;
            }
            return value;
        });
    }

    function loadAllChats(chats: Chat[]) {
        update(value => {
            const newMap = new Map<string, Chat>();
            for (const chat of chats) {
                newMap.set(chat.chatId, chat);
            }
            value.chats = newMap;
            if (!value.activeChatId) {
                return value;
            }
            if (!newMap.has(value.activeChatId)) {
                value.activeChatId = null;
            }
            return value;
        });
    }

    function setChatAsActive(id: string) {
        update(value => {
            if (value.chats.has(id)) {
                value.activeChatId = id;
            }
            return value;
        });
    }

    function loadChat(history: ChatHistory) {
        update(value => {
            const chat = value.chats.get(history.chatId);
            if (chat) {
                chat.messages = history;
            }
            return value;
        });
    }

    function unloadChat(id: string) {
        update(value => {
            const chat = value.chats.get(id);
            if (chat) {
                chat.messages = null;
            }
            return value;
        });
    }

    function setChatsIsLoading(isLoading: boolean) {
        update(value => {
            value.isLoading = isLoading;
            return value;
        });
    }

    function setChatIsLoading(id: string, isLoading: boolean) {
        update(value => {
            const chat = value.chats.get(id);
            if (chat) {
                chat.isLoading = isLoading;
            }
            return value;
        });
    }

    function setChatIsBlocked(id: string, isBlocked: boolean) {
        update(value => {
            const chat = value.chats.get(id);
            if (chat) {
                chat.isSendBlocked = isBlocked;
            }
            return value;
        });
    }

    function setChatIsSaving(id: string, isSaving: boolean) {
        update(value => {
            const chat = value.chats.get(id);
            if (chat) {
                chat.isSaving = isSaving;
            }
            return value;
        });
    }

    function insertChatMessage(id: string, msg: ChatMessage) {
        update(value => {
            const chat = value.chats.get(id);
            if (chat && chat.messages) {
                chat.messages.history.push(msg);
            }
            return value;
        });
    }

    function removeErrorMessages(id: string) {
        update(value => {
            const chat = value.chats.get(id);
            if (chat && chat.messages) {
                chat.messages.history = chat.messages.history
                    .filter(msg => !msg.error);
            }
            return value;
        });
    }

    function appendChatMessageResponse(chatId: string, messageId: string,
                                       chunk: string, isComplete: boolean) {
        update(value => {
            const chat = value.chats.get(chatId);
            if (!chat || !chat.messages) return value;
            const idx = chat.messages.history.findLastIndex(msg => msg.msgId === messageId);
            if (idx === -1) return value;
            const msg = chat.messages.history[idx];
            if (msg.isComplete) return value;

            msg.content += chunk;
            msg.isComplete = isComplete;
            if (msg.progressTree) { // sets the root task completion state
                msg.progressTree.isComplete = isComplete;
            }
            return value;
        });
    }

    function appendChatError(chatId: string, messageId: string,
                             error: string) {
        update(value => {
            const chat = value.chats.get(chatId);
            if (!chat || !chat.messages) return value;
            const idx = chat.messages.history.findLastIndex(msg => msg.msgId === messageId);
            if (idx === -1) return value;
            const msg = chat.messages.history[idx];

            msg.error = error;
            return value;
        });
    }

    function appendAgentTask(chatId: string, messageId: string, task: ChatAgentTask) {
        update(value => {
            const chat = value.chats.get(chatId);
            if (!chat || !chat.messages) return value;
            const idx = chat.messages.history.findLastIndex(msg => msg.msgId === messageId);
            if (idx === -1) return value;
            const msg = chat.messages.history[idx];

            const newTaskObject = {
                type: task.event_type,
                id: task.event_id,
                parentId: task.parent_id,
                isComplete: task.completed,
                duration: task.duration_s,
                children: []
            };

            const node = msg.progressTree
                ? recursiveFind(msg.progressTree, task.parent_id)
                : null;
            if (!node) {
                console.warn('unable to find parent id for', task);
                return value;
            }

            if (!task.completed) {
                node.children.push(newTaskObject);
            } else {
                const idx = node.children.findIndex(t => t.id === task.event_id);
                if (idx === -1) {
                    console.warn('unable to find event id in children for', task);
                    node.children.push(newTaskObject);
                } else {
                    const updateNode = node.children[idx];
                    updateNode.isComplete = task.completed;
                    updateNode.duration = task.duration_s;
                }
            }

            return value;
        });
    }

    function appendChatContext(chatId: string, messageId: string, sources: ContextSource[]) {
        update(value => {
            const chat = value.chats.get(chatId);
            if (!chat || !chat.messages) return value;
            const idx = chat.messages.history.findLastIndex(msg => msg.msgId === messageId);
            if (idx === -1) return value;
            const msg = chat.messages.history[idx];

            msg.context = sources;
            return value;
        });
    }

    return {
        subscribe, set, update,
        createNewChat, renameChat, deleteChat,
        loadAllChats,
        setChatAsActive, setChatsIsLoading,
        loadChat, unloadChat,
        setChatIsLoading, setChatIsBlocked, setChatIsSaving,
        insertChatMessage, removeErrorMessages,
        appendChatMessageResponse,
        appendChatError, appendAgentTask,
        appendChatContext
    };
}

function recursiveFind(node: AgentTask, id: string): AgentTask | null {
    if (node.id === id) {
        return node;
    }
    for (const child of node.children) {
        const result = recursiveFind(child, id);
        if (result) {
            return result;
        }
    }
    return null;
}

export const chatState = createChatState();

export const chatHistoryState = derived(chatState, ($store) => {
    const chatsArray: Chat[] = Array.from($store.chats.values());
    return chatsArray
        .sort((a, b) => b.timeCreated.getTime() - a.timeCreated.getTime())
        .map(chat => ({
            id: chat.chatId,
            name: chat.name,
            timeCreated: chat.timeCreated,
            timeUpdated: chat.timeUpdated
        } as ChatHistoryPreview));
});

export const activeChatState = derived<typeof chatState, Chat | null>(chatState, ($store) => {
    if (!$store.activeChatId) return null;
    return $store.chats.get($store.activeChatId) || null;
});
