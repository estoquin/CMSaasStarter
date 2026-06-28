<script lang="ts">
  import { getContext } from "svelte"
  import type { Writable } from "svelte/store"

  let adminSection: Writable<string> = getContext("adminSection")
  adminSection.set("service-team")

  let { data } = $props()
  let workload = $derived(data.workload)
</script>

<svelte:head><title>Equipo - Service</title></svelte:head>

<div class="flex justify-between items-center mb-4 p-3 border border-gray-300">
  <h1 class="text-2xl font-bold">Carga de Trabajo del Equipo</h1>
</div>

<div class="overflow-x-auto border border-gray-300">
  {#if workload.length === 0}
    <div class="alert bg-base-200 max-w-md mt-4">
      <span>No hay datos de equipo disponibles.</span>
    </div>
  {:else}
    <table class="table">
      <thead>
        <tr>
          <th>Agente</th>
          <th>Tickets Abiertos</th>
          <th>Minutos Registrados (este mes)</th>
        </tr>
      </thead>
      <tbody>
        {#each workload as w}
          <tr>
            <td class="font-medium">{w.agent_name ?? "—"}</td>
            <td>
              <span class="badge {w.open_tickets > 5 ? 'badge-warning' : w.open_tickets > 0 ? 'badge-info' : 'badge-ghost'} badge-sm">
                {w.open_tickets}
              </span>
            </td>
            <td class="font-mono">{w.minutes_logged_this_month} min</td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
</div>
