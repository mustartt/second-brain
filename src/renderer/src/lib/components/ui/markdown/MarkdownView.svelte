<script lang="ts">
    import {marked} from "marked";

    export let text: string;
</script>

<article class="prose prose-invert prose-img:rounded prose-ul:my-0 prose-ol:my-0 prose-li:my-0">
    {@html marked(text)}
</article>
