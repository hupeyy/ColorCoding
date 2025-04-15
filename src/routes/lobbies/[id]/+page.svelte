<script>
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { 
    lobbies,
    getLobbies,
    problems,
    getProblems,
    getGuestLobbies
  } from '$lib/firebase';
  import * as Table from '$lib/components/ui/table';


  onMount(() => {
    const unsubscribeLobbies = getGuestLobbies();
    const unsubscribeProblems = getProblems();

    return () => {
      unsubscribeLobbies();
      unsubscribeProblems();
    }
  });

  let lobbyProblems = [];
  const problemHeaders = ['Title', 'Difficulty'];

  $: lobbyID = $page.params.id;
 // 
  $: {
    if ($lobbies && $problems) {
      const lobby = $lobbies.find(lobby => lobby.id === lobbyID);
      if (lobby) {
        lobbyProblems = lobby.problemIDs.map(problemID => {
          return $problems.find(problem => problem.id === problemID);
        }).filter(problem => problem !== undefined);
      }
    }
  }
</script>

{#if $lobbies === null}
  <p>Loading...</p>
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
              on:click={() => {
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