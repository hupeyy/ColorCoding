<script>
	// Source Code:
  // 'With love, Sony AK <sony@sony-ak.com> GitHub https://github.com/sonyarianto'
	import { onMount } from 'svelte';

	let {
    code = $bindable(),
    language = $bindable()
  } = $props()
	
	onMount(() => {
		let scriptElement = document.createElement("script");
		scriptElement.setAttribute("src", "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.40.0/min/vs/loader.min.js");
		document.body.appendChild(scriptElement);

		scriptElement.addEventListener("load", () => {
			require.config({
        paths: {
          vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.40.0/min/vs',
        },
	    });

			require(['vs/editor/editor.main'], () => {
        let editorInstance = monaco.editor.create(document.getElementById('editor'), {
          value: code,
          language: language,
          automaticLayout: true,
          padding: { top: 5, right: 5, bottom: 5, left: 5 },
          overviewRulerLanes: 0,
          overviewRulerBorder: false,
          theme: 'vs-dark',
        });

				// Add event listener for value changes
	      editorInstance.onDidChangeModelContent(() => {
	        const updatedSourceCode = editorInstance.getValue();
	        console.log({updatedSourceCode});
	      });
				// Monaco Editor also have several others interesting events to explore such as
				// onDidChangeCursorPosition, onDidChangeCursorSelection, onDidFocusEditor, onDidBlurEditor,
				// onKeyDown, onKeyUp, onMouseDown, onMouseUp, onDidChangeModelLanguage, onDidChangeModel,
				// onDidDisposeModel
      });
		});
	});


</script>

<div id="editor"></div>
	
<style>
	:global(body) {
		margin: 0;
	}
	#editor {
		width: 100%;
		height: 100%;
	}
</style>
