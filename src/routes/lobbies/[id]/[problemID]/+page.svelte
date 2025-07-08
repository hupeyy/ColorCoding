<script lang="ts">
  import MonacoEditor from '$lib/components/MonacoEditor.svelte';
	import toast, { Toaster } from 'svelte-french-toast';
  import { slide } from 'svelte/transition';
  import { ScrollArea } from "$lib/components/ui/scroll-area/index.js"; 
  import * as Resizable from "$lib/components/ui/resizable";
  import ResizableHandle from '$lib/components/ui/resizable/resizable-handle.svelte';
  import { Button } from '$lib/components/ui/button';
  import { problems, getProblems } from '$lib/firebase';
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import { saveProblemCode } from '$lib/stores/codeStore';
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
    
  let editorComponent = $state<MonacoEditor | null>(null);
  let prevProblemID: string | null = null;
  let executionResult: { output: string; passed: number; total: number } | null = null;
  let error: string | null = null;
  let problemLoaded = false;
  let saveSuccess = false;

  let currPlayer = $derived<Player | null>($currentPlayer);
  let lobbyID = $derived(page.params.id);
  let selectedLobby = $derived($lobbies?.find(lobby => lobby.id === lobbyID) || null);
  let problemID = $derived(page.params.problemID);

  let chosenLanguage = $state(languages[0].value); // default to the first language
  let code = $state("print('Hello World!')"); // default code
  let backendLanguage = $state(languages[0].lang); // default to the first language
  let problem = $state<Problem | null>(null);
  let testCases = $state<{input: string, output: string, result: string, runtime: number}[]>([]);
  let showProblemList = $state(false);
  let dropdownRef = $state<HTMLElement | null>(null);
  let problemsFinished = $state(false);
  let runTime = $state(-1);
  let codeMap = {};
    saveProblemCode.subscribe(value => {
    codeMap = value;
  });

  async function submitCode() {
    // For each test case, create a promise that resolves when the polling is done
    const promises = testCases.map((testCase, i) => {
      return new Promise<void>((resolve) => {
        testCases[i].result = "Processing";
        testCases = [...testCases];

        const submission = {
          source_code: editorComponent?.getValue(),
          language_id: chosenLanguage,
          expected_output: testCases[i].output,
          stdin: testCases[i].input,
        };

        fetch('http://localhost:2358/submissions/?base64_encoded=false&wait=false', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submission),
        })
          .then(submit => submit.json())
          .then(submissionToken => {
            const intervalId = setInterval(async () => {
              try {
                const getResponse = await fetch(
                  `http://localhost:2358/submissions/${submissionToken.token}?base64_encoded=false`,
                  { method: 'GET', headers: { 'Content-Type': 'application/json' } }
                );
                const response = await getResponse.json();
                if (response.status.description !== "In Queue" && response.status.description !== "Processing") {
                  clearInterval(intervalId);
                  testCases[i].result = response.status.description === 'Accepted' ? 'Passed' : 'Failed';
                  testCases[i].runtime = response.time || 0;
                  testCases = [...testCases];

                  // Log responses for debugging
                  // console.log(response);
                  // console.log(response.status.description);

                  resolve(); // <-- Mark this test case as done
                }
              } catch (error) {
                clearInterval(intervalId);
                testCases[i].result = "Error";
                testCases = [...testCases];
                resolve();
              }
            }, 1500);
          })
          .catch(error => {
            testCases[i].result = "Error";
            testCases = [...testCases];
            resolve();
          });
      });
    });

    // Wait for all test cases to finish
    await Promise.all(promises);
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

  function handleCodeSave(){
    if (!currPlayer) {
      alert("Please log in to save your code.");
      return;
    }
    if (!problemID) {
      alert("Please select a problem to save your code.");
      return;
    }
  
    // Save code for current problem
    code = editorComponent?.getValue();
    saveProblemCode.update(map => ({
      ...map,
      [lobbyID]: {
        ...(map[lobbyID] || {}),
        [problemID]: code
      }
    }));
    console.log("Code saved for problem " + problemID);
  }

  function showSaveSuccess(){
    toast.success("Code saved successfully!", {
      duration: 2000,
      position: 'top-center',
      style: 'background-color: #4caf50; color: #fff; padding: 10px 20px; border-radius: 5px;'
    });
  }

  function calculateRuntime() {
    const validRuntimes = testCases.map(tc => Number(tc.runtime)).filter(rt => !isNaN(rt) && rt > 0);

    if (validRuntimes.length === 0) {
      runTime = -1;
      return;
    }

    const sum = validRuntimes.reduce((total, rt) => total + rt, 0);
    runTime = Number((sum / validRuntimes.length).toFixed(2));
  }

  function handleClick(event) {
    if (showProblemList && dropdownRef && !event.composedPath().includes(dropdownRef)) {
      showProblemList = false;
    }
  }
  
  function handleProblemChange(problemId){
    // Save current code before switching
    handleCodeSave();
    problemLoaded = false;
    runTime = -1;
    if (prevProblemID !== problemId) {
      prevProblemID = problemId;
      problemID = problemId;
      // Load code for the new problem, or default if not present
      showProblemList = false;
    }
  }

  async function handleFinishProblemSet() {
    if (currPlayer && problemID && selectedLobby) {
        await updateLobby(lobbyID, {
        playerData: {
          ...selectedLobby.playerData,
          [currPlayer.uid]: {
            ...selectedLobby.playerData[currPlayer.uid],
            problemsSolved: {
              ...selectedLobby.playerData[currPlayer.uid]?.problemsSolved,
              [problemID]: { difficulty: problem?.difficulty ?? '', runTime }
            },
          }
        }
      });
      window.location.href = `/lobbies/${lobbyID}/finished`
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
      updateLobby(lobbyID, {
        playerData: 
        {...selectedLobby?.playerData,
          [currPlayer?.uid]: 
          {...selectedLobby?.playerData[currPlayer?.uid],
            problemsSolved: 
            {...selectedLobby?.playerData[currPlayer?.uid]?.problemsSolved, [problemID]: { difficulty: problem?.difficulty ?? '', runTime }}
          }
        }
      });
    }
    // If all problems are finished, set problemsFinished to true
    const allProblemsFinished = Object.keys(selectedLobby?.playerData?.[currPlayer?.uid ?? '']?.problemsSolved || {}).length === selectedLobby?.problemIDs?.length;
    if(allProblemsFinished) {
      problemsFinished = true;
    }
  });

  // Handle problem loading and switching including loading the associated editor code for the new problem
  $effect(() => {
    if ($problems && problemID && problemLoaded== false) {
      problemLoaded = true;
      problem = $problems.find(p => p.id === problemID) || null;     
      if(problem) {
        testCases = problem.inputs.map((input, index) => ({
          input: input,
          output: problem.outputs[index],
          result: "",
          runtime: -1
        }));
      }
      // Load code for the current problem if it exists
      if (codeMap[lobbyID] && codeMap[lobbyID][problemID] !== undefined) {
        code = codeMap[lobbyID][problemID];
        console.log("Code is now " + code);
        editorComponent?.setValue(code);
      } else {
        code = "print('Hello World!')";
      }
    }
  });

  let unsubscribeProblems: (() => void) | null = null;

  onMount(() => {
    const unsubscribeLobbies = getLobbies();
    const unsubscribeProblems = getProblems();
    // Load code for the current problem if it exists
    if (problemID && codeMap[lobbyID] && codeMap[lobbyID][problemID] !== undefined) {
      code = codeMap[lobbyID][problemID];
      console.log("Stored Code Loaded");
    } else {
      code = "print('Hello World!')";
    }

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
    <Toaster />
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
          <p class="pb-4">{problem["description"]}</p>
          <h3 class="pb-8"><strong>Average Runtime:</strong> 
            {#if runTime != -1}
              {runTime} ms
            {/if}
            </h3>
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
                  <Button onclick={async () => { await submitCode(); calculateRuntime(); }}>Submit Solution</Button>
                  <Button onclick={() => {handleCodeSave(); showSaveSuccess();}}>Save Code</Button>
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
        <Button onclick={() => handleFinishProblemSet()}>Finish Problem Set</Button>
      </div>
    {/if}
    <div class="fixed flex justify-end items-end p-4 bottom-0 right-0">
      <Button onclick={() => exitLobby(lobbyID)}>Exit Lobby</Button>
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
      {#each ($problems ?? []).filter(p => selectedLobby?.problemIDs?.includes(p.id)) as p}
        <li class="flex justify-between items-center">
          <Button variant="link" class="text-blue-500 hover:underline p-0 m-0" onclick={() => handleProblemChange(p.id)}>{p.title}</Button>
          <!-- Check if problem is marked as complete in lobby playerData -->
          {#if currPlayer && selectedLobby?.playerData?.[currPlayer.uid]?.problemsSolved?.[p.id]}
            <span class="text-green-500">Complete</span>
          {:else}
            <span class="text-yellow-500">Incomplete</span>
          {/if}
        </li>
      {/each}
    </ul>
  </div>
{/if}