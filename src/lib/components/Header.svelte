<script lang="ts">
  import Sun from "lucide-svelte/icons/sun";
  import Moon from "lucide-svelte/icons/moon";
  import User from "lucide-svelte/icons/user";
 
  import { toggleMode } from "mode-watcher";
  import { Button } from "$lib/components/ui/button";

  import { currentPlayer, getCurrentPlayer } from "$lib/firebase";
  import { onMount } from "svelte";

  let currPlayer = $derived<Player | null>($currentPlayer); // Current player derived store
  let showPlayerInfo = $state(false);

  async function handleSignOut() {
    // Sign out logic here
    showPlayerInfo = false; // Hide player info after signing out
    window.location.href = `/`;
  }

  onMount(() => {
    const unsubscribe = getCurrentPlayer(); // Subscribe to current player changes

    return () => unsubscribe();
  });

</script>
<div class="relative">
  <div class="flex flex-row justify-end px-4 py-3 gap-4">
    <div class="text-2xl font-semibold mr-auto items-center flex">
      <h1>Color Coding</h1>
    </div>
    <Button onclick={toggleMode} variant="outline" size="icon">
      <Sun
        class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
      />
      <Moon
        class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
      />
    </Button>

    <Button variant="outline" size="icon" onclick={() => (showPlayerInfo = true)}>
      <User class="h-[1.2rem] w-[1.2rem]" />
    </Button>
  </div>

  <!-- Player Info Window -->
  {#if showPlayerInfo && currPlayer}
    <div class="absolute top-full right-0 bg-white dark:bg-gray-800 p-4 rounded-lg max-w-xs text-center z-50 mr-6 justify-center">
      <div class="flex items-end mb-4">
        <User class="h-12 w-12 rounded-full mr-8 ml-2" />
        <h2 class="text-xl text-center font-semibold mb-1"><strong>{currPlayer.username}</strong></h2>
      </div>
      <div class = "text-left">     
        <p class = "mb-1"><strong>Email:</strong> {currPlayer.email}</p>
        <p class = "mb-4"><strong>DSA:</strong> {currPlayer.DSA ? "Taken" : "Not Taken"}</p>
      </div> 
      <div class="flex items-center mb-1 justify-center gap-2">
        <!-- TODO: Sign user out in the backend as it currently just redirects them to the login page -->
        <Button variant="destructive" size="sm" onclick={() => handleSignOut()}>Sign Out</Button>
        <Button size="sm" onclick={() => (showPlayerInfo = false)}>Close</Button>
      </div>
    </div>
  {/if}
</div>
