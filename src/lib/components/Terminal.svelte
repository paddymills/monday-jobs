<script lang="ts">
	import type { TerminalItem } from '$lib/Terminal.ts';
	import TerminalLine from '$lib/components/TerminalLine.svelte';

	let items: Array<TerminalItem> = new Array();

	export function addTerminalItem(item: TerminalItem) {
		items.push(item);
	}
</script>

<div class="terminal">
	{#each Object.entries(items) as [id, item]}
		<TerminalLine {item} />
	{/each}
</div>

<style lang="scss">
	.terminal {
		border-radius: 8px;
		margin: 16px;
		padding: 16px;
		width: 30em;
		height: 25em;

		color: #ffffff;
		font-size: 16px;
		font-family: 'Consolas', 'monaco', monospace;
		text-shadow: 0 0 2px #f5f6f8;

		background-color: #323338;
	}

	.terminal {
		overflow: auto;

		/* hide scrollbar*/
		-ms-overflow-style: none; /* IE and Edge */
		scrollbar-width: none; /* Firefox */
	}

	/* hide scrollbar for Chrome (and Safari and Opera)*/
	.terminal::-webkit-scrollbar {
		display: none;
	}
</style>
