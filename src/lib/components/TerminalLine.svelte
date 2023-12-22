<script lang="ts">
    import { Fa, FaLayers, FaLayersText } from 'svelte-fa';
    import { type TerminalItem } from '$lib/Terminal.ts';

    export let item: TerminalItem;
</script>


{#if item.hasSubItems()}
<p>
    <FaLayers>
        <Fa {...item.iconParams()} />{item.getText()}
        <FaLayersText scale={0.2} translateX={0.4} translateY={-0.4} color="white" style="padding: 0 .2em; background: red; border-radius: 1em">
            {item.subItems().length}
        </FaLayersText>
    </FaLayers>
</p>
<div class="indent">
{#each item.subItems() as subitem}
    <svelte:self item={subitem} />
{/each}
</div>

{:else}
<p><Fa {...item.iconParams()} />{item.getText()}</p>
{/if}

<!-- svelte-ignore css-unused-selector -->
<style lang="scss">
    @import "monday-ui-style/dist/index.min.css";

    p {
		margin: 0;
		// color: #00ca72;
        color: var(--warning-color)
	}

    .pending {
        // color: #0085ff;
        color: var(--primary-color)
    }

    .warn {
        color: var(--warning-color)
    }

    .error {
        // color: #d83a52
        color: var(--negative-color);
    }

    .indent {
        padding-left: 0.25rem;
    }
</style>