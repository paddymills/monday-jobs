<script lang="ts">
	import FileDropBox from '@/components/FileDropper.svelte';
	import Terminal from '@/components/Terminal.svelte';
	import { newTerminalGroup, newTerminalMessage } from '@/components/Terminal.svelte';

	import { type ApiService } from '@/services/Base';	
	import { OfflineService } from './services/OfflineService';
	import { MondayService, monday } from './services/MondayService';

	import { FileParser } from '@/lib/FileParser';
	import { Job } from '@/lib/job';
  	import { onMount } from 'svelte';

	let service: ApiService;
	let term: Terminal;

	let version = APP_VERSION;

	onMount(() => {
		console.log("Package")

		if ( window.location.host.startsWith("localhost") ) {
			console.log("Running local. Using OfflineService for api.");

			service = new OfflineService();
		} else {
			console.log("Running within Monday Apps. Using MondayService for api.");
			
			service = new MondayService();
		}
	});


	async function onFileDrop(fileToParse: File) {
		console.log("Starting file upload");
		term.clear();

		// fetch item ids
		const fetchIds: Promise<void> = service.initJobs();
		term.addMessage( "Fetching IDs...", fetchIds );
		await fetchIds;

		await FileParser
			.parseFile(fileToParse)
			.then((parsedFileVals) => {
				const fileName = fileToParse.name;
				
				// container for updates
				let container = newTerminalGroup(`Updating item(s) [${fileName}]`)

				// process updates
				const items = parsedFileVals.map((job: Job) => newTerminalMessage(job.name, service.updateJob(job)));
				container.props.items = items;

				// add group to terminal
				term.addGroup(container);
			})
			.catch((err) => service.error(err));
	}
</script>

<div class="App">
  <FileDropBox {onFileDrop} />
  <Terminal bind:this={term} />
  <p class="footer">build version: {version}</p>
</div>

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

	.footer {
		font-size: small;
	}
</style>
