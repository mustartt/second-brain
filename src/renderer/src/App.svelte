<script lang="ts">
    import Sidebar from "$lib/components/sidebar/Sidebar.svelte";
    import ChatPage from "$lib/components/chat/ChatPage.svelte";
    import {Toaster} from "$lib/components/ui/sonner";
    import {appState, authState, type Layout, layoutState} from "$lib/store/appstore";
    import {type ComponentType, onDestroy, onMount} from "svelte";
    import QueuePage from "$lib/components/queue/QueuePage.svelte";
    import FrontPage from "$lib/components/front-page/FrontPage.svelte";
    import {Loader2Icon} from "lucide-svelte";
    import {firebaseAuth} from "$lib/services/firebase-service";
    import {onAuthStateChanged} from "firebase/auth";
    import {toast} from "svelte-sonner";
    import Home from "$lib/components/home/Home.svelte";
    import FilesPage from "$lib/components/files/FilesPage.svelte";

    let activeTab: Layout;
    let hasAuth: boolean;
    let isLoading: boolean;
    let displayLogoutTimeoutID: any;

    const layoutMap: Record<Layout, ComponentType | null> = {
        "home": Home,
        "answer": null,
        "chat": ChatPage,
        "files": FilesPage,
        "queue": QueuePage,
        "settings": null,
    };

    const unsubLayout = layoutState.subscribe(value => {
        activeTab = value.activeLayout;
    });

    const unsubAuth = authState.subscribe(value => {
        hasAuth = value.hasAuth;
        isLoading = value.isLoading;
    });

    onMount(() => {
        setTimeout(() => {
            const warning = document.getElementsByClassName("firebase-emulator-warning");
            for (const element of warning) {
                (element as HTMLElement).style.display = "none";
                toast.info("Disabled firebase emulator warnings");
            }
        }, 3000);

        setTimeout(() => {
            onAuthStateChanged(firebaseAuth, user => {
                console.log("auth:changed", user);
                if (user) {
                    const name = user.displayName || "Guest User";
                    const defaultProfile = new URL("https://ui-avatars.com/api");
                    defaultProfile.searchParams.append("name", name);
                    defaultProfile.searchParams.append("background", "random");
                    appState.updateUser({
                        name: name,
                        picture: user.photoURL || defaultProfile.toString(),
                        userID: user.uid,
                        email: user.email || user.uid,
                    });
                } else {
                    if (hasAuth) {
                        displayLogoutTimeoutID = setTimeout(() => {
                            clearTimeout(displayLogoutTimeoutID);
                            toast.info("You are now signed out!");
                        }, 500);
                        appState.updateUser(null);
                    }
                }
                appState.finishLoading();
            });
        }, 1000);
    });

    onDestroy(() => {
        unsubLayout();
        unsubAuth();
    });
</script>

<Toaster closeButton={true} expand={true}/>


{#if isLoading}
    <main class="bg-background w-screen h-screen max-w-full max-h-full flex flex-ro justify-center items-center">
        <Loader2Icon class="h-10 w-10 animate-spin text-muted-foreground"/>
    </main>
{:else }
    <main class="bg-background w-screen h-screen max-w-full max-h-full flex flex-row">
        {#if hasAuth}
            <div class="flex-none">
                <Sidebar/>
            </div>
            <div class="flex-auto flex border-l-[1px] border-l-accent">
                {#if layoutMap[activeTab] }
                    <svelte:component this={layoutMap[activeTab]}/>
                {/if}
            </div>
        {:else }
            <FrontPage/>
        {/if}
    </main>
{/if}

