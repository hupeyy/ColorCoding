<script lang="ts">
    import { onMount } from 'svelte';
    import { lobbies, getLobbies, createGuest, createLobby, guestUser, joinLobby, getGuestLobbies } from '$lib/firebase';
    import * as Table from '$lib/components/ui/table';

    let displayName = '';
    let lobbyName = '';
    let maxPlayers = 100;
    let DSA = false;
    let currName = '';

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

        <Table.Header>
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
                        <button on:click={() => handleLobbyJoin(lobby.id)}>Join</button>
                    </Table.Cell>
                </Table.Row>
            {/each}
        </Table.Body>

    </Table.Root>

    <!-- sample guest lobby creation -->
     <input type="text" bind:value={displayName} placeholder="Enter Display Name" />
     <button on:click={handleGuestCreation}>Set Name</button>

     <input type="text" bind:value={lobbyName} placeholder="Enter Lobby Name" />
     <input type="number" bind:value={maxPlayers} min="1" max="100" />
     <label>
        <input type="checkbox" bind:checked={DSA} />
        DSA Enabled
     </label>
     <button on:click={handleLobbyCreation}>Create Lobby</button>

     <h2>Hi, {currName}!</h2>
{/if}
