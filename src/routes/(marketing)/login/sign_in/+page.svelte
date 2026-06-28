<script lang="ts">
  import { Auth } from "@supabase/auth-ui-svelte"
  import { sharedAppearance, oauthProviders } from "../login_config"
  import { goto } from "$app/navigation"
  import { onMount } from "svelte"
  import { page } from "$app/stores"

  let { data } = $props()
  let supabase = $derived(data.supabase)

  onMount(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      // Redirect to account after successful login
      if (event == "SIGNED_IN") {
        // Delay needed because order of callback not guaranteed.
        // Give the layout callback priority to update state or
        // we'll just bounch back to login when /account tries to load
        setTimeout(() => {
          goto("/account")
        }, 1)
      }
    })

    return () => data.subscription.unsubscribe()
  })
</script>

<svelte:head>
  <title>Iniciar Sesión</title>
</svelte:head>

{#if $page.url.searchParams.get("verified") == "true"}
  <div role="alert" class="alert alert-success mb-5">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="stroke-current shrink-0 h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      ><path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      /></svg
    >
    <span>¡Correo verificado! Por favor inicia sesión.</span>
  </div>
{/if}
<h1 class="text-2xl font-bold mb-6">Iniciar Sesión</h1>
<Auth
  supabaseClient={data.supabase}
  view="sign_in"
  redirectTo={`${data.url}/auth/callback`}
  providers={oauthProviders}
  socialLayout="horizontal"
  showLinks={false}
  appearance={sharedAppearance}
  additionalData={undefined}
/>
<div class="text-l text-slate-800 mt-4">
  <a class="underline" href="/login/forgot_password">¿Olvidaste tu contraseña?</a>
</div>
<div class="text-l text-slate-800 mt-3">
  ¿No tienes una cuenta? <a class="underline" href="/login/sign_up">Regístrate</a>.
</div>
