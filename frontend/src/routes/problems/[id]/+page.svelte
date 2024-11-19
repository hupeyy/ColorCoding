<script lang="ts">
    import type { PageData } from './$types';
    import MonacoEditor from '$lib/components/MonacoEditor.svelte';
    import { ScrollArea } from '$lib/components/ui/scroll-area';
    import * as Resizable from "$lib/components/ui/resizable";
    import ResizableHandle from '$lib/components/ui/resizable/resizable-handle.svelte';
    import { Button } from '$lib/components/ui/button';
    
    export let data: PageData;
    let { problem } = data;
    
    let editorComponent: MonacoEditor;
    
    const languages = [
      { value: 'python', label: 'Python' }
    ];

    let selectedLanguage = languages[0].value; 
    let code = problem.code[selectedLanguage];
    let executionResult: { output: string; passed: number; total: number } | null = null;
    let error: string | null = null;

    // function handleLanguageChange(event: Event) {
    //   const target = event.target as HTMLSelectElement;
    //   selectedLanguage = target.value;
    //   code = problem.starterCode[selectedLanguage];
    // }
    
    async function handleSubmit() {
      const submittedCode = editorComponent.getCode();
      console.log('Submitted code:\n', submittedCode);
      console.log('Language:', selectedLanguage);
      saveCode();
      
      try {
        const response = await fetch('http://localhost:3000/execute', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            code: submittedCode,
            language: selectedLanguage,
            testCases: problem.testCases,
            problemID: problem.id
          })
        });

        if (!response.ok) {
          throw new Error('Execution failed');
        }

        const result = await response.json();
        console.log('Execution result:', result);
        executionResult = result;
        error = null;
        problem.passed = result.passed;
      } catch (err) {
        console.error('Error executing code:', err);
        error = err instanceof Error ? err.message : String(err);
        executionResult = null;
      }
    }

    async function saveCode() {
      const submittedCode = editorComponent.getCode();
      console.log('Submitted code:\n', submittedCode);
      console.log('Language:', selectedLanguage);
      
      try {
        const response = await fetch('http://localhost:3000/save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            code: submittedCode,
            problemID: problem.id,
            language: selectedLanguage,
          })
        });
      } catch (err) {
        console.error('Error saving code:', err);
        error = err instanceof Error ? err.message : String(err);
      }
    }
</script>

<!-- Add later when multi-language support is working -->
<!-- <div>
  <label for="language-select">Select Language:</label>
  <select id="language-select" on:change={handleLanguageChange}>
    {#each languages as lang}
      <option value={lang.value}>{lang.label}</option>
    {/each}
  </select>
</div> -->
<div class="h-[85vh]">
<Resizable.PaneGroup direction="horizontal" class="rounded-md border-2">
  <Resizable.Pane defaultSize={40}>
    <h1 class="text-3xl">{problem.title}</h1>
    <h2 class="pb-8">Difficulty: {problem.difficulty}</h2>
    <p class="pb-8">{problem.description}</p>
    <h2 class="text-2xl">Test Cases</h2>
    <ul>
      <!-- print only the first three test cases -->
      {#each problem.testCases.slice(0, 3) as testCase}
        <li class="p-4">
          <p>Input: {testCase.input}</p>
          <p>Output: {testCase.output}</p>
        </li>
      {/each}
    </ul>
  </Resizable.Pane>
  <ResizableHandle />
  <Resizable.Pane defaultSize={60}>
    <Resizable.PaneGroup direction="vertical">
      <Resizable.Pane defaultSize={100}>
        <MonacoEditor
          bind:this={editorComponent}
          bind:code={code}
          language={selectedLanguage}
        />
      </Resizable.Pane>
      <Resizable.Handle />
      <Resizable.Pane defaultSize={100}>
        <ScrollArea>
        <div class="flex flex-row justify-between p-4">
          <Button on:click={handleSubmit}>Submit Solution</Button>
          <Button on:click={saveCode}>Save Code</Button>
        </div>
        {#if executionResult}
          <div>
            <h2>Execution Result</h2>
            <p>Tests Passed: {executionResult.passed} / {executionResult.total}</p>
          </div>
        {/if}
        {#if error}
          <div class="error">
            <p>Error: {error}</p>
          </div>
        {/if}
        </ScrollArea>
      </Resizable.Pane>
    </Resizable.PaneGroup>
  </Resizable.Pane>  
</Resizable.PaneGroup>
</div>



