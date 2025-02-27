<script lang='ts'>
    import * as Table from '$lib/components/ui/table';
    import { Label } from '$lib/components/ui/label';

    var totalScore = 0;
</script>

<h1 class="text-2xl">Problem List</h1>
<Table.Root>
    <Table.Header>
        <Table.Row>
            <Table.Head>Name</Table.Head>
            <Table.Head>Difficulty</Table.Head>
            <Table.Head>Completed</Table.Head>
        </Table.Row>
    </Table.Header>
    <Table.Body>
        {#each Array(3) as problem}
            <Table.Row on:click={() => window.location.href = `/problems`}>
                <Table.Cell>Title</Table.Cell>
                <Table.Cell>Easy</Table.Cell>
                <Table.Cell>
                    Passed / Total
                </Table.Cell>
            </Table.Row>
        {/each}
    </Table.Body>
</Table.Root>

<Label>
    Total Score: {totalScore}
</Label>