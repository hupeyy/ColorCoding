<script lang="ts">
  import { page } from '$app/state';
  import { Button } from '$lib/components/ui/button';
  import { onMount } from 'svelte';
  import { 
    lobbies,
    getLobbies,
    problems,
    getProblems,
    updateLobby,
    currentPlayer,
    leaveLobby
  } 
  from '$lib/firebase';
  import * as Table from '$lib/components/ui/table';

  const problemHeaders = ['Title', 'Difficulty'];
  let lobbyId = $derived(page.params.id);
  let currPlayer = $derived<Player | null>($currentPlayer);
  
  // Reactive declarations with runes
  let selectedLobby = $derived($lobbies?.find(lobby => lobby.id === lobbyId) || null);
  let lobbyProblems = $derived(
    $problems && selectedLobby 
      ? $problems.filter(problem => selectedLobby.problemIDs.includes(problem.id))
      : []
  );

  async function returnToLobbies() {
    await updateLobby(lobbyId, {status: 'Waiting',});
    window.location.href = '/lobbies'
  }
  async function exitLobby(lobbyId){
    if (!currPlayer) {
      alert("Please log in to exit the lobby.");
      return;
    }
    if(currPlayer.uid == selectedLobby?.host.uid){
      await updateLobby(lobbyId, {status: 'Waiting',});
    }
    else{
      await leaveLobby(lobbyId, currPlayer);
    }
    window.location.href = `/lobbies/`;
  }

  $effect(() => {
    if(selectedLobby?.status === "Waiting" && currPlayer?.uid != selectedLobby?.host.uid) {
      // If the lobby is waiting and the current player is not the host, redirect to lobbies page
      alert("The host has left the lobby. You are being redirected to the lobbies page.");
      window.location.href = '/lobbies';
    }
  });
  
  onMount(() => {
    const unsubscribeLobbies = getLobbies();
    const unsubscribeProblems =  getProblems();

    return () => {
      unsubscribeLobbies();
      unsubscribeProblems();
    }
  });
</script>


{#if !selectedLobby}
  <div class="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
    <p>Loading lobby...</p>
  </div>
{:else if selectedLobby.problemIDs.length === 0}
  <div class="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
    <p>This lobby has no problems.</p>
    <Button onclick={() => {returnToLobbies()}} class="mt-4">Return to Lobbies</Button>
  </div>
{:else}
  <div class="fixed w-full h-full">
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
                  window.location.href = `/lobbies/${lobbyId}/${problem.id}`;
                }}
              >
                {problem[header.toLowerCase()]}
              </Table.Cell>
            {/each}
          </Table.Row>
        {/each}
      </Table.Body>
    </Table.Root>
    <div class="fixed flex justify-end items-end p-4 bottom-0 right-0">
      <Button onclick={() => exitLobby(lobbyId)}>Exit Lobby</Button>
    </div>
  </div>
{/if}