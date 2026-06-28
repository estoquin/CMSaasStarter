<script lang="ts">
  import { getContext } from "svelte"
  import type { Writable } from "svelte/store"
  import SettingsModule from "../settings_module.svelte"

  let adminSection: Writable<string> = getContext("adminSection")
  adminSection.set("settings")

  let { data } = $props()
  let session = $derived(data.session)
</script>

<svelte:head>
  <title>Eliminar Cuenta</title>
</svelte:head>

<h1 class="text-2xl font-bold mb-6">Configuración</h1>

<SettingsModule
  title="Eliminar Cuenta"
  editable={true}
  dangerous={true}
  message="Eliminar tu cuenta no se puede deshacer. Actualmente has iniciado sesión como '{session
    ?.user?.email}'"
  saveButtonTitle="Eliminar Cuenta"
  successTitle="Cuenta en cola para eliminación"
  successBody="Tu cuenta será eliminada en breve."
  formTarget="/account/api?/deleteAccount"
  fields={[
    {
      id: "currentPassword",
      label: "Contraseña Actual",
      initialValue: "",
      inputType: "password",
    },
  ]}
/>
