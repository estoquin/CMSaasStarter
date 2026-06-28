<script lang="ts">
  import { Auth } from "@supabase/auth-ui-svelte"
  import { sharedAppearance, oauthProviders } from "../login_config"

  let { data } = $props()
</script>

<svelte:head>
  <title>Olvidé mi Contraseña</title>
</svelte:head>

<h1 class="text-2xl font-bold mb-6">Olvidé mi Contraseña</h1>
<Auth
  supabaseClient={data.supabase}
  view="forgotten_password"
  redirectTo={`${data.url}/auth/callback?next=%2Faccount%2Fsettings%2Freset_password`}
  providers={oauthProviders}
  socialLayout="horizontal"
  showLinks={false}
  appearance={sharedAppearance}
  additionalData={undefined}
/>
<div class="text-l text-slate-800 mt-4">
  ¿Recuerdas tu contraseña? <a class="underline" href="/login/sign_in">Inicia sesión</a
  >.
</div>
