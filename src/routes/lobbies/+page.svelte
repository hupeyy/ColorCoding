<script lang="ts">
  import { 
    currentPlayer,
    getCurrentPlayer,
    lobbies,
    getLobbies,
    joinLobby, 
    leaveLobby,
    createLobby,
    deleteLobby,
    updateLobby
  }

  from '$lib/firebase';
  import { doc, serverTimestamp } from 'firebase/firestore';
  import { Button } from '$lib/components/ui/button';
  import { onMount } from 'svelte';
  import * as Table from "$lib/components/ui/table/index.js";

  let lobbyName = $state("");
  let maxPlayers = $state(100);
  let DSA = $state(false);
  
  // Svelte store objects
  let currPlayer = $derived<Player | null>($currentPlayer);
  let currLobbies = $derived<Lobby[] | null>($lobbies);

  async function handleLobbyJoin(lobbyId: string) {
    if (!currPlayer) {
      alert("Please log in to join a lobby.");
      return;
    }
    await joinLobby(lobbyId, currPlayer);
  }

  async function handleLobbyLeave(lobbyId: string) {
    if (!currPlayer) {
      alert("Please log in to leave a lobby.");
      return;
    }
    await leaveLobby(lobbyId, currPlayer);
  }

  async function handleCreateLobby() {
    if (!currPlayer) {
      alert("Please log in to create a lobby.");
      return;
    }
    if (!lobbyName.trim()) {
      alert("Please enter a valid lobby name.");
      return;
    }
    if (maxPlayers < 1 || maxPlayers > 100) {
      alert("Max players must be between 1 and 100.");
      return;
    }
    const lobby: Omit<Lobby, 'id'> = {
      name: lobbyName,
      maxPlayers: maxPlayers,
      DSA: DSA,
      host: currPlayer,
      players: [currPlayer],
      status: 'Waiting',
      createdAt: serverTimestamp(),
      problemIDs: [],
      startTime: Date.now(),
      playerData: {[currPlayer.uid]: {problemsSolved: {}, solveTime: 0}},
    };

    await createLobby(lobby);
    // NOTE: How are problems added to the lobby?
  }
  
  async function handleLobbyDelete(lobbyId: string) {
    if (!currPlayer) {
      alert("Please log in to delete a lobby.");
      return;
    }
    const lobby = currLobbies?.find(l => l.id === lobbyId);
    if (lobby && lobby.host.uid === currPlayer.uid){
      // Confirm the host wants to delete the lobby
      const confirmDelete = confirm("Are you sure you want to delete this lobby?");
      if (!confirmDelete) {
        return;
      }
      await deleteLobby(lobbyId);
    } else {
      alert("You are not the host of this lobby.");
    }
  }

  async function handleLobbyStart(lobbyId: string) {
    await updateLobby(lobbyId, {status: 'In Progress',});
    window.location.href = `/lobbies/${lobbyId}`;
  }
  

  onMount(() => {
    const unsubscribeLobbies= getLobbies();
    const unsubscribeCurrentPlayer = getCurrentPlayer(); 
    return () => {
      unsubscribeLobbies();
      unsubscribeCurrentPlayer(); 
    } 
  });

  const headers = ['Lobby Name', 'Host', 'Players', 'Status', 'DSA?', 'Join'];

$effect(() => {
  if(currLobbies && currPlayer && currLobbies.some(lobby => lobby.players.some(p => p.uid === currPlayer.uid) && lobby.status === 'In Progress')){
    // Find the lobby the player is in
    const lobby = currLobbies.find(
      lobby => lobby.players.some(p => p.uid === currPlayer.uid) && lobby.status === 'In Progress'
    );
    if (lobby) {
      window.location.href = `/lobbies/${lobby.id}`;
    }
  }
});

</script>


{#if currLobbies === null}
  <div class="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
    <p>Loading...</p>
  </div>
{:else if !currPlayer}
  <div class="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
    <p>Please log in</p>
  </div>
{:else if currLobbies.length === 0}
  <p>No Lobbies Created</p>
  <!-- sample guest lobby creation -->
  <div class="flex items-center justify-center p-6">
    <input type="text" bind:value={lobbyName} placeholder="Enter Lobby Name" class="px-2"/>
    <p class="pl-2">Max Players: </p>
    <input type="number" bind:value={maxPlayers} min="1" max="100" class="pr-2"/>
    <label class="px-4">
      <input type="checkbox" bind:checked={DSA} />
      DSA Enabled
    </label>
    <Button onclick={handleCreateLobby} class="px-4">Create Lobby</Button>
  </div>
  <h2 class="flex items-center justify-center p-6">Hi, {currPlayer.username}!</h2>
{:else}
  <Table.Root>
    <Table.Caption>Lobbies List</Table.Caption>
    <Table.Header class="text-2xl">
      <Table.Row>
        {#each headers as header}
          <Table.Head>{header}</Table.Head>
        {/each}
      </Table.Row>
    </Table.Header>

    <Table.Body>
      {#each currLobbies as lobby}
        <Table.Row>
          <Table.Cell>{lobby.name}</Table.Cell>
          <Table.Cell>{lobby.host.username}</Table.Cell>
          <Table.Cell>{lobby.players.length} / {lobby.maxPlayers}</Table.Cell>
          <Table.Cell>{lobby.status}</Table.Cell>
          <Table.Cell>{lobby.DSA.toString().charAt(0).toUpperCase() + lobby.DSA.toString().slice(1)}</Table.Cell>
          <Table.Cell class="w-10">
            {#if lobby.host.uid === currPlayer.uid && lobby.status === 'Waiting'}
              <Button onclick={() => handleLobbyStart(lobby.id)}>Start</Button>
            {:else if lobby.players.some(player => player.uid === currPlayer.uid) && lobby.status === 'Waiting'}
              <Button onclick={() => handleLobbyLeave(lobby.id)}>Leave</Button>
            {:else if lobby.status === 'Waiting' && lobby.players.length < lobby.maxPlayers}
              <Button onclick={() => handleLobbyJoin(lobby.id)}>Join</Button>
            {:else}
              <Button disabled>Join</Button>
            {/if}
          </Table.Cell>
          <Table.Cell class="w-10">
            {#if lobby.host.uid === currPlayer.uid}
              <Button onclick={() => handleLobbyDelete(lobby.id)} class="w-10 cursor-pointer">🗑️</Button>
            {:else}
              <Button disabled class="w-10">🗑️</Button>
            {/if}
          </Table.Cell>
          <!-- NOTE: Consider adding an edit lobby button to change the questions in the set -->
        </Table.Row>
      {/each}
    </Table.Body>
  </Table.Root>

  <!-- sample guest lobby creation -->
  <div class="flex items-center justify-center p-6">
    <input type="text" bind:value={lobbyName} placeholder="Enter Lobby Name" class="px-2"/>
    <p class="pl-2 p-1">Max Players: </p>
    <input type="number" bind:value={maxPlayers} min="1" max="100" class="pr-2"/>
    <label class="px-4">
      <input type="checkbox" bind:checked={DSA} /> 
      DSA Enabled
    </label>
    <Button onclick={handleCreateLobby} class="px-4">Create Lobby</Button>
  </div>
  <h2 class="flex items-center justify-center p-6">Hi, {currPlayer.username}!</h2>
{/if}

