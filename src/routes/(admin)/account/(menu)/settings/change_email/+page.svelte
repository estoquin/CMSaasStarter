<script lang="ts">
  import { getContext } from "svelte"
  import type { Writable } from "svelte/store"
  import SettingsModule from "../settings_module.svelte"

  let adminSection: Writable<string> = getContext("adminSection")
  adminSection.set("settings")

  let { data } = $props()

  let user = $derived(data.user)
</script>

<svelte:head>
  <title>Cambiar Correo Electrónico</title>
</svelte:head>

<h1 class="text-2xl font-bold mb-6">Configuración</h1>

<SettingsModule
  title="Cambiar Correo Electrónico"
  editable={true}
  successTitle="Cambio de correo iniciado"
  successBody="Deberías recibir correos tanto en la dirección anterior como en la nueva para confirmar el cambio. Haz clic en el enlace de ambos correos para finalizar el cambio. Hasta que se finalice, debes iniciar sesión con tu correo actual."
  formTarget="/account/api?/updateEmail"
  fields={[
    {
      id: "email",
      label: "Correo Electrónico",
      initialValue: user?.email ?? "",
      placeholder: "Dirección de correo electrónico",
    },
  ]}
/>
