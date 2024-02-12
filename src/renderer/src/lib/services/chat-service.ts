import {appState, authState, type Chat, type ChatMessage} from "$lib/store/appstore";
import {firebaseAuth, firestore} from "$lib/services/firebase-service";
import {collection, doc, getDocs, getDoc, setDoc, deleteDoc} from 'firebase/firestore';
import {get} from "svelte/store";
import {toast} from "svelte-sonner";
import {v4 as uuidv4} from "uuid";

export async function getAllChatHistory() {
    try {
        appState.setActiveChatIsBlocked(true);
        const uid = get(authState).user.userID;
        const chatsCol =
            collection(doc(firestore, 'users', uid), 'chats');
        const snapshot = await getDocs(chatsCol);

        const chats = snapshot.docs
            .map(doc => doc.data() as Chat)
            .map(chat => Object.assign(chat, {
                isSendBlocked: false,
                isSaving: false,
            }));

        appState.loadChats(chats);
        appState.setChatsIsLoading(false);
        appState.setActiveChatIsBlocked(false);
    } catch (err) {
        console.log(err);
        toast.error('An error has occurred');
    }
}

export async function createNewChatHistory() {
    const newChat = appState.createNewChat();

    try {
        const uid = get(authState).user.userID;
        const chatDoc =
            doc(doc(firestore, 'users', uid),
                'chats', newChat.id);
        await setDoc(chatDoc, newChat);
    } catch (err) {
        console.log(err);
        toast.error('An error has occurred');
    }
}

export async function deleteChatHistory(id: string) {
    appState.deleteChat(id);

    try {
        const uid = get(authState).user.userID;
        const chatDoc =
            doc(doc(firestore, 'users', uid),
                'chats', id);
        const data = await getDoc(chatDoc);

        await deleteDoc(chatDoc);
        toast.info(`Successfully deleted ${data.data().name}`);
    } catch (err) {
        console.log(err);
        toast.error('An error has occurred');
    }
}

export async function saveChatHistory() {
    try {
        appState.setActiveChatIsSaving(true);
        const state = get(appState);
        const uid = state.auth.user.userID;
        const id = state.chats.activeChat.id;

        const chatDoc =
            doc(doc(firestore, 'users', uid),
                'chats', id);
        const chat = get(appState).chats.history.find(chat => chat.id === id);
        if (chat) {
            await setDoc(chatDoc, chat);
            console.log('Saved chat history');
            appState.setActiveChatIsSaving(false);
        }
    } catch (err) {
        appState.setActiveChatIsSaving(false);

        console.log(err);
        toast.error('An error has occurred');
    }
}

interface ChatResponseChunk {
    id: string;
    is_response: boolean;
    chunk: string;
    is_last: boolean;
}

export async function* generateResponse(message: string, chat: Chat) {
    const response = await fetch('https://chat-service-uhefmk7o7q-uc.a.run.app/api/v1/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${await firebaseAuth.currentUser.getIdToken()}`,
        },
        body: JSON.stringify({
            'model': chat.settings.model,
            'settings': {
                'temperature': chat.settings.temperature,
                'max_token': chat.settings.maxLength,
                'top_p': 0.5,
            },
            'history': chat.history.map(msg => ({
                'role': msg.role,
                'message': msg.content
            })),
            message: message,
        }),
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

export async function sendUserMessage(content: string) {
    const newChatMessage: ChatMessage = {
        id: uuidv4(),
        role: 'user',
        content: content,
        context: {},
        shouldDisplay: true
    };
    appState.setActiveChatIsBlocked(true);
    appState.addActiveChatMessage(newChatMessage);

    const activeChat = get(appState).chats.activeChat;
    const history = activeChat.history.slice(0, -1); // removes the last user message

    for await (const chunk of generateResponse(content, {...activeChat, history: history})) {
        const id = chunk.id;
        appState.update(state => {
            const {history} = state.chats.activeChat;
            if (history[history.length - 1].id !== chunk.id) {
                state.chats.activeChat.history.push({
                    id: id,
                    role: 'assistant',
                    shouldDisplay: true,
                    content: chunk.chunk,
                    context: {}
                });
            } else {
                const message = history[history.length - 1];
                message.content += chunk.chunk;
            }
            return state;
        });
    }

    appState.setActiveChatIsBlocked(false);
}
