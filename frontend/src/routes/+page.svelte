<script lang='ts'>
    import type { PageData } from './$types';
    import * as Table from '$lib/components/ui/table';
    import { Label } from '$lib/components/ui/label';

    export let data: PageData;
    const problems = data.problems || [];

</script>

<h1>Problems</h1>
<Table.Root>
    <Table.Header>
        <Table.Row>
            <Table.Head>Name</Table.Head>
            <Table.Head>Difficulty</Table.Head>
            <Table.Head>Completed</Table.Head>
        </Table.Row>
    </Table.Header>
    <Table.Body>
        {#each problems as problem}
            <Table.Row on:click={() => window.location.href = `/problems/${problem.id}`}>
                <Table.Cell>{problem.title}</Table.Cell>
                <Table.Cell>{problem.difficulty}</Table.Cell>
                <Table.Cell>
                    {#if problem.completed}
                        Yes
                    {:else}
                        No
                    {/if}
                </Table.Cell>
            </Table.Row>
        {/each}
    </Table.Body>
</Table.Root>