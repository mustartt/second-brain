<script lang="ts">
    import {cn} from "$lib/utils";
    import {Label} from "$lib/components/ui/label";
    import {Input} from "$lib/components/ui/input";
    import {Button} from "$lib/components/ui/button";
    import {Loader2Icon} from "lucide-svelte";
    import GoogleIcon from "$lib/components/ui/icons/GoogleIcon.svelte";
    import {signInWithPopup, signInAnonymously} from 'firebase/auth';
    import {firebaseAuth, googleAuthProvider} from "$lib/services/firebase-service";
    import {toast} from "svelte-sonner";

    let className: string | undefined | null = undefined;
    export {className as class};

    let isLoading = false;

    async function onSubmit() {
        toast.info('not yet implemented');
        isLoading = true;
        setTimeout(() => {
            isLoading = false;
        }, 3000);
    }

    const loginProviders = [
        {
            icon: GoogleIcon,
            text: 'Google',
            handler: async () => {
                try {
                    isLoading = true;
                    await signInWithPopup(firebaseAuth, googleAuthProvider);
                    isLoading = false;
                } catch (err) {
                    toast.error('Failed to login');
                    console.error(err);
                }
            }
        },
        {
            icon: null,
            text: 'Continue as Guest',
            handler: async () => {
                try {
                    isLoading = true;
                    await signInAnonymously(firebaseAuth);
                    isLoading = false;
                } catch (err) {
                    toast.error('Failed to login');
                    console.error(err);
                }
            }
        },
    ];
</script>

<div class={cn("grid gap-6", className)} {...$$restProps}>
    <form on:submit|preventDefault={onSubmit}>
        <div class="grid gap-2">
            <div class="grid gap-1">
                <Label class="sr-only" for="email">Email</Label>
                <Input
                    id="email"
                    placeholder="name@example.com"
                    type="email"
                    autocapitalize="none"
                    autocomplete="email"
                    autocorrect="off"
                    disabled={isLoading}
                />
                <Label class="sr-only" for="password">Password</Label>
            </div>
            <Button disabled={isLoading} on:click={onSubmit}>
                {#if isLoading}
                    <Loader2Icon class="mr-2 h-4 w-4 animate-spin"/>
                {/if}
                Continue with Email
            </Button>
        </div>
    </form>
    <div class="relative">
        <div class="absolute inset-0 flex items-center">
            <span class="w-full border-t"/>
        </div>
        <div class="relative flex justify-center text-xs">
            <span class="bg-background px-2 text-muted-foreground"> Or continue with </span>
        </div>
    </div>
    <div class="flex flex-col space-y-2">
        {#each loginProviders as provider}
            <Button variant="outline"
                    type="button"
                    disabled={isLoading}
                    on:click={provider.handler}>
                {#if isLoading}
                    <Loader2Icon class="mr-2 h-4 w-4 animate-spin"/>
                {:else}
                    <svelte:component this={provider.icon} class="mr-2 h-4 w-4"/>
                {/if}
                {provider.text}
            </Button>
        {/each}
    </div>

</div>
