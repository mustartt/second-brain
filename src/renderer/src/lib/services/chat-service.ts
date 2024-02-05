import {appState, authState, type Chat} from "$lib/store/appstore";
import {firestore} from "$lib/services/firebase-service";
import {collection, doc, getDocs, getDoc, setDoc, deleteDoc} from 'firebase/firestore';
import {get} from "svelte/store";
import {toast} from "svelte-sonner";

export async function getAllChatHistory() {
    try {
        const uid = get(authState).user.userID;
        const chatsCol =
            collection(doc(firestore, 'user', uid), 'chats');
        const snapshot = await getDocs(chatsCol);

        const chats = snapshot.docs
            .map(doc => doc.data() as Chat)
            .map(chat => Object.assign(chat, {
                isSendBlocked: false,
                isSaving: false,
            }));

        appState.loadChats(chats);
        console.log(JSON.stringify(chats));
        appState.setChatsIsLoading(false);
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
            doc(doc(firestore, 'user', uid),
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
            doc(doc(firestore, 'user', uid),
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
            doc(doc(firestore, 'user', uid),
                'chats', id);
        const chat = get(appState).chats.history.find(chat => chat.id === id);
        if (chat) {
            await setDoc(chatDoc, chat);
            appState.setActiveChatIsSaving(false);
        }
    } catch (err) {
        appState.setActiveChatIsSaving(false);

        console.log(err);
        toast.error('An error has occurred');
    }
}
