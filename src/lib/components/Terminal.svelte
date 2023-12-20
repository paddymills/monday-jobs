<div class="terminal"></div>

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

	.terminal,
	.terminal.sublist {
		overflow: auto;

		/* hide scrollbar*/
		-ms-overflow-style: none; /* IE and Edge */
		scrollbar-width: none; /* Firefox */
	}

	/* hide scrollbar for Chrome (and Safari and Opera)*/
	.terminal::-webkit-scrollbar,
	.terminal.sublist::-webkit-scrollbar {
		display: none;
	}

	p {
		margin: 0;
	}

	.check {
		color: #00ca72;
	}

	.spin {
		color: #0085ff;
	}
</style>
