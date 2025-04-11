<script lang="ts">
  import { 
    createGuest, 
    guestUser,
    joinLobby, 
    getGuestLobbies,
    guestLobbies,
  } from '$lib/firebase';
  import { Button } from '$lib/components/ui/button';
  import { onMount } from 'svelte';
  import * as Table from "$lib/components/ui/table/index.js";

  let displayName = $state("");
  let lobbyName = $state("");
  let maxPlayers = $state(100);
  let DSA = $state(false);
  let currName = $state('guest');

  let lobbies = $derived<Lobby[] | null>($guestLobbies);

  function handleGuestCreation() {
    if(!displayName) return; // Must Enter a name
    createGuest(displayName);
    currName = displayName;
  }
    
  async function handleLobbyJoin(lobbyId: string) {
    if(!$guestUser) return; // Must press Set name button before trying to create lobby
    await joinLobby(lobbyId, $guestUser);
    window.location.href = `/lobbies/${lobbyId}`
  }

  onMount(() => {
    const unsubscribe = getGuestLobbies(); //change to getLobbies() later on
    return unsubscribe;
  });

  const headers = ['Lobby Name', 'Status', 'Host', '# of Players', 'DSA?']
</script>

{#if lobbies === null}
  <p>Loading...</p>
{:else if lobbies.length === 0}
  <p>No lobbies found.</p>
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
      {#each lobbies as lobby}
        <Table.Row>
          <Table.Cell>{lobby.name}</Table.Cell>
          <Table.Cell>{lobby.status}</Table.Cell>
          <Table.Cell>{lobby.host.displayName}</Table.Cell>
          <Table.Cell> {lobby.players.length} / {lobby.maxPlayers}</Table.Cell>
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

  <input type="text" bind:value={displayName} placeholder="Enter Display Name" class="px-2" />
  <Button on:click={handleGuestCreation} class="px-4">Set Name</Button>

  <input type="text" bind:value={lobbyName} placeholder="Enter Lobby Name" class="px-2"/>
  <p class="pl-2">Max Players: </p>
  <input type="number" bind:value={maxPlayers} min="1" max="100" class="pr-2"/>
  <label class="px-4">
    <input type="checkbox" bind:checked={DSA} />
    DSA Enabled
  </label>
  <Button onclick={handleGuestCreation} class="px-4">Create Lobby</Button>

  </div>
  <h2 class="flex items-center justify-center p-6">Hi, {currName}!</h2>
{/if}
