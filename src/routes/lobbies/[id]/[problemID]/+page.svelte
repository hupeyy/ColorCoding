<script lang="ts">
  import MonacoEditor from '$lib/components/MonacoEditor.svelte';
  import { ScrollArea } from '$lib/components/ui/scroll-area';
  import * as Resizable from "$lib/components/ui/resizable";
  import ResizableHandle from '$lib/components/ui/resizable/resizable-handle.svelte';
  import { Button } from '$lib/components/ui/button';
  import { problems, getProblems } from '$lib/firebase';
  import { onMount } from 'svelte';
  import { page } from '$app/state';

  let editorComponent: MonacoEditor = $state();
  
  const languages = [
    { value: 'python', label: 'Python' }
  ];

  let selectedLanguage = languages[0].value; 
  let code = $state("hi"); // Default code for the editor
  let executionResult: { output: string; passed: number; total: number } | null = null;
  let error: string | null = null;

  let problemID = $derived(page.params.problemID);
  let problem = $state<Problem | null>(null);
  let testCases = $state<{input: string, output: string}[]>([]);

  // Subscribe to problems store and find the specific problem
  $effect(() => {
    if ($problems) {
      problem = $problems.find(p => p.id === problemID) || null;
      
      if (problem) {
        testCases = problem.inputs.map((input, index) => ({
          input: input,
          output: problem.outputs[index]
        }));
      }
    }
  });

  let unsubscribeProblems: (() => void) | null = null;

  onMount(() => {
    getProblems().then(unsub => {
      unsubscribeProblems = unsub;
    });
    
    console.log("Problem:", problem);

    return () => {
      if (unsubscribeProblems) {
        unsubscribeProblems();
      }
    };
  });
</script>

{#if !problem}
  Loading problem...
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