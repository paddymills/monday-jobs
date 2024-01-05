<script lang="ts">
    import { type TerminalMessage } from "./Terminal.svelte";
    import AsyncMessage from "./AsyncMessage.svelte";

    export let text: string;
    export let items: Array<TerminalMessage>;

    $: promise = Promise.allSettled(items.map((i) => i.props.promise));
	$: props = { text, promise };
</script>

<AsyncMessage {...props} />
<ul class = "fa-ul">
    {#each items as item}
    <svelte:component this={item.component} {...item.props} />
    {/each}
</ul>