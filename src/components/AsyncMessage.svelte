<script lang="ts">

export let text: string;
export let promise: Promise<any>;

function handleError(error: string): string {
    console.log(error);
    return error;
}
</script>

{#await promise}
<li class="pending">
    <span class="fa-li">
        <i class="fa-solid fa-circle-notch fa-spinner fa-pulse"></i>
    </span>
    {text}
</li>
{:then value}
<li class="complete">
    <span class="fa-li"><i class="fa-solid fa-circle-check"></i></span>
    {text}
</li>   
{:catch error}
<li class="error">
    <span class="fa-li"><i class="fa-solid fa-exclamation-triangle"></i></span>
    {text} ({handleError(error)})
</li>    
{/await}

<style lang="scss">
    @import "monday-ui-style/dist/index.min.css";

    li {
        color: var(--fixed-light-color);
    }

    .pending {
        color: var(--primary-color);
    }

    .complete {
        color: var(--color-done-green);
    }

    .error {
        color: var(--negative-color);
    }
</style>