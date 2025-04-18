<script lang="ts">
  import { onMount } from 'svelte';
  import { spring } from 'svelte/motion';
  import Button from "$lib/components/ui/button/button.svelte";
  import { Label } from "$lib/components/ui/label/index.js";
  import * as RadioGroup from "$lib/components/ui/radio-group/index.js";
  import { Mail, User, Lock, X } from 'lucide-svelte';
  import { currentPlayer, players, createPlayer, signIn, getPlayers, getCurrentPlayer } from '$lib/firebase'

  let gridSize = 64;
  let tileSize = 64;
  let mounted = $state(false);

  // Toggles for which section is visible
  let showSignUpSection = $state(false);
  let showSignInSection = $state(false);

  // Current player
  let currPlayer = $derived<Player | null>($currentPlayer);

  // Form fields
  let email = $state("");
  let username = $state("");
  let password = $state("");
  let dsa = $state("false");
  let dsaBoolean = $derived(dsa === "true");
  let confirmPassword = $state("");

  // Animated background variables
  let mousePosition = spring({ x: 0, y: 0 });
  const palette = ["0BA7C2", "8D80AD", "157145", "DEF6CA", "DE9A2D"];
  const totalTiles = gridSize * gridSize;
  let tileColors: string[] = $state([]);

  onMount(() => {
    mounted = true;
    const unsubscribePlayers = getPlayers(); 
    const unsubscribeCurrentPlayer = getCurrentPlayer();
    tileColors = Array(totalTiles)
      .fill(null)
      .map(() => palette[Math.floor(Math.random() * palette.length)]);
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      unsubscribePlayers; 
      unsubscribeCurrentPlayer;
    }
  });

  function handleMouseMove(event: MouseEvent) {
    mousePosition.set({ x: event.clientX, y: event.clientY });
  }

  async function handleRegister() {
    let player: Player = {
      email: email,
      username: username,
      password: password,
      DSA: dsaBoolean
    };

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    if (email === "" || username === "" || password === "") {
      alert("Please fill in all fields!");
      return;
    }

    try {
      await createPlayer(player);

      // Reset fields & hide sign-up section
      email = '';
      username = '';
      password = '';
      confirmPassword = '';
      dsa = "false";
      showSignUpSection = false;
      showSignInSection = false;
      alert("User created successfully!");
    } catch(error: any) {
      console.error("Registration error:", error);
      alert(error.message);
    }
  }

  // SIGN IN USER
  async function handleSignIn() {

    if (email === "" || password === "") {
      alert("Please fill in all fields!");
      return;
    }

    try {
      const player = await signIn(email, password);
      
      // Reset fields & hide sign-in section
      email = '';
      password = '';
      showSignInSection = false;
      alert("User signed in successfully!");
      window.location.href = `/lobbies/`;
    } catch(error: any) {
      console.error("Sign-in error:", error);
      alert(error.message);
    }
  }
</script>

