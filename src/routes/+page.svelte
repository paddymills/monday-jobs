<script lang="ts">
	import FileDropBox from '$lib/components/FileDropper.svelte';
	import Terminal from '$lib/components/Terminal.svelte';

	import { FileParser, Job } from '$lib/FileParser.ts';
	import { MondayService } from '$lib/services/MondayService.ts';
	
	import { onMount } from 'svelte';
	
	// monday.com SDK
	import mondaySdk from 'monday-sdk-js';
	import { AsyncTerminalMessage, AsyncTerminalMessageGroup, TerminalMessage } from '$lib/Terminal.ts';
	const monday = mondaySdk();

	
	// for getting column name when in settings as { columnName: true }
	function getKey(obj: object) {
		return Object.keys(obj)[0];
	}

	let boardId = -1;
	
	let earlyStartColumn = "";
	let mainStartColumn = "";
	let pmColumn = "";
	let baysColumn = "";
	let productsColumn = "";

	let fileParser: FileParser;
	let term: Terminal;

	onMount(() => {
		console.clear();

		// context/settings -> update state
		monday.listen("settings", (res) => {
			console.log(res);

			earlyStartColumn = getKey(res.data["earlyStartColumn"]);
			mainStartColumn = getKey(res.data["mainStartColumn"]);
			pmColumn = getKey(res.data["pmColumn"]);
			baysColumn = getKey(res.data["baysColumn"]);
			productsColumn = getKey(res.data["productsColumn"]);
		});

		monday.listen("context", (res) => {
			console.log(res);

			boardId = res.data.app.id;

			// update file parser config
			fileParser = new FileParser(boardId);
		});
	})

	async function preDrop() {
		// called when file(s) are dropped, but before parsing

		// fetch item ids
		term.addTerminalItem(new AsyncTerminalMessage("Fetching IDs...", fileParser.initJobs()))
	}

	async function onDrop(fileToParse: File) {
		fileParser
			.parseFile(fileToParse)
			.then((res) => resolveParseResults(fileToParse.name, res));
	}

	async function resolveParseResults(name: string, parsedFileVals: [{ job: string, vals: Job }]) {
		// container for updates
		let container = new AsyncTerminalMessageGroup(`Updating item(s) [${name}]`);
		term.items.push(container);
		
		// process updates
		for (const update of parsedFileVals) {
			const { job, vals } = update;

			container.addMessage(
				new AsyncTerminalMessage(job, MondayService.updateJob(boardId, vals))
			);
		}

		// complete updates
		await container.finalize();
	}
</script>

<div class="App">
	<FileDropBox
		preDrop={preDrop}
		fileDropCallback={onDrop}
	/>
	<Terminal bind:this={term} />
</div>
;

<style lang="scss">
	:global(body) {
		margin: 0;
		font-family: 'Roboto', sans-serif;
		color: #323338;
	}

	:global(code) {
		font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New', monospace;
	}

	.App {
		height: 100vh;
		width: 100vw;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
	}
</style>
