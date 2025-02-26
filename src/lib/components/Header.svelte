<script lang='ts'>
    import Home from 'lucide-svelte/icons/home';
    import { Button } from '$lib/components/ui/button';
</script>
<div class="flex flex-row justify-end px-6 py-4">
<Button href="/">
    <div class="flex flex-row gap-2 text-center">
        <Home />
        Home
    </div>
</Button>
</div>
