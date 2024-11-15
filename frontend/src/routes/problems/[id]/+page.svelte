<script lang="ts">
    import type { PageData } from './$types';
    import MonacoEditor from '$lib/components/MonacoEditor.svelte';
    
    export let data: PageData;
    const { problem } = data;
    
    let editorComponent: MonacoEditor;
    
    const languages = [
      { value: 'python', label: 'Python' }
    ];

    let selectedLanguage = languages[0].value; 
    let code = problem.starterCode[selectedLanguage];
    let executionResult: { output: string; passed: number; total: number } | null = null;
    let error: string | null = null;

    function handleLanguageChange(event: Event) {
      const target = event.target as HTMLSelectElement;
      selectedLanguage = target.value;
      code = problem.starterCode[selectedLanguage];
    }
    
    async function handleSubmit() {
      const submittedCode = editorComponent.getCode();
      console.log('Submitted code:\n', submittedCode);
      console.log('Language:', selectedLanguage);
      
      try {
        const response = await fetch('http://localhost:3000/execute', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            code: submittedCode,
            language: selectedLanguage,
            testCases: problem.testCases
          })
        });

        if (!response.ok) {
          throw new Error('Execution failed');
        }

        const result = await response.json();
        console.log('Execution result:', result);
        executionResult = result;
        error = null;
      } catch (err) {
        console.error('Error executing code:', err);
        error = err instanceof Error ? err.message : String(err);
        executionResult = null;
      }
    }
</script>

<h1>{problem.title}</h1>
<p>{problem.description}</p>

<!-- Add later when multi-language support is working -->
<!-- <div>
  <label for="language-select">Select Language:</label>
  <select id="language-select" on:change={handleLanguageChange}>
    {#each languages as lang}
      <option value={lang.value}>{lang.label}</option>
    {/each}
  </select>
</div> -->

<MonacoEditor bind:this={editorComponent} bind:code language={selectedLanguage} />

<button on:click={handleSubmit}>Submit Solution</button>

{#if executionResult}
  <div>
    <h2>Execution Result</h2>
    <p>Tests Passed: {executionResult.passed} / {executionResult.total}</p>
    <pre>{executionResult.output}</pre>
  </div>
{/if}

{#if error}
  <div class="error">
    <p>Error: {error}</p>
  </div>
{/if}