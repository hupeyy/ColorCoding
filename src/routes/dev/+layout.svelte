<script>
	import Header from '$lib/components/Header.svelte';
  import { ModeWatcher } from 'mode-watcher';
  let { children } = $props();

</script>

<Header />
<ModeWatcher />
{@render children()}
