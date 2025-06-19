<script>
  import { page } from '$app/state';
  import { Button } from '$lib/components/ui/button';
  import { onMount } from 'svelte';
  import { 
    lobbies,
    getLobbies,
    problems,
    getProblems,
    updateLobby
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

  async function returnToLobbies() {
    await updateLobby(lobbyID, {status: 'Waiting',});
    window.location.href = '/lobbies'
  }
  
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
  <div class="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
    <p>This lobby has no problems assigned.</p>
    <Button onclick={() => {returnToLobbies()}} class="mt-4">Return to Lobbies</Button>
  </div>
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