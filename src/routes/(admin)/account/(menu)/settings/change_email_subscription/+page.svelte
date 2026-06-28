<script lang="ts">
  import SettingsModule from "../settings_module.svelte"
  let { data } = $props()
  let profile = $derived(data.profile)
  let unsubscribed = $derived(profile?.unsubscribed)
</script>

<svelte:head>
  <title>Cambiar Suscripción de Correo</title>
</svelte:head>

<h1 class="text-2xl font-bold mb-6">Suscripción de Correo</h1>

<SettingsModule
  editable={true}
  title="Suscripción"
  message={unsubscribed
    ? "Actualmente no estás suscrito a los correos"
    : "Actualmente estás suscrito a los correos"}
  saveButtonTitle={unsubscribed ? "Re-suscribir" : "Cancelar Suscripción"}
  successBody={unsubscribed
    ? "Has sido re-suscrito a los correos"
    : "Has sido cancelado de la suscripción de correos"}
  formTarget="/account/api?/toggleEmailSubscription"
  fields={[]}
/>
