<script lang="ts">
    import MonacoEditor from '$lib/components/MonacoEditor.svelte';
    import { ScrollArea } from '$lib/components/ui/scroll-area';
    import * as Resizable from "$lib/components/ui/resizable";
    import ResizableHandle from '$lib/components/ui/resizable/resizable-handle.svelte';
    import { Button } from '$lib/components/ui/button';

    const languages = [
      { value: '71', label: 'Python (3.8.1)', lang: 'python'},
      { value: '70', label: 'Python (2.7.17)', lang: 'python'},
      { value: '54', label: 'C++(GCC 9.2.0)', lang: 'cpp'},
      { value: '50', label: 'C (GCC 9.2.0)', lang: 'c'},
      { value: '62', label: 'Java', lang: 'java'},
      { value: '63', label: 'Javascript', lang: 'javascript'},
      { value: '74', label: 'Typescript', lang: 'typescript'}
    ];

    // In the future, instead of hardcoding the test cases, they will be fetched from the backend.
    let testCases = $state([
      {input: 'Hello World!', output: 'Hello World!', result: ""},
      {input: 'Testing2', output: 'Testing2', result: ""},
      {input: 'Testing3', output: 'Testing3',  result: ""},
    ])

    
 
    let executionResult: { output: string; passed: number; total: number } | null = null;
    let error: string | null = null;
    let chosenLanguage = $state(languages[0].value); // default to the first language
    let editorComponent: MonacoEditor;
    let code = $state("print('Hello World!')");
    let backendLanguage = $state(languages[0].lang); // default to the first language

    async function submitCode() {
  console.log(testCases.length);
  for (let i = 0; i < testCases.length; i++) {
    try {
      // Update test case status to indicate processing
      testCases[i].result = "Processing";
      testCases = [...testCases];

      // Prepare the submission object
      const submission = {
        source_code: editorComponent.getValue(),
        language_id: chosenLanguage,
        expected_output: testCases[i].output,
        stdin: testCases[i].input,
      };

      const submit = await fetch('http://localhost:2358/submissions/?base64_encoded=false&wait=false', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submission),
      });

      if (!submit.ok) {
        throw new Error(`Failed to submit code: ${submit.statusText}`);
      }

      const submissionToken = await submit.json();
      let response;

      const intervalId = setInterval(async () => {
        try {
          const getResponse = await fetch(
            `http://localhost:2358/submissions/${submissionToken.token}?base64_encoded=false`,
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );

          if (!getResponse.ok) {
            throw new Error(`Failed to fetch submission result: ${getResponse.statusText}`);
          }

          response = await getResponse.json();
          console.log("Response:");
          console.log(response);
          console.log(response.status.description);

          if (response.status.description !== "In Queue" && response.status.description !== "Processing") {
            clearInterval(intervalId);

            // Update the result for the current test case
            testCases[i].result = response.status.description === 'Accepted' ? 'Accepted' : 'Failed';

            // Reassign the testCases array to trigger reactivity
            testCases = [...testCases];
          }
        } catch (error) {
          clearInterval(intervalId);
          console.error("Error fetching submission result:", error);
          testCases[i].result = "Error";
          testCases = [...testCases];
        }
      }, 1500);
    } catch (error) {
      console.error("Error during submission:", error);
      testCases[i].result = "Error";
      testCases = [...testCases];
      break; // Stop further execution if an error occurs
    }
  }
}

    $effect(() => {
      backendLanguage = languages.find(lang => lang.value === chosenLanguage)?.lang || languages[0].lang;
      console.log("Language: " + backendLanguage);
    })

</script>

<div>
  <label for="language-select">Select Language:</label>
  <select id="language-select" bind:value={chosenLanguage}>
    {#each languages as lang}
      <option value={lang.value}>{lang.label}</option>
    {/each}
  </select>
</div>
<div class="h-[85vh]">
<Resizable.PaneGroup direction="horizontal" class="rounded-md border-2">
  <Resizable.Pane defaultSize={40}>
    <h1 class="text-3xl">Problem Title</h1>
    <h2 class="pb-8">Difficulty:</h2>
    <p class="pb-8">Description</p>
    <h2 class="text-2xl">Test Cases</h2>
    <ul>
      <!-- Display the test cases in a list -->
      {#each testCases as testCase, index}
      <li class="p-4">
        <p><strong>Input:</strong> {testCase.input}</p>
        <p><strong>Expected Output:</strong> {testCase.output}</p>
        <p><strong>Result:</strong>
          <span class={testCase.result === 'Accepted' ? 'text-green-500' : testCase.result === 'Failed' ? 'text-red-500' :
          testCase.result === 'Processing' ? 'text-yellow-500' : testCase.result === 'Error' ? 'text-red-500' : ''}>
            {testCase.result || ""}
          </span>
        </p>
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
          bind:lang={backendLanguage}
        />
      </Resizable.Pane>
      <Resizable.Handle />
      <Resizable.Pane defaultSize={100}>
        <ScrollArea>
        <div class="flex flex-row justify-between p-4">
          <Button on:click={submitCode}>Submit Solution</Button>
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



