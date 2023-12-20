<script lang="ts">
	import { FileParser } from '$lib/FileParser.ts';

	enum DropState {
		None = '',
		Dropping = 'DropZoneHover',
		Dropped = 'DropZoneComplete'
	}

	let state = DropState.None;
	let fileParser = new FileParser();

	export let preDrop = () => {};
	export let dropCallback = (res: string) => {};
	export let fileParserCallback = (res: string) => {};

	function handleDrag(event: Event) {
		event.preventDefault();

		switch (event.type) {
			case 'dragover':
				state = DropState.Dropping;
				break;
			case 'dragexit':
				state = DropState.None;
				break;

			default:
				break;
		}
	}

	async function handleDrop(event: DragEvent) {
		event.preventDefault();

		state = DropState.None;
		
		if ( event.dataTransfer !== null ) {
			preDrop();

			for (const file of event.dataTransfer.files) {
				// handle drop event
				fileParser.parseFile(file).then((res) => fileParserCallback(res));
			}

			dropCallback("File parsed");
		}
	}
</script>

<!-- is form the right aria role? -->
<span
	class={'dropZone ' + state}
	role="form"	
	aria-label="file upload dropzone"
	on:drop={handleDrop}
	on:drag={handleDrag}
>
	<p>Drop file(s) here...</p>
</span>

<style lang="scss">
	.dropZone {
		border: dashed #c5c7d0 5px;
		border-radius: 16px;
		padding: 3em 15em;
	}

	.dropZoneHover {
		border-color: #0085ff;
	}

	.dropZoneComplete {
		border-color: #00ca72;
	}
</style>
