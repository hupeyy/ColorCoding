<script lang="ts">
    import type { PageData } from './$types';
    import MonacoEditor from '$lib/components/MonacoEditor.svelte';
    
    export let data: PageData;
    const { problem } = data;
    
    let code = problem.starterCode || '// Write your solution here';
    let selectedLanguage = 'javascript';
    let editorComponent: MonacoEditor;
    
    const languages = [
      { value: 'javascript', label: 'JavaScript' },
      { value: 'python', label: 'Python' },
      { value: 'java', label: 'Java' },
      { value: 'cpp', label: 'C++' }
    ];
    
    function handleLanguageChange(event) {
      selectedLanguage = event.target.value;
      // You might want to update the starter code based on the selected language
      code = getStarterCodeForLanguage(selectedLanguage);
    }
    
    function getStarterCodeForLanguage(lang) {
      // Implement this function to return appropriate starter code for each language
      switch(lang) {
        case 'python':
          return '# Write your Python solution here';
        case 'java':
          return 'public class Solution {\n    // Write your Java solution here\n}';
        case 'cpp':
          return '#include <iostream>\n\nusing namespace std;\n\n int main() {\n    // Write your C++ solution here\n    return 0;\n}';
        default:
          return '// Write your JavaScript solution here';
      }
    }
    
    function handleSubmit() {
      const submittedCode = editorComponent.getCode();
      console.log('Submitted code:', submittedCode);
      console.log('Language:', selectedLanguage);
      // Here you would typically send the code and language to your backend for evaluation
    }
    </script>
    
    <h1>{problem.title}</h1>
    <p>{problem.description}</p>
    
    <div>
      <label for="language-select">Select Language:</label>
      <select id="language-select" on:change={handleLanguageChange}>
        {#each languages as lang}
          <option value={lang.value}>{lang.label}</option>
        {/each}
      </select>
    </div>
    
    <MonacoEditor bind:this={editorComponent} bind:code language={selectedLanguage} />
    
    <button on:click={handleSubmit}>Submit Solution</button>