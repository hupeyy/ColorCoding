<script>
    import Input from "$lib/components/ui/input/input.svelte";
    import Button from "$lib/components/ui/button/button.svelte";
    import * as Card from "$lib/components/ui/card";

    let password = $state("");
    let login = $state(false);

    const handleLogin = () => {
        if (password === "password") {
            login = true;
        } else {
            alert("Incorrect password. Please try again.");
        }
    };
</script>

<div class="flex flex-col items-center justify-center h-screen gap-4 p-4">
    <Card.Root>
    <Card.Header>
        <Card.Title>Dev Login</Card.Title>
    </Card.Header>
        <Card.Content>
            <div class="flex flex-col items-left gap-4 p-4">
                {#if login}
                    <div class="mt-4">
                        <h2 class="text-2xl">Welcome, Developer!</h2>
                        <p class="mt-2">You have successfully logged in.</p>
                    </div>
                    <Button class="mt-4" on:click={() => (window.location.href = "/dev/create-problems")}>
                        Create Problems
                    </Button> 
                {:else}
                    <h1 class="text-3xl font-bold mb-4">Login</h1>
                    <Input type="text" placeholder="Password" bind:value={password} class="w-128 border p-2 rounded" required />
                    <Button on:click={handleLogin} class="bg-blue-500 text-white p-2 rounded">Login</Button>
                {/if}
            </div>
        </Card.Content>
    </Card.Root>
</div>