<script lang="ts">
    import { onMount } from 'svelte';
    import { lobbies, getLobbies, createGuest, createLobby, guestUser, joinLobby, getGuestLobbies } from '$lib/firebase';
    import * as Table from '$lib/components/ui/table';
    import { Button } from '$lib/components/ui/button';

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
        await createLobby($guestUser, lobbyName, maxPlayers, DSA);
    }

    async function handleLobbyJoin(lobbyId: string) {
        if(!$guestUser) return; // Must press Set name button before trying to create lobby
        await joinLobby(lobbyId, $guestUser);
    }

    onMount(() => {
        const unsubscribe = getGuestLobbies();
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

        <Table.Caption>Lobbies Available</Table.Caption>

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
