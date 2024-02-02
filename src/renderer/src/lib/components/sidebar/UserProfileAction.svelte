<script>
    import {Button} from '$lib/components/ui/button';
    import {toast} from 'svelte-sonner';
    import {logout} from '$lib/services/auth-service';

    async function handleLogout() {
        try {
            await logout();
        } catch (err) {
            toast.error('Failed to sign out');
            console.error(err);
        }
    }
</script>

<div class="grid gap-4">
    <div class="space-y-2">
        <h4 class="font-medium leading-none">Your Profile</h4>
        <p class="text-sm text-muted-foreground">
            This is your user profile.
        </p>
    </div>
    <div class="grid grid-cols-2 gap-2">
        <Button variant="outline" on:click={() => toast.info('not yet implemented')}>Save Changes</Button>
        <Button variant="outline" on:click={handleLogout}>Logout</Button>
    </div>
</div>
