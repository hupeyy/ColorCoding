<script lang="ts">

    import { onMount } from 'svelte';
    import { problems, createProblem } from '$lib/firebase';
    import { page } from '$app/stores';
    
    let title = '';
    let description = '';
    let inputs = [];
    let outputs = [];
    let difficulty = 'easy';
    let successMessage = '';
    let errorMessage = '';
    
    async function handleSubmit() {
        let problem: Omit<Problem, 'id'> = {
            title: title,
            description: description,
            inputs: inputs,
            outputs: outputs,
            difficulty: difficulty,
        };

        try {
            await createProblem(problem);
            successMessage = 'Problem created successfully!';
            errorMessage = '';
        } catch (error) {
            errorMessage = 'Error creating problem: ' + error.message;
            successMessage = '';
        }
    }

</script>

<!-- Create a simple menu to create a problem -->
<div class="flex flex-col items-center justify-center h-screen p-4">
  <h1 class="text-3xl font-bold mb-4">Create a Problem</h1>
  <form class="flex flex-col space-y-4" on:submit|preventDefault={handleSubmit}>
    <input type="text" placeholder="Problem Title" bind:value={title} class="w-128 border p-2 rounded" required />
    <textarea placeholder="Problem Description" bind:value={description} class="border p-2 rounded" required></textarea>
    <textarea placeholder="Input Examples (comma-separated)" bind:value={inputs} class="border p-2 rounded" required></textarea>
    <textarea placeholder="Output Examples (comma-separated)" bind:value={outputs} class="border p-2 rounded" required></textarea>
    <select bind:value={difficulty} class="border p-2 rounded">
      <option value="easy">Easy</option>
      <option value="medium">Medium</option>
      <option value="hard">Hard</option>
    </select>
    <button type="submit" class="bg-blue-500 text-white p-2 rounded">Create Problem</button>
  </form>
  {#if successMessage}
    <p class="text-green-500 mt-4">{successMessage}</p>
  {/if}
  {#if errorMessage}
    <p class="text-red-500 mt-4">{errorMessage}</p>
  {/if}
</div>