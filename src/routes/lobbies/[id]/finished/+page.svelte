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
    } from '$lib/firebase';    
    import * as Table from '$lib/components/ui/table';
    
    let lobbyId = $derived(page.params.id);    
    let currPlayer = $derived<Player | null>($currentPlayer);
    let selectedLobby = $derived($lobbies?.find(lobby => lobby.id === lobbyId) || null);
    
    let playerScores = $state<{uid: string, score: number}[]>([]);
    let dataLoaded = $state(false);

    async function exitLobby(lobbyId){
        if (!currPlayer) {
            alert("Please log in to exit the lobby.");
            return;
        }
        if(currPlayer.uid == selectedLobby?.host.uid){
            const exitConfirmed = confirm("You are the host. Are you sure you want to exit the lobby? This will reset the lobby status.");
            if (exitConfirmed) {
                await updateLobby(lobbyId, {status: 'Waiting',});
                window.location.href = `/lobbies/`;
            }
            return;
        }
        else{
            await leaveLobby(lobbyId, currPlayer);
            window.location.href = `/lobbies/`;
        }
        
    }

    function calculateScore(playerId) {
        const playerData = selectedLobby?.playerData?.[playerId].problemsSolved;
        // Check the difficulty of each problemID:difficulty map and calculate the score. 
        if (!playerData) return 0;
        return Object.entries(playerData).reduce((score, [problemID, difficulty]) => {
            switch (difficulty) {
                case 'Easy':
                    return score + 1000;
                case 'Medium':
                    return score + 1500;
                case 'Hard':
                    return score + 2000;
                default:
                    return score;
            }
        }, 0);

    }

    function sortScores() {
        //Run calculateScore for each player in the lobby and store the results in playerScores
        playerScores = Object.entries(selectedLobby?.playerData || {}).map(([uid, data]) => ({
            uid,
            score: calculateScore(uid)
        }));
        playerScores.sort((a, b) => b.score - a.score);
    }
    
    function findUsername(uid) {
        const player = selectedLobby?.players.find(player => player.uid === uid);
        return player ? player.username : 'Unknown Player';
    }

    $effect(() => {
        // FIXME: Find a way to live update the scores without needing to refresh the page
        if (selectedLobby && dataLoaded == false) {
            sortScores();
            dataLoaded = true;
        }
    });
    
    onMount(() => {
        const unsubscribeLobbies = getLobbies();

        return () => {
        unsubscribeLobbies();
        }
    });
    
    
</script>

{#if !selectedLobby}
  <div class="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
    <p>Loading Data...</p>
  </div>
{:else}
  <div class="fixed w-full h-full">
    <h1 class="text-center text-2xl font-bold my-4">Leaderboard</h1>
    <div class="w-1/3 mx-auto mb-4 px-4">
        <Table.Root>
            <Table.Header>
                <Table.Row>
                    <Table.Head class="text-left">Player</Table.Head>
                    <Table.Head class="text-right">Score</Table.Head>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {#each playerScores as player}
                <Table.Row>
                    <Table.Cell class="text-left">{findUsername(player.uid)}</Table.Cell>
                    <Table.Cell class="text-right">{player.score}</Table.Cell>
                </Table.Row>
                {/each}
            </Table.Body>
        </Table.Root>
    </div>
    <div class="fixed flex justify-end items-end p-4 bottom-0 right-0">
      <Button onclick={() => exitLobby(lobbyId)}>Exit Lobby</Button>
    </div>
  </div>
{/if}



