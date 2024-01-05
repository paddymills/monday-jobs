<script lang="ts">
	import { error } from '@/services/MondayService.ts';

	enum DropState {
		None = 'DropZoneInactive',
		Dropping = 'DropZoneHover',
		Dropped = 'DropZoneComplete'
	}

	let state = DropState.None;

	export let onFileDrop = async (file: File) => {};

	function handleDrag(event: Event) {
		event.preventDefault();
		// console.log(event);

		switch (event.type) {
			case 'dragenter':
			case 'dragover':
				state = DropState.Dropping;
				break;
			case 'dragleave':
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
			if (event.dataTransfer.files.length > 1) {
				error("The parser does not support multiple files.")
			} else {
				// handle drop event
				state = DropState.Dropped;
				await onFileDrop(event.dataTransfer.files[0]);
			}
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
	on:dragover={handleDrag}
	on:dragenter={handleDrag}
	on:dragleave={handleDrag}
>
	<p>Drop file(s) here...</p>
</span>

<style lang="scss">
	.dropZone {
		border: dashed #c5c7d0 5px;
		border-radius: 16px;
		padding: 3em 15em;
	}

	.DropZoneHover {
		border-color: #0085ff;
	}

	.DropZoneComplete {
		border-color: #00ca72;
	}
</style>
