<script>
  import { page } from '$app/state';
  import { onMount } from 'svelte';
  import { 
    lobbies,
    getLobbies,
    problems,
    getProblems,
  } from '$lib/firebase';
  import * as Table from '$lib/components/ui/table';

  const problemHeaders = ['Title', 'Difficulty'];
  let lobbyID = $derived(page.params.id);
  
  // Reactive declarations with runes
  let selectedLobby = $derived($lobbies?.find(lobby => lobby.id === lobbyID) || null);
  let lobbyProblems = $derived(
    $problems && selectedLobby 
      ? $problems.filter(problem => selectedLobby.problemIDs.includes(problem.id))
      : []
  );
  
  onMount(async () => {
    const unsubscribeLobbies = getLobbies();
    const unsubscribeProblems = getProblems();

    return () => {
      unsubscribeLobbies();
      unsubscribeProblems();
    }
  });
</script>


{#if !selectedLobby}
  <p>Loading lobby...</p>
{:else if selectedLobby.problemIDs.length === 0}
  <p>No problems available in this lobby.</p>
{:else}
  <Table.Root>
    <Table.Caption>Problem List</Table.Caption>
    <Table.Header>
      <Table.Row>
        {#each problemHeaders as header}
          <Table.Head>{header}</Table.Head>
        {/each}
      </Table.Row>
    </Table.Header>
    <Table.Body>
      {#each lobbyProblems as problem}
        <Table.Row>
          {#each problemHeaders as header}
            <Table.Cell
              onclick={() => {
                window.location.href = `/lobbies/${lobbyID}/${problem.id}`;
              }}
            >
              {problem[header.toLowerCase()]}
            </Table.Cell>
          {/each}
        </Table.Row>
      {/each}
    </Table.Body>
  </Table.Root>
{/if}