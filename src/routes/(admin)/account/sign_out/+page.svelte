<script lang="ts">
  import { goto } from "$app/navigation"
  import { onMount } from "svelte"

  let { data } = $props()

  let supabase = $derived(data.supabase)
  let message = $state("Cerrando sesión...")

  // on mount, sign out
  onMount(() => {
    supabase.auth.signOut().then(({ error }) => {
      if (error) {
        message = "Hubo un problema al cerrar sesión."
      } else {
        goto("/")
      }
    })
  })
</script>

<h1 class="text-2xl font-bold m-6 mx-auto my-auto">{message}</h1>
