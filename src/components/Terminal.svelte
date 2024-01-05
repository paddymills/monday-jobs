<script lang="ts" context="module">
	import { type ComponentType } from "svelte";

	type TerminalItem<T> = { component: ComponentType, props: T };
	type MessageProps = { text: string, promise: Promise<any> };
	type GroupProps = { text: string, items: Array<TerminalMessage> };

	export type TerminalMessage = TerminalItem<MessageProps>;
	export type TerminalGroup = TerminalItem<GroupProps>;

	export function newTerminalMessage(text: string, promise: Promise<any>): TerminalMessage {
		return { component: AsyncMessage, props: { text, promise } };
	}
	export function newTerminalGroup(text: string): TerminalGroup {
		return { component: AsyncGroup, props: { text, items: new Array() } };
	}
</script>

<script lang="ts">
	import AsyncMessage from "./AsyncMessage.svelte";
	import AsyncGroup from "./AsyncGroup.svelte";

	import { writable, type Writable } from "svelte/store";

	type TerminalItems = Array<TerminalMessage | TerminalGroup>;
	export let store: Writable<TerminalItems> = writable(new Array());
	let items: TerminalItems;
	store.subscribe((values) => items = values);

	export function clear(): void {
		store.set(new Array());
	}

	export const addMessage = (text: string, promise: Promise<any>) => add( newTerminalMessage(text, promise) );
	export const addGroup = (group: TerminalGroup) => add(group);

	function add(item: TerminalGroup | TerminalMessage): void {
		store.update((items) => {
			items.push(item);
			return items;
		})
	}
</script>

<div class="terminal">
	<ul class = "fa-ul">
		{#each items as item}
		<svelte:component this={item.component} {...item.props} />
		{/each}
	</ul>
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
		font-weight: 700;

		background-color: #323338;
		
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
