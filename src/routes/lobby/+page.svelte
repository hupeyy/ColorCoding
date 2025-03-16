<script lang="ts">
    import { onMount } from 'svelte';
    import { lobbies, getLobbies } from '$lib/firebase';
    import * as Table from '$lib/components/ui/table';

    onMount(() => {
        const unsubscribe = getLobbies();
        return unsubscribe;
    });

    const headers = ['DSA', 'createdAt', 'userIDs']
    $: {
        console.log($lobbies);
    }
</script>

{#if $lobbies === null}
    <p>Loading...</p>
{:else if $lobbies.length === 0}
    <p>No lobbies found.</p>
{:else}
    <Table.Root>
        <Table.Caption>A list of your recent invoices.</Table.Caption>
        <Table.Header>
            <Table.Row>
                {#each headers as header}
                    <Table.Head>{header}</Table.Head>
                {/each}
            </Table.Row>
        </Table.Header>
        <Table.Body>
            <Table.Row>
                {#each $lobbies as lobby}
                    {#each headers as header}
                        <Table.Cell>{lobby[header]}</Table.Cell>
                    {/each}
                {/each}
            </Table.Row>
        </Table.Body>
    </Table.Root>
{/if}
