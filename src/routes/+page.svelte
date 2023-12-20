<script lang="ts">
	import FileDropBox from '$lib/components/FileDropper.svelte';
	import Terminal from '$lib/components/Terminal.svelte';

	let count = 0;

	function addOne() {
		count++;
	}
</script>

<div class="App">
	<FileDropBox
		preDrop={() => console.log('predrop')}
		dropCallback={(res) => console.log('droped: ' + res)}
		fileParserCallback={() => console.log('fileparser')}
	/>
	<Terminal />
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
