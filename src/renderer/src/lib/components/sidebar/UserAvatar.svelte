<script lang="ts">
    import * as Avatar from "$lib/components/ui/avatar";
    import type {User} from "$lib/store/appstore";

    export let user: User;
</script>

<Avatar.Root class="w-8 h-8 hover:bg-accent">
    <Avatar.Image src={user.picture} alt="User Profile"/>
    <Avatar.Fallback>@</Avatar.Fallback>
</Avatar.Root>
