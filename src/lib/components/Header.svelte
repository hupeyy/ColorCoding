<script lang="ts">
  import Sun from "lucide-svelte/icons/sun";
  import Moon from "lucide-svelte/icons/moon";
  import User from "lucide-svelte/icons/user";
 
  import { toggleMode } from "mode-watcher";
  import { Button } from "$lib/components/ui/button/index.js";

  import { currentPlayer, getCurrentPlayer } from "$lib/firebase";
  import { onMount } from "svelte";

  let currPlayer = $derived<Player | null>($currentPlayer); // Current player derived store

  onMount(() => {
    const unsubscribe = getCurrentPlayer(); // Subscribe to current player changes

    return () => unsubscribe();
  });

</script>
 
<div class="flex flex-row justify-end px-6 py-4 gap-4">
  <Button on:click={toggleMode} variant="outline" size="icon">
    <Sun
      class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
    />
    <Moon
      class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
    />
  </Button>

  <Button variant="outline" size="icon" onclick={() => (console.log("Current Player: ", currPlayer))}>
    <User class="h-[1.2rem] w-[1.2rem]" />
  </Button>
</div>

