<script lang="ts">
  import { getContext } from "svelte"
  import type { Writable } from "svelte/store"
  import { appVisibility } from "$lib/stores/appVisibility"

  let adminSection: Writable<string> = getContext("adminSection")
  adminSection.set("super-admin")
</script>

<svelte:head><title>Super Admin</title></svelte:head>

<h1 class="text-lg font-bold mb-6">Super Admin</h1>

<div class="card p-5 pb-6 max-w-md border border-gray-300">
  <div class="text-sm font-bold mb-3">Visibilidad de Aplicaciones</div>
  <p class="text-xs text-base-content/60 mb-4">Selecciona qué aplicaciones se muestran en el panel lateral.</p>
  {#each [{ id: "crm", label: "CRM" }, { id: "erp", label: "ERP" }, { id: "costCalculator", label: "Cost Calculator" }, { id: "service", label: "Service" }, { id: "habits", label: "Hábitos" }] as app}
    <label class="flex items-center gap-3 py-2 cursor-pointer">
      <input type="checkbox" bind:checked={$appVisibility[app.id as keyof typeof $appVisibility]} class="checkbox checkbox-primary" />
      <span class="text-sm font-medium">{app.label}</span>
    </label>
  {/each}
</div>
