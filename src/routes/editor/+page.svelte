<!-- Written by Nathan Kim -->
<script lang='ts'>
    import { Button } from '$lib/components/ui/button';
    // NOTE: Monaco editor module is not getting properly recognized 
    // import MonacoEditor from '$lib/components/MonacoEditor.svelte';
    let givenCode = "print('Hello World!')";
    let languageSelection: HTMLSelectElement;
    let sourceCodeTextarea: HTMLTextAreaElement;
    let outputTextarea: HTMLTextAreaElement;
    let inputTextarea: HTMLTextAreaElement;

    async function submitCode() {
        const submission = {
            source_code: sourceCodeTextarea.value,
            language_id: languageSelection.value,
            expected_output: outputTextarea.value,
            stdin: inputTextarea.value
        };

        const submit = await fetch('http://localhost:2358/submissions/?base64_encoded=false&wait=false', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(submission)
        });
        console.log(submission);
        const submissionToken = await submit.json();
        console.log("Submission Token:");
        console.log(submissionToken);
        let response;

        const intervalId = setInterval(async () => {
            const getResponse = await fetch("http://localhost:2358/submissions/"+submissionToken.token+"?base64_encoded=false", {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            response = await getResponse.json();
            console.log("Response:");
            console.log(response);
            console.log(response.status.description);

            if (response.status.description !== "In Queue" && response.status.description !== "Processing") {
                clearInterval(intervalId);
                if (response.status.description === "Accepted") {
                    alert("Correct!");
                }
                if (response.status.description === "Runtime Error (NZEC)") {
                    alert("Incorrect!\n" + response.stderr);
                }
                if (response.status.description === "Wrong Answer") {
                    alert("Incorrect!\n");
                }
            }
            return response;
        }, 1500);
    }
</script>

<style>
    .interface-container{
        margin: 20px;
    }
    .question{
        height: 200px;
        display: block;
        outline: 2px solid #000000;
    }
    textarea[name="sourceCode"]{
        outline: 2px solid #000000;
        display: block;
        margin-top: 10px;
        margin-bottom: 10px;
        width: 50%; /* Ensure the textarea fills its container */
        height: 200px;
    }
    .input-output-container {
        width: 50%;
        display: flex;
        gap: 20px; /* Add spacing between the input and output divs */
    }
    .input, .output {
        flex: 1; /* Make both divs take equal space */
    }
    textarea[name="inputText"], textarea[name="outputText"] {
        outline: 2px solid #000000;
        display: block;
        margin-top: 10px;
        margin-bottom: 10px;
        width: 100%; /* Ensure the textareas fill their containers */
    }
    label[for="language"]{
        margin-top:15px;
        display:inline-flex;
    }
    label[for="outputLabel"], label[for="inputLabel"]{
        margin-top:25px;
        display: flex;
    }
</style>

<h1 class="editor">Editor</h1>

<div class="interface-container">
<!-- Question text -->
<div class="question">
    <h2 class="title">Question Title</h2>
    <p>Question goes here</p>
</div>

<label for="language">Language:</label>
<select name="languageSelection" id="language" bind:this={languageSelection}>
  <option value="71">Python (3.8.1)</option>
  <option value="70">Python (2.7.17)</option>
  <option value="54">C++(GCC 9.2.0)</option>
  <option value="62">Java</option>
  <option value="63">Javascript</option>
  <option value="74">Typescript</option>
  <option value="45">Assembly (NASM 2.14.02)</option>
  <option value="68">PHP</option>
  <option value="72">Ruby</option>
  <option value="80">R</option>

</select>
<textarea name="sourceCode" bind:this={sourceCodeTextarea}>{givenCode}</textarea>
<div class="input-output-container">
    <div class="input">
        <label for="inputLabel">Input:</label>
        <textarea name="inputText" rows="5" cols="40" bind:this={inputTextarea}></textarea>
    </div>
    <div class ="output">
        <label for="outputLabel">Expected Output:</label>
        <textarea name="outputText" rows="5" cols="40" bind:this={outputTextarea}>Hello World!</textarea>
    </div>
</div>
<!--Maybe add an actual output textarea? -->
<Button class="bg-green-500 grow text-lg" on:click={submitCode}>Submit</Button>
</div>