<script lang="ts">
  import SettingsModule from "../settings_module.svelte"
  import { getContext } from "svelte"
  import type { Writable } from "svelte/store"

  let adminSection: Writable<string> = getContext("adminSection")
  adminSection.set("settings")

  let { data } = $props()

  let profile = $derived(data.profile)
</script>

<svelte:head>
  <title>Editar Perfil</title>
</svelte:head>

<h1 class="text-2xl font-bold mb-6">Configuración</h1>

<SettingsModule
  editable={true}
  title="Editar Perfil"
  successTitle="Perfil Guardado"
  formTarget="/account/api?/updateProfile"
  fields={[
    {
      id: "fullName",
      label: "Nombre",
      initialValue: profile?.full_name ?? "",
      placeholder: "Tu nombre completo",
      maxlength: 50,
    },
    {
      id: "companyName",
      label: "Nombre de la Empresa",
      initialValue: profile?.company_name ?? "",
      maxlength: 50,
    },
    {
      id: "website",
      label: "Sitio Web",
      initialValue: profile?.website ?? "",
      maxlength: 50,
    },
  ]}
/>
