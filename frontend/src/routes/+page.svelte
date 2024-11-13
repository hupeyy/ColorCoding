<script lang='ts'>
    import type { PageData } from './$types';

    export let data: PageData;
    const { problems } = data;
</script>

<h1>Problems</h1>

{#each problems as problem}
    <a href="/problems/{problem.id}">
        <div>
            <h2>{problem.title}</h2>
            <p>{problem.difficulty}</p>
        </div>
    </a>
{/each}