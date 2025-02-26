<script lang='ts'>
    import type { PageData } from './$types';
    import * as Table from '$lib/components/ui/table';
    import { Label } from '$lib/components/ui/label';

    export let data: PageData;
    const problems = data.problems || [];

    var totalScore = 0;

    for (let i = 0; i < problems.length; i++) {
        let multiplier = 1;
        if (problems[i].difficulty === 'Medium') {
            multiplier = 2;
        } else if (problems[i].difficulty === 'Hard') {
            multiplier = 5;
        }
        totalScore += problems[i].passed * multiplier * 100;
    }

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
        {#each problems as problem}
            <Table.Row on:click={() => window.location.href = `/problems/${problem.id}`}>
                <Table.Cell>{problem.title}</Table.Cell>
                <Table.Cell>{problem.difficulty}</Table.Cell>
                <Table.Cell>
                    {problem.passed} / {problem.testCases.length} 
                </Table.Cell>
            </Table.Row>
        {/each}
    </Table.Body>
</Table.Root>

<Label>
    Total Score: {totalScore}
</Label>