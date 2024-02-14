import {appState, authState} from "$lib/store/appstore";
import {firebaseAuth, firestore} from "$lib/services/firebase-service";
import {collection, doc, getDocs, getDoc, setDoc, query, where, writeBatch, Timestamp} from 'firebase/firestore';
import {get} from "svelte/store";
import {toast} from "svelte-sonner";
import {v4 as uuidv4} from "uuid";
import {type Chat, type ChatHistory, type ChatMessage, chatState, type ContextSource} from "$lib/store/chat-store";

interface ChatSettingsModel {
    model: string;
    systemPrompt: string;
    temperature: number;
    maxLength: number;
}

interface ChatMessageModel {
    msgId: string;
    role: string;
    content: string;
    context: ContextSource[];
    timestamp: Timestamp;
}

interface ChatHistoryModel {
    userId: string;
    history: ChatMessageModel[];
}

interface ChatModel {
    userId: string;
    name: string;
    settings: ChatSettingsModel;
    messages: string;
    timeCreated: Timestamp;
    timeUpdated: Timestamp;
}

export async function loadChats() {
    try {
        chatState.setChatsIsLoading(true);

        const uid = get(authState).user.userID;
        const chatsQuery = query(
            collection(firestore, 'chats'),
            where('userId', '==', uid)
        );
        const snapshot = await getDocs(chatsQuery);

        const chats: Chat[] = snapshot.docs
            .map(doc => [doc.id, doc.data()] as [string, ChatModel])
            .map(([id, chat]) => ({
                chatId: id,
                name: chat.name,
                settings: chat.settings,

                isSendBlocked: false,
                isSaving: false,
                isLoading: true,

                messages: null,
                timeCreated: chat.timeCreated.toDate(),
                timeUpdated: chat.timeUpdated.toDate(),
            }));

        chatState.loadAllChats(chats);
        chatState.setChatsIsLoading(false);
    } catch (err) {
        console.error(err);
        toast.error('Unexpected error occurred while loading chats');
    }
}

export async function saveChat(chat: Chat) {
    try {
        const uid = get(authState).user.userID;
        const chatRef = doc(collection(firestore, 'chats'), chat.chatId);
        const chatModel: ChatModel = {
            userId: uid,
            messages: chat.chatId,
            name: chat.name,
            settings: chat.settings,
            timeCreated: Timestamp.fromDate(chat.timeCreated),
            timeUpdated: Timestamp.now(),
        };
        await setDoc(chatRef, chatModel);
    } catch (err) {
        console.error(err);
        toast.error('Unexpected error occurred while saving chat');
    }
}

export async function deleteChat(id: string) {
    chatState.deleteChat(id);
    try {
        const uid = get(authState).user.userID;
        const histRef = doc(collection(firestore, 'chat-history'), id);
        const chatRef = doc(collection(firestore, 'chats'), id);

        const batch = writeBatch(firestore);
        batch.delete(histRef);
        batch.delete(chatRef);
        await batch.commit();

        toast.info(`Successfully deleted chat`);
    } catch (err) {
        console.error(err);
        toast.error('Unexpected error occurred while deleting chat');
    }
}

export async function loadChatHistory(id: string) {
    console.log('loading chat history', id);
    try {
        chatState.setChatIsLoading(id, true);
        chatState.setChatIsSaving(id, false);
        chatState.setChatIsBlocked(id, true);
        const histRef = doc(collection(firestore, 'chat-history'), id);
        const document = await getDoc(histRef);

        const history = document.exists()
            ? (document.data() as ChatHistoryModel).history.map(
                msg => Object.assign(msg, {
                    progressTree: null,
                    timestamp: msg.timestamp.toDate(),
                    isComplete: true,
                    error: null
                }))
            : [];
        chatState.loadChat({
            chatId: document.id,
            history: history
        });

        chatState.setChatIsLoading(id, false);
        chatState.setChatIsBlocked(id, false);
    } catch (err) {
        console.error(err);
        toast.error('Unexpected error occurred while loading chat history');
    }
}

async function unloadChatHistory(id: string) {
    await saveChatHistory(id);
    chatState.unloadChat(id);
}

export async function saveChatHistory(id: string) {
    try {
        const history = get(chatState).chats.get(id)?.messages;
        if (!history) return;

        const uid = get(authState).user.userID;
        const histRef = doc(collection(firestore, 'chat-history'), id);
        const historyModel: ChatHistoryModel = {
            userId: uid,
            history: history.history
                .filter(msg => !msg.error)
                .map(msg => ({
                    msgId: msg.msgId,
                    role: msg.role,
                    content: msg.content,
                    context: msg.context,
                    timestamp: Timestamp.fromDate(msg.timestamp)
                }))
        };
        await setDoc(histRef, historyModel);
    } catch (err) {
        console.error(err);
        toast.error('Unexpected error occurred while saving chat history');
    }
}

export async function createNewChat() {
    const newChat = chatState.createNewChat();
    await switchToActiveChat(newChat.chatId);

    const uid = get(authState).user.userID;
    await saveChat(newChat);
}

