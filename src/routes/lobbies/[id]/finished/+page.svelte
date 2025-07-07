<script lang="ts">
    import { page } from '$app/state';    
    import { Button } from '$lib/components/ui/button';    
    import { onMount } from 'svelte';    
    import { 
        lobbies,
        getLobbies,
        updateLobby,
        currentPlayer,
        leaveLobby
    } from '$lib/firebase';    
    import * as Table from '$lib/components/ui/table';
    
    let lobbyId = $derived(page.params.id);    
    let currPlayer = $derived<Player | null>($currentPlayer);
    let selectedLobby = $derived($lobbies?.find(lobby => lobby.id === lobbyId) || null);
    
    let playerScores = $state<{uid: string, score: number, avgRunTime: number}[]>([]);
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
        if (!playerData) return { score: 0, avgRunTime: 0 };

        let result = Object.entries(playerData).reduce((acc, [problemID, { difficulty, runTime }]) => {
            switch (difficulty) {
                case 'Easy':
                    acc.score += 1000;
                    break;
                case 'Medium':
                    acc.score += 1500;
                    break;
                case 'Hard':
                    acc.score += 2000;
                    break;
            }
            acc.totalRunTime += runTime || 0;
            acc.count += 1;
            return acc;
        },{score: 0, totalRunTime: 0, count: 0});

        const avgRunTime = result.count > 0 ? Number((result.totalRunTime / result.count).toFixed(2)) : 0;
        const finalScore = result.score - (avgRunTime*100); //NOTE: May need to adjust the multiplier based on how difficult future problems are
        return { score: Number(finalScore.toFixed(2)), avgRunTime };
    }

    function sortScores() {
        //Run calculateScore for each player in the lobby and store the results in playerScores
        playerScores = Object.entries(selectedLobby?.playerData || {}).map(([uid, data]) => ({
            uid,
            score: calculateScore(uid).score,
            avgRunTime: calculateScore(uid).avgRunTime
        }));
        playerScores.sort((a, b) => b.score - a.score);
        // FIXME: Exiting and then re-entering the lobby will break the runtimes as entering a problem automatically sets the runtime to -1
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
    <h1 class="text-center text-2xl font-bold my-8">Leaderboard</h1>
    <div class="w-1/3 mx-auto mb-4 px-4">
        <Table.Root>
            <Table.Header>
                <Table.Row>
                    <Table.Head class="text-left">Player</Table.Head>
                    <Table.Head class="text-center">Average Runtime</Table.Head>
                    <Table.Head class="text-right">Score</Table.Head>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {#each playerScores as player}
                <Table.Row>
                    <Table.Cell class="text-left">{findUsername(player.uid)}</Table.Cell>
                    <Table.Cell class="text-center">{player.avgRunTime} ms</Table.Cell>
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



