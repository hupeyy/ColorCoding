<script lang="ts">
  import Sun from "lucide-svelte/icons/sun";
  import Moon from "lucide-svelte/icons/moon";
  import User from "lucide-svelte/icons/user";
  import ArrowLeft from "lucide-svelte/icons/arrow-left";
  import ArrowRight from "lucide-svelte/icons/arrow-right";
  import { toggleMode } from "mode-watcher";b
  import { Button } from "$lib/components/ui/button/index.js";
  import { currentPlayer, getCurrentPlayer } from "$lib/firebase";
  import { onMount } from "svelte";
  import { page } from "$app/state";

  let currPlayer = $derived<Player | null>($currentPlayer);

  let currPage = $derived(page.path);

  const handleBack = () => {
    window.history.back();
  };

  const handleForward = () => {
    window.history.forward();
  };

  onMount(() => {
    const unsubscribe = getCurrentPlayer();
    return () => {
      unsubscribe();
    };
  });

</script>

<div class="py-4 px-6 flex flex-row justify-between items-center bg-white dark:bg-gray-800 shadow-md">
  <div class="flex flex-row gap-4">
    <Button variant="outline" size="icon" onclick={handleBack}>
      <ArrowLeft />
    </Button>

    <Button variant="outline" size="icon" onclick={handleForward}>
      <ArrowRight />
    </Button>
  </div>
  <div class="flex flex-row justify-end px-6 gap-4">
    <Button onclick={toggleMode} variant="outline" size="icon">
      <Sun
        class="rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
      />
      <Moon
        class="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
      />
    </Button>

    <Button variant="outline" size="icon" onclick={() => (console.log("Current Player: ", currPlayer))}>
      <User />
    </Button>
  </div>
</div>

