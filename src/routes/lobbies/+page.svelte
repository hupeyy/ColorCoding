<script lang="ts">
  import { onMount } from 'svelte';
  import { 
    lobbies,
    createGuest, 
    createLobby,
    guestUser,
    joinLobby, 
    getGuestLobbies,
    problems
  } from '$lib/firebase';
  import * as Table from '$lib/components/ui/table';
  import { Button } from '$lib/components/ui/button';
  import { on } from 'svelte/events';

  let displayName = '';
  let lobbyName = '';
  let maxPlayers = 100;
  let DSA = false;
  let currName = 'guest';

  function handleGuestCreation() {
    if(!displayName) return; // Must Enter a name
    createGuest(displayName);
    currName = displayName;
  }
    
  async function handleLobbyCreation() {
    if(!$guestUser) return; // Must press Set Name button before trying to create lobby

    let problemIDs = [];

    // get 5 random easy problems from the database
    const easyProblems = $problems.filter(problem => problem.difficulty === 'easy');
    const shuffledEasyProblems = easyProblems.sort(() => Math.random() - 0.5);
    const selectedEasyProblems = shuffledEasyProblems.slice(0, 5);

    // get 3 random medium problems from the database 
    const medProblems = $problems.filter(problem => problem.difficulty === 'medium');
    const shuffledMedProblems = medProblems.sort(() => Math.random() - 0.5);
    const selectedMedProblems = shuffledMedProblems.slice(0, 3);

    // get 1 random hard problem from the database
    const hardProblems = $problems.filter(problem => problem.difficulty === 'hard');
    const shuffledHardProblems = hardProblems.sort(() => Math.random() - 0.5);
    const selectedHardProblems = shuffledHardProblems.slice(0, 1);

    for (let i = 0; i < selectedEasyProblems.length; i++) {
      problemIDs.push(selectedEasyProblems[i].id);
    }

    for (let i = 0; i < selectedMedProblems.length; i++) {
      problemIDs.push(selectedMedProblems[i].id);
    }

    for (let i = 0; i < selectedHardProblems.length; i++) {
      problemIDs.push(selectedHardProblems[i].id);
    }

    await createLobby($guestUser, lobbyName, maxPlayers, DSA, problemIDs);
  }

  async function handleLobbyJoin(lobbyId: string) {
    if(!$guestUser) return; // Must press Set name button before trying to create lobby
    await joinLobby(lobbyId, $guestUser);
    window.location.href = `/lobbies/${lobbyId}`
  }

  onMount(() => {
    const unsubscribe = getGuestLobbies();//change to getLobbies() later on
    return unsubscribe;
  });

  const headers = ['Lobby Name', 'Status', 'Host', '# of Players', 'DSA?']
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

    <Table.Caption>Lobbies List</Table.Caption>

    <Table.Header class="text-2xl">
      <Table.Row>
        {#each headers as header}
          <Table.Head>{header}</Table.Head>
        {/each}
      </Table.Row>
    </Table.Header>

    <Table.Body>
      {#each $lobbies as lobby}
        <Table.Row>
          <Table.Cell>{lobby.name}</Table.Cell>
          <Table.Cell>{lobby.status}</Table.Cell>
          <Table.Cell>{lobby.host.displayName}</Table.Cell>
          <Table.Cell> {lobby.players.length} / {lobby.maxPlayers}</Table.Cell>
          <Table.Cell>{lobby.DSA}</Table.Cell>

          <Table.Cell>
            <Button on:click={() => handleLobbyJoin(lobby.id)}>Join</Button>
          </Table.Cell>

          <!-- <Table.Cell 
          on:click={() => {window.location.href = `/lobbies/${lobby.id}`;}}>
          </Table.Cell> -->
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
  <Button on:click={handleLobbyCreation} class="px-4">Create Lobby</Button>

  </div>
  <h2 class="flex items-center justify-center p-6">Hi, {currName}!</h2>
{/if}