<style lang="postcss">
  .grid {
    @apply fixed w-screen h-screen top-[-25vh] left-[-25vw] gap-0;
  }

  .tile {
    box-sizing: border-box;
    background-color: white;
    animation: wave-effect 1s ease-out forwards;
    animation-play-state: running;
    transform-origin: center;
    border: black 2px solid;
  }

  form div {
    margin-bottom: 1rem;
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
<div class="w-screen h-screen">
  <!-- Animated Background Grid -->
  <div
    class="grid"
    style="
      grid-template-columns: repeat({gridSize}, 1fr);
      grid-template-rows: repeat({gridSize}, 1fr);
      transform: translate(
        {-($mousePosition.x - window.innerWidth / 2) / 20}px,
        {-($mousePosition.y - window.innerHeight / 2) / 20}px
      );
    "
  >
    {#each tileColors as color, i}
      <div
        class="tile"
        style="height:{tileSize}px; width:{tileSize}px; background-color: #{color};"
      ></div>
    {/each}
  </div>

  <!-- Main Content Section -->
  <div class="fixed bg-white p-4 rounded-xl left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
    <div class="text-center text-6xl">
      ColorCoding
      <div class="text-xl font-light">
        Presented by ColorStack UF
      </div>
    </div>
    <div class="mt-4 flex gap-4">
      <Button
        class="bg-green-500 text-lg"
        onclick={() => {
          showSignInSection = true;
          showSignUpSection = false;
        }}
      >
        Sign In
      </Button>
      <Button
        class="bg-gray-800 text-lg text-white"
        onclick={() => {
          showSignUpSection = true;
          showSignInSection = false;
        }}
      >
        Sign Up
      </Button>
    </div>
  </div>

  <!-- Sign Up Section -->
  {#if showSignUpSection}
    <div class="fixed bg-white p-4 rounded-xl left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
      <Button
          class="absolute top-2 right-2"
          onclick={() => (showSignUpSection = false)}
        >
          <X size={24} />
        </Button>
      <h2 class="text-2xl font-bold text-center mb-4 my-10">Sign Up</h2>
      <form onsubmit={handleRegister} class="flex flex-col gap-4">
        <!-- Email Field -->
        <div class="flex items-center border rounded px-2">
          <Mail class="mr-2" size={20} />
          <input
            type="email"
            placeholder="Email"
            bind:value={email}
            required
            class="flex-grow py-2 outline-none"
          />
        </div>
        <!-- Username Field -->
        <div class="flex items-center border rounded px-2">
          <User class="mr-2" size={20} />
          <input
            type="text"
            placeholder="Username"
            bind:value={username}
            required
            class="flex-grow py-2 outline-none"
          />
        </div>
        <!-- DSA Checkbox -->
        <label class="flex items-center gap-2">
          <RadioGroup.Root bind:value={dsa} class="mr-2">
            <div class="flex items-center space-x-2">
              <RadioGroup.Item value={"true"} id="dsa-true" />
              <Label for="option-one">Taken DSA</Label>
            </div>
            <div class="flex items-center space-x-2">
              <RadioGroup.Item value={"false"} id="dsa-false" />
              <Label for="option-two">Have Not Taken DSA</Label>
            </div>
          </RadioGroup.Root>
        </label>
        <!-- Password Field -->
        <div class="flex items-center border rounded px-2">
          <Lock class="mr-2" size={20} />
          <input
            type="password"
            placeholder="Password"
            bind:value={password}
            required
            class="flex-grow py-2 outline-none"
          />
        </div>
        <!-- Confirm Password Field -->
        <div class="flex items-center border rounded px-2">
          <Lock class="mr-2" size={20} />
          <input
            type="password"
            placeholder="Confirm Password"
            bind:value={confirmPassword}
            required
            class="flex-grow py-2 outline-none"
          />
        </div>
        <!-- Buttons -->
        <div class="flex gap-2 mt-4 justify-end">
          <Button type="submit" class="bg-gray-800 text-white">Sign Up</Button>
          <Button
            type="button"
            class="bg-gray-500"
            onclick={() => (showSignUpSection = false)}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  {/if}

  <!-- Sign In Section -->
  {#if showSignInSection}
    <div class="fixed bg-white p-4 rounded-xl left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
        <Button
          class="absolute top-2 right-2"
          onclick={() => (showSignInSection = false)}
        >
          <X size={24} />
        </Button>
      <h2 class="text-2xl font-bold text-center my-10">Sign In</h2>
      <form onsubmit={handleSignIn} class="flex flex-col gap-4">
        <!-- Email Field -->
        <div class="flex items-center border rounded px-2">
          <Mail class="mr-2" size={20} />
          <input
            type="email"
            placeholder="Email"
            bind:value={email}
            required
            class="flex-grow py-2 outline-none"
          />
        </div>
        <!-- Password Field -->
        <div class="flex items-center border rounded px-2">
          <Lock class="mr-2" size={20} />
          <input
            type="password"
            placeholder="Password"
            bind:value={password}
            required
            class="flex-grow py-2 outline-none"
          />
        </div>
        <!-- Buttons -->
        <div class="flex mt-4 mx-5 justify-between">
          <Button type="submit" class="bg-green-500">Sign In</Button>
          <Button
            type="button"
            class="bg-gray-500"
            onclick={() => (showSignInSection = false)}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  {/if}
</div>
{:else}
  <div>Loading...</div>
{/if}