<script lang="ts">
  import { 
    currentPlayer,
    getCurrentPlayer,
    lobbies,
    getLobbies,
    joinLobby, 
    createLobby
  } from '$lib/firebase';
  import { serverTimestamp } from 'firebase/firestore';
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
    window.location.href = `/lobbies/${lobbyId}`;
  }

  async function handleCreateLobby() {
    if (!currPlayer) {
      alert("Please log in to create a lobby.");
      return;
    }
    const lobby: Omit<Lobby, 'id'> = {
      name: lobbyName,
      maxPlayers: maxPlayers,
      DSA: DSA,
      host: currPlayer,
      players: [currPlayer],
      status: 'waiting',
      createdAt: serverTimestamp(),
      problemIDs: [],
    };

    await createLobby(lobby);
  }

  onMount(() => {
    const unsubscribeLobbies= getLobbies();
    const unsubscribeCurrentPlayer = getCurrentPlayer(); 
    return () => {
      unsubscribeLobbies();
      unsubscribeCurrentPlayer(); 
    } 
  });

  const headers = ['Lobby Name', 'Host', '# of Players', 'Status', 'DSA?', 'Join'];
</script>

{#if currLobbies === null}
  <p>Loading...</p>
{:else if !currPlayer}
  <p>Please log in</p>
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
          <Table.Cell>{lobby.DSA}</Table.Cell>
          <Table.Cell>
            <Button onclick={() => handleLobbyJoin(lobby.id)}>Join</Button>
          </Table.Cell>
        </Table.Row>
      {/each}
    </Table.Body>
  </Table.Root>

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
{/if}

