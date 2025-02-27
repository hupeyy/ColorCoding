<script>
  import { onMount } from 'svelte';

  let windowHeight = 0;
  let windowWidth = 0;
  let rows = 1;
  let columns = 1;
  let tileSize = 32;
  let mounted = false;

  function updateGridDimensions() {
    // Calculate how many tiles can fit in the window
    columns = Math.floor(windowWidth / tileSize);
    rows = Math.floor(windowHeight / tileSize);
    
    // Recalculate tile size to fill the entire screen width/height
    const newTileWidth = windowWidth / columns;
    const newTileHeight = windowHeight / rows;
    
    // Use the smaller of the two to maintain square tiles
    tileSize = Math.min(newTileWidth, newTileHeight);
    
    if (mounted) {
      document.documentElement.style.setProperty('--columns', `repeat(${columns}, 1fr)`);
      document.documentElement.style.setProperty('--rows', `repeat(${rows}, 1fr)`);
      document.documentElement.style.setProperty('--tile-size', `${tileSize}px`);
    }
  }

  function getRandomColor() {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return `rgb(${r}, ${g}, ${b})`;
  }

  onMount(() => {
    mounted = true;
    windowHeight = window.innerHeight;
    windowWidth = window.innerWidth;
    updateGridDimensions();

    window.addEventListener('resize', () => {
      windowHeight = window.innerHeight;
      windowWidth = window.innerWidth;
      updateGridDimensions();
    });

    return () => {
      window.removeEventListener('resize', updateGridDimensions);
    };
  });
</script>

<style lang="postcss">
  .grid {
    display: grid;
    grid-template-columns: var(--columns, repeat(1, 1fr));
    grid-template-rows: var(--rows, repeat(1, 1fr));
    width: 100vw;
    height: 100vh;
    margin: 0;
    padding: 0;
  }

  .tile {
    width: var(--tile-size, 32px);
    height: var(--tile-size, 32px);
    border: 2px solid black;
    box-sizing: border-box;
  }

  .button {
    @apply grow border-black border-2 rounded-lg p-2;
  }
</style>

<svelte:head>
  <style>
    body, html {
      margin: 0;
      padding: 0;
      overflow: hidden;
    }
  </style>
</svelte:head>

{#if mounted}
<div>
  <div class="grid">
    {#each Array(Math.floor(rows * columns)) as _, i}
      <div class="tile" style="background-color: {getRandomColor()};"></div>
    {/each}
  </div>
  <div class="fixed bg-white p-4 rounded-xl left-1/2 top-1/2 transform -transform -translate-x-1/2 -translate-y-1/2 flex flex-col">
    <div class="bg-white p-2 shadow-lg text-center text-6xl ">
        ColorCode
      <div class="text-xl font-light text-center">
        Presented by ColorStack UF
      </div>
    </div>
    <div>
      <div class="flex flex-row gap-4 text-center mt-4 rounded-lg shadow-lg text-black text-2xl">
        <button class="bg-green-500 button">
          Sign In 
        </button>
        <button class="bg-blue-500 button">
          Sign Up 
        </button>
      </div>
    </div>
  </div>
  
</div>
{:else}
  <div>Loading...</div>
{/if}
