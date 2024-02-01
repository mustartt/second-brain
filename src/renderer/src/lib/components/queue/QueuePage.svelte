<script lang="ts">
    import LocalFileCard from "$lib/components/queue/LocalFileCard.svelte";
    import {Button} from "$lib/components/ui/button";
    import {onMount} from "svelte";
    import {initializeApp, type FirebaseApp} from "firebase/app";
    import {getAuth, signInWithPopup, GoogleAuthProvider, type Auth} from "firebase/auth";

    function handleClick() {
        const api = window.api as any;
        api.login();
    }

    let app: FirebaseApp;
    let auth: Auth;

    onMount(() => {
        const firebaseConfig = {
            apiKey: "AIzaSyA4jO0dckZV9Q8wNsP6p6F6_nLJOov-3O4",
            authDomain: "speedy-atom-413006.firebaseapp.com",
            projectId: "speedy-atom-413006",
            storageBucket: "speedy-atom-413006.appspot.com",
            messagingSenderId: "664044881400",
            appId: "1:664044881400:web:a03d66cc7af41f7f35020d",
            measurementId: "G-F7ERQHTJLB"
        };

        app = initializeApp(firebaseConfig);
        auth = getAuth(app);

        console.log(auth.currentUser);
        auth.onAuthStateChanged((user) => {
            console.log('new user state', user);
        });
    });

    function handleClick2() {
        const provider = new GoogleAuthProvider();
        signInWithPopup(auth, provider)
            .then(async result => {
                console.log(result);
                if (window !== undefined) {
                    const token = await result.user.getIdTokenResult();
                    // const token = (result as any)._tokenResponse.oauthIdToken;
                    window.location.href = 'electron-fiddle://' + token;
                }
            })
            .catch(err => {
                console.log('failed', err);
            });
    }

</script>

<div class="flex flex-col py-2 px-4 h-screen">
    <div class="flex-0 flex flex-row pt-4 pb-4">
        <h1 class="font-bold text-3xl tracking-tight">File Queue</h1>
    </div>
    <div class="flex-1 flex flex-row overflow-x-hidden space-x-2">
        <div class="flex flex-col w-1/2">
            <LocalFileCard/>
        </div>
        <div class="flex justify-center items-center w-1/2">
            <Button on:click={handleClick}>
                Login 1 {window.location.href}
            </Button>
            <Button on:click={handleClick2}>
                Login 2
            </Button>
        </div>
    </div>
</div>
