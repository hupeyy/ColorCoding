<script lang="ts">
  import MonacoEditor from '$lib/components/MonacoEditor.svelte';
  import { ScrollArea } from '$lib/components/ui/scroll-area';
  import * as Resizable from "$lib/components/ui/resizable";
  import ResizableHandle from '$lib/components/ui/resizable/resizable-handle.svelte';
  import { Button } from '$lib/components/ui/button';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { problems, getProblems } from '$lib/firebase';
    
  let editorComponent: MonacoEditor;
  
  const languages = [
    { value: 'python', label: 'Python' }
  ];

  let selectedLanguage = languages[0].value; 
  let code = "hi";
  let executionResult: { output: string; passed: number; total: number } | null = null;
  let error: string | null = null;

  $:problemID = $page.params.problemID;
  let problem: Problem;
  let testCases = [];
  $: {
    if ($problems) {
      problem = $problems.find(p => p.id === problemID);
      testCases = problem["inputs"].map(function(input, index) {
        return { input: input, output: problem["outputs"][index] };
      });
      console.log(testCases);
    }
  }

  onMount(() => {
    const unsubscribe = getProblems()
    return unsubscribe;
  });

  // function handleLanguageChange(event: Event) {
  //   const target = event.target as HTMLSelectElement;
  //   selectedLanguage = target.value;
  //   code = problem.starterCode[selectedLanguage];
  // }
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
{#if problem === undefined}
  <p>Loading...</p>
{:else}
  <div class="h-[85vh]">
  <Resizable.PaneGroup direction="horizontal" class="rounded-md border-2">
    <Resizable.Pane defaultSize={40}>
      <h1 class="text-3xl">{problem["title"]}</h1>
      <h2 class="pb-8">Difficulty: {problem["difficulty"]}</h2>
      <p class="pb-8">{problem["description"]}</p>
      <h2 class="text-2xl">Test Cases</h2>
      <ul>
        {#each testCases as testCase}
          <li>Input: {testCase["input"]}</li>
          <li>Expected Output: {testCase["output"]}</li>
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
              <Button>Submit Solution</Button>
              <Button>Save Code</Button>
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
{/if}