<script lang="ts">
  import MonacoEditor from '$lib/components/MonacoEditor.svelte';
  import { slide } from 'svelte/transition';
  import { ScrollArea } from "$lib/components/ui/scroll-area/index.js"; 
  import * as Resizable from "$lib/components/ui/resizable";
  import ResizableHandle from '$lib/components/ui/resizable/resizable-handle.svelte';
  import { Button } from '$lib/components/ui/button';
  import { problems, getProblems } from '$lib/firebase';
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import {
    leaveLobby,
    currentPlayer, 
    updateLobby,
    lobbies,
    getLobbies,
  } from '$lib/firebase';

  const languages = [
      { value: '71', label: 'Python (3.8.1)', lang: 'python'},
      { value: '70', label: 'Python (2.7.17)', lang: 'python'},
      { value: '54', label: 'C++(GCC 9.2.0)', lang: 'cpp'},
      { value: '50', label: 'C (GCC 9.2.0)', lang: 'c'},
      { value: '62', label: 'Java', lang: 'java'},
      { value: '63', label: 'Javascript', lang: 'javascript'},
      { value: '74', label: 'Typescript', lang: 'typescript'}
  ];
    
  let editorComponent: MonacoEditor;
  let prevProblemID: string | null = null;
  let executionResult: { output: string; passed: number; total: number } | null = null;
  let error: string | null = null;
  let problemLoaded = false;

  let currPlayer = $derived<Player | null>($currentPlayer);
  let lobbyId = $derived(page.params.id);
  let selectedLobby = $derived($lobbies?.find(lobby => lobby.id === lobbyId) || null);
  let problemID = $derived(page.params.problemID);

  let chosenLanguage = $state(languages[0].value); // default to the first language
  let code = $state("print('Hello World!')");
  let backendLanguage = $state(languages[0].lang); // default to the first language
  let problem = $state<Problem | null>(null);
  let testCases = $state<{input: string, output: string, result: string}[]>([]);
  let showProblemList = $state(false);
  let dropdownRef = $state<HTMLElement | null>(null);
  let problemsFinished = $state(false);

  async function submitCode() {
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
              // console.log("Response:");
              // console.log(response);
              // console.log(response.status.description);

              if (response.status.description !== "In Queue" && response.status.description !== "Processing") {
                clearInterval(intervalId);

                // Update the result for the current test case
                testCases[i].result = response.status.description === 'Accepted' ? 'Passed' : 'Failed';

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
  async function exitLobby(lobbyId){
    if (!currPlayer) {
      alert("Please log in to exit the lobby.");
      return;
    }
    if(currPlayer.uid == selectedLobby?.host.uid){
      await updateLobby(lobbyId, {status: 'Waiting',});
    }
    else{
      await leaveLobby(lobbyId, currPlayer);
    }
    window.location.href = `/lobbies/`;
  }

  function handleClick(event) {
    if (showProblemList && dropdownRef && !event.composedPath().includes(dropdownRef)) {
      showProblemList = false;
    }
  }
  
  function handleProblemChange(problemId){
    problemLoaded = false;
    if (prevProblemID !== problemId) {
      prevProblemID = problemId;
      problemID = problemId;
      showProblemList = false;
    }
  }

  $effect(() => {
    backendLanguage = languages.find(lang => lang.value === chosenLanguage)?.lang || languages[0].lang;
  });

  $effect(() => {
    if(selectedLobby?.status === "Waiting" && currPlayer?.uid != selectedLobby?.host.uid) {
      // If the lobby is waiting and the current player is not the host, redirect to lobbies page
      alert("The host has left the lobby. You are being redirected to the lobbies page.");
      window.location.href = '/lobbies';
    }
  });

  $effect(() => {
    if(showProblemList) {
      window.addEventListener('pointerdown', handleClick);
    } else {
      window.removeEventListener('pointerdown', handleClick);
    }
  });

  $effect(() => {
    // Check if all test cases have passed
    const allPassed = testCases.every(testCase => testCase.result === "Passed");
    if(allPassed && problemID && currPlayer) {
      updateLobby(lobbyId, {
        playerData: 
        {...selectedLobby?.playerData,
          [currPlayer?.uid]: 
          {...selectedLobby?.playerData[currPlayer?.uid],
            problemsSolved: 
            {...selectedLobby?.playerData[currPlayer?.uid]?.problemsSolved, [problemID]: problem?.difficulty}
          }
        }
      });
    }
    // If all problems are finished, set problemsFinished to true
    const allProblemsFinished = Object.keys(selectedLobby?.playerData?.[currPlayer?.uid]?.problemsSolved || {}).length === selectedLobby?.problemIDs?.length;
    if(allProblemsFinished) {
      problemsFinished = true;
    }
  });

  //Subscribe to problems store and find the specific problem
  $effect(() => {
    if ($problems && problemID && problemLoaded== false) {
      problemLoaded = true;
      problem = $problems.find(p => p.id === problemID) || null;     
      if(problem) {
        testCases = problem.inputs.map((input, index) => ({
          input: input,
          output: problem.outputs[index],
          result: "",
        }));
      }
    }
  });

  let unsubscribeProblems: (() => void) | null = null;

  onMount(() => {
    const unsubscribeLobbies = getLobbies();
    const unsubscribeProblems = getProblems();

    return () => {
      unsubscribeLobbies();
      unsubscribeProblems();
    }
  });
</script>

{#if !problem}
  <div class="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
    <p>Loading problem...</p>
  </div>
{:else}
  <div class="flex items-center border-t-2 py-2">
    <Button 
      onclick={() => {showProblemList=true;}} 
      disabled={showProblemList}
      class="mr-4 ml-2"
      variant="secondary">
      Problem List
    </Button>
    <label for="language-select">Language:</label>
    <select id="language-select" bind:value={chosenLanguage}
    class="ml-2 p-1 rounded">
      {#each languages as lang}
        <option value={lang.value}>{lang.label}</option>
      {/each}
    </select>
  </div>
  <div class="h-[80vh]">
    <Resizable.PaneGroup direction="horizontal" class="rounded-md border-2">
      <Resizable.Pane defaultSize={40} style="overflow: auto;">
        <div class ="m-4">
          <h1 class="text-3xl"><strong>{problem["title"]}</strong></h1>
          <h2 class="pb-8">Difficulty: <span class={problem["difficulty"] === "Easy" ? "text-green-500" : problem["difficulty"] === "Medium" ?
          "text-yellow-500": "text-red-500"}>{" "}{problem["difficulty"]}</span></h2>
          <p class="pb-8">{problem["description"]}</p>
          <h2 class="text-2xl"><strong>Test Cases</strong></h2>
            <ul>
              {#each testCases as testCase}
                <li>Input:{" "}{testCase["input"]}</li>
                <li>Expected Output:{" "}{testCase["output"]}</li>
                <li>Result:{" "}<span class={testCase["result"] === "Passed" ? "text-green-500" : testCase["result"] === "Processing" ? 
                "text-yellow-500" : "text-red-500"}>{" "}{testCase["result"]}</span></li>
                <br> <!-- Line Break  -->
              {/each}
            </ul>
          </div>
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
              <div class="flex flex-col min-h-[400px] h-full">
                <div class="flex flex-row justify-between p-4">
                  <Button onclick={submitCode}>Submit Solution</Button>
                  <Button>Save Code</Button>
                </div>
                {#if executionResult}
                  <div>
                    <h2>Execution Result</h2>
                    <!-- <p>Tests Passed: {executionResult.passed} / {executionResult.total}</p> -->
                  </div>
                {/if}
                {#if error}
                  <div class="error">
                    <p>Error: {error}</p>
                  </div>
                {/if}  
              </div>           
            </ScrollArea>            
          </Resizable.Pane>          
        </Resizable.PaneGroup>        
      </Resizable.Pane>  
    </Resizable.PaneGroup>
    {#if problemsFinished}
      <div class="fixed flex justify-center items-center bottom-0 left-0 p-4">
        <Button onclick={() => (window.location.href = `/lobbies/${lobbyId}/finished`)}>Finish Problem Set</Button>
      </div>
    {/if}
    <div class="fixed flex justify-end items-end p-4 bottom-0 right-0">
      <Button onclick={() => exitLobby(lobbyId)}>Exit Lobby</Button>
    </div>
  </div>
{/if}
<!--Problem List Dropdown -->
{#if showProblemList}
  <div bind:this={dropdownRef} class="absolute top-20 mt-10 left-2 bg-white dark:bg-gray-800 p-4 rounded-md max-w-xs min-w-[260px] shadow-lg z-50"
    transition:slide={{duration: 250}}>
    <div class="flex justify-between items-center mb-2">
      <h1 class="text-2xl"><strong>Problems</strong></h1>
    </div>
    <ul>
      {#each $problems.filter(p => selectedLobby?.problemIDs?.includes(p.id)) as p}
        <li class="flex justify-between items-center">
          <Button variant="link" class="text-blue-500 hover:underline p-0 m-0" onclick={() => handleProblemChange(p.id)}>{p.title}</Button>
          <!-- Check if problem is marked as complete in lobby playerData -->
          {#if selectedLobby?.playerData?.[currPlayer?.uid]?.problemsSolved?.[p.id]}
            <span class="text-green-500">Complete</span>
          {:else}
            <span class="text-yellow-500">Incomplete</span>
          {/if}
        </li>
      {/each}
    </ul>
  </div>
{/if}