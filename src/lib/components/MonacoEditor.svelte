<script>
	// Source Code:
  // 'With love, Sony AK <sony@sony-ak.com> GitHub https://github.com/sonyarianto'
	import { onMount } from 'svelte';
	// let {
	// 	code = $bindable(),
	// 	language = $bindable()
  	// } = $props()
	export let code = "";
	export let lang = "python"; // default to 'python'
	let editorInstance;
	
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
        editorInstance = monaco.editor.create(document.getElementById('editor'), {
          value: code,
          language: lang,
          automaticLayout: true,
          padding: { top: 5, right: 5, bottom: 5, left: 5 },
          overviewRulerLanes: 0,
          overviewRulerBorder: false,
          theme: 'vs-dark',
        });

				// Add event listener for value changes
	      editorInstance.onDidChangeModelContent(() => {
	        const updatedSourceCode = editorInstance.getValue();
	      });
				// Monaco Editor also have several others interesting events to explore such as
				// onDidChangeCursorPosition, onDidChangeCursorSelection, onDidFocusEditor, onDidBlurEditor,
				// onKeyDown, onKeyUp, onMouseDown, onMouseUp, onDidChangeModelLanguage, onDidChangeModel,
				// onDidDisposeModel
      });
		});
	});
	
	// Reactive statement to update the editor's language when `lang` changes
	$: if (editorInstance && lang) {
        const model = editorInstance.getModel();
        if (model) {
            monaco.editor.setModelLanguage(model, lang);
        }
    }

	export function getValue() {
        return editorInstance?.getValue();
    }


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
