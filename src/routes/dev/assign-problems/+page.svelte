<script lang="ts">
  import { guestLobbies, getGuestLobbies, getProblems, problems } from '$lib/firebase';
  import { onMount } from 'svelte';
  import type { ColumnDef } from '@tanstack/table-core';
  import DataTable from '$lib/components/DataTable.svelte';

  let lobbies = $derived($guestLobbies);

  let lobbyHeaders: ColumnDef<Lobby>[] = [
    { accessorKey: 'name', header: 'Lobby Name' },
    { accessorKey: 'host', header: 'Host' },
    { accessorKey: 'problemsIDs', header: 'Problems' },
    { accessorKey: 'players', header: 'Players' },
    { accessorKey: 'status', header: 'Status' },
    { accessorKey: 'createdAt', header: 'Created At' },
    { accessorKey: 'maxPlayers', header: '# of Players' },
    { accessorKey: 'DSA', header: 'DSA?' }
  ];

  onMount(() => {
    const unsubscribe = getGuestLobbies(); 
    return unsubscribe;
  });
</script>

{#if lobbies === null}
  <p>Loading...</p>
{:else if lobbies.length === 0}
  <p>No lobbies found.</p>
{:else}
  <DataTable data={lobbies} columns={lobbyHeaders} />
{/if}