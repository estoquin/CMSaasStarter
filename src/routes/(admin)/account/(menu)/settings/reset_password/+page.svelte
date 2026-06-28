<script lang="ts">
  import { getContext } from "svelte"
  import type { Writable } from "svelte/store"
  import SettingsModule from "../settings_module.svelte"

  let adminSection: Writable<string> = getContext("adminSection")
  adminSection.set("settings")
</script>

<svelte:head>
  <title>Restablecer Contraseña</title>
</svelte:head>

<h1 class="text-2xl font-bold mb-6">Configuración</h1>

<SettingsModule
  title="Restablecer Contraseña"
  editable={true}
  saveButtonTitle="Restablecer Contraseña"
  successTitle="Contraseña Cambiada"
  successBody="En el próximo inicio de sesión, usa tu nueva contraseña."
  formTarget="/account/api?/updatePassword"
  fields={[
    {
      id: "newPassword1",
        label: "Nueva Contraseña",
      initialValue: "",
      inputType: "password",
    },
    {
      id: "newPassword2",
        label: "Confirmar Nueva Contraseña",
      initialValue: "",
      inputType: "password",
    },
  ]}
/>
