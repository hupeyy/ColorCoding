<script lang="ts">
  import { onMount, afterUpdate } from 'svelte';
  import loader from '@monaco-editor/loader';
  
  let editorContainer: HTMLElement;
  let editor: any;
  let monaco: any;
  
  export let code = '// Write your code here';
  export let language = 'javascript';
  
  onMount(() => {
    loader.init().then((monacoInstance) => {
      monaco = monacoInstance;
      
      editor = monaco.editor.create(editorContainer, {
        value: code,
        language: language,
        theme: 'vs-dark',
        automaticLayout: true
      });
    });

    return () => {
      if (editor) {
        editor.dispose();
      }
    };
  });
  
  afterUpdate(() => {
    if (editor && monaco) {
      monaco.editor.setModelLanguage(editor.getModel(), language);
      editor.setValue(code);
    }
  });
  
  export function getCode() {
    return editor ? editor.getValue() : code;
  }
</script>
  
  <div bind:this={editorContainer} style="width: 100%; height:100%"></div>