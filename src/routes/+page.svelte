<script>
  import { onMount } from 'svelte';
  import { Button } from '$lib/components/ui/button';

  let rows = 16;
  let columns = 16;
  let tileSize = 64;
  let mounted = false;
  let registering = false;

  let tiles = [];
  
  onMount(() => {
    mounted = true;
  });
</script>

<style lang="postcss">
  .grid {
    display: grid;
    width: 100vw;
    height: 100vh;
  }

  .tile {
    box-sizing: border-box;
    background-color: white;
    animation: wave-effect 1s ease-out forwards;
    animation-play-state: running;
    transform-origin: center;
  }

  .tile:hover {
    animation-name: tile-hover;
    background-color: black;
    animation-duration: 0.5s;
    animation-timing-function: ease-in-out;
  }
</style>


<svelte:head>
  <style>
    body, html {
      overflow: hidden;
    }
  </style>
</svelte:head>

{#if mounted}
<div>
  <div 
    class="grid"
    style="grid-template-columns: repeat({columns}, 1fr); grid-template-rows: repeat({rows}, 1fr);"
  >

    {#each Array(Math.floor(rows * columns)) as _, i}
      <div bind:this="{tiles[i]}" class="tile"></div>
    {/each}
  </div>
  <div class="fixed bg-white p-4 rounded-xl left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col">
    <div class="bg-white p-2 shadow-lg text-center text-6xl ">
        ColorCoding
      <div class="text-xl font-light text-center">
        Presented by ColorStack UF
      </div>
    </div>
    <div>
      <div class="flex flex-row gap-4 text-center mt-4 rounded-lg shadow-lg text-black text-2xl">
        <Button 
          class="bg-green-500 grow text-lg"
          on:click={() => {
            window.location.href = '/lobby';
          }}
        >
          Sign In 
        </Button>
        <Button 
          class="bg-blue-500 grow text-lg"
          on:click={() => {
            registering = true; 
          }}
        >
          Sign Up 
        </Button>
      </div>
    </div>
  </div>
  {#if registering}
    <div class="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-4 rounded-xl shadow-lg">
      <div class="text-center text-2xl font-bold">
        Register
      </div>
      
    </div>
  {/if}
  
</div>
{:else}
  <div>Loading...</div>
{/if}