export async function switchToActiveChat(id: string) {
    console.log('switching to', id);
    const oldID = get(chatState).activeChatId;
    if (oldID === id) return;

    chatState.setChatIsLoading(id, true);
    loadChatHistory(id);
    chatState.setChatAsActive(id);
    await unloadChatHistory(oldID);
}

interface ChatAgentTask {
    completed: boolean;
    event_type: string;
    event_id: string;
    parent_id: string;
    duration_s: number;
}

interface ChatAgentSources {
    score: number | null;
    text: string;
    metadata: { [key: string]: any };
}

type AgentResponseType =
    | 'agent_start'
    | 'agent_complete'
    | 'agent_error'
    | 'agent_event_start'
    | 'agent_event_stop'
    | 'response_start'
    | 'response_stream'
    | 'response_complete'
    | 'response_error';

interface ChatResponseChunk {
    id: string;
    event_type: AgentResponseType;
    task: ChatAgentTask | null;
    error: string | null;
    response_chunk: string;
    sources: ChatAgentSources[];
}

export async function* generateResponse(message: string, chat: Chat) {
    const chatApiUrl = 'https://chat-service-uhefmk7o7q-uc.a.run.app/api/v1/chat';
    // const chatApiUrl = 'http://localhost:8000/api/v1/chat';

    const messages = chat.messages.history.slice(0, -1); // removes the last user message
    const requestBody = JSON.stringify({
        'model': chat.settings.model,
        'settings': {
            'temperature': chat.settings.temperature,
            'max_token': chat.settings.maxLength,
            'top_p': 0.5,
        },
        'history': messages.map(msg => ({
            'role': msg.role,
            'message': msg.content
        })),
        message: message,
    });

    console.log(requestBody);

    const response = await fetch(chatApiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${await firebaseAuth.currentUser.getIdToken()}`,
        },
        body: requestBody,
    });
    if (response.body) {
        const reader = response.body.getReader();
        let decoder = new TextDecoder();
        let buffer = '';
        while (true) {
            const {done, value} = await reader.read();
            if (done) {
                break;
            }
            const chunk = decoder.decode(value, {stream: true});
            buffer += chunk;
            let lines = buffer.split('\n');
            buffer = lines.pop();

            for (const line of lines) {
                if (line) {
                    yield JSON.parse(line) as ChatResponseChunk;
                }
            }
        }
    } else {
        console.error('Streaming not supported');
    }
}

export async function sendUserMessage(chatId: string, content: string) {
    const newChatMessage: ChatMessage = {
        msgId: uuidv4(),
        role: 'user',
        content: content,
        context: [],
        progressTree: null,
        timestamp: new Date(),
        isComplete: true,
        error: null
    };
    chatState.setChatIsBlocked(chatId, true);
    // chatState.removeErrorMessages(chatId);
    chatState.insertChatMessage(chatId, newChatMessage);

    const currentChatState = get(chatState);
    const activeChat = currentChatState.chats.get(currentChatState.activeChatId);
    if (!activeChat) return;

    const responseMessageId = uuidv4();
    const responseMessage: ChatMessage = {
        msgId: responseMessageId,
        role: 'assistant',
        content: '',
        context: [],
        progressTree: null,
        timestamp: new Date(),
        isComplete: false,
        error: null
    };

    chatState.insertChatMessage(chatId, responseMessage);
    // chatState.appendChatMessageResponse(
    //     chatId,
    //     responseMessageId,
    //     'some incomplete text',
    //     false
    // );
    // chatState.appendChatError(chatId,
    //     responseMessageId,
    //     'Some Error Message'
    // );

    try {
        for await (const chunk of generateResponse(content, activeChat)) {
            console.log(chunk);
            switch (chunk.event_type) {
                case "agent_start":
                    break;
                case "agent_complete":
                    break;
                case "agent_error":
                    break;
                case "agent_event_start": {
                    break;
                }
                case "agent_event_stop": {
                    break;
                }
                case "response_start": {
                    chatState.appendChatMessageResponse(
                        chatId,
                        responseMessageId,
                        chunk.response_chunk,
                        false
                    );
                    break;
                }
                case "response_stream": {
                    chatState.appendChatMessageResponse(
                        chatId,
                        responseMessageId,
                        chunk.response_chunk,
                        false
                    );
                    break;
                }
                case "response_complete": {
                    chatState.appendChatMessageResponse(
                        chatId,
                        responseMessageId,
                        chunk.response_chunk,
                        true
                    );
                    break;
                }
                case "response_error": {
                    chatState.appendChatError(
                        chatId,
                        responseMessageId,
                        chunk.error || 'Unknown Error'
                    );
                    break;
                }
            }
        }
    } catch (err) {
        console.error(err);
        toast.error('Unexpected error when getting a response');
        const errorString = '\n\n Unexpected Error: ' + err.message;
        chatState.appendChatError(chatId, responseMessageId, errorString);
    } finally {
        chatState.setChatIsBlocked(chatId, false);
    }
}
