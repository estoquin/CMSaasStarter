<script lang="ts">
  import { getContext } from "svelte"
  import type { Writable } from "svelte/store"
  import { enhance } from "$app/forms"
  import type { SubmitFunction } from "@sveltejs/kit"

  let adminSection: Writable<string> = getContext("adminSection")
  adminSection.set("service-contracts")

  let { data, form } = $props()
  let contracts = $derived(data.contracts)
  let accounts = $derived(data.accounts)
  let slas = $derived(data.slas)

  let showForm = $state(false)
  let loading = $state(false)

  const handleSubmit: SubmitFunction = () => {
    loading = true
    return async ({ update }) => { await update({ reset: false }); loading = false; showForm = false }
  }
</script>

<svelte:head><title>Contratos - Service</title></svelte:head>

<div class="flex justify-between items-center mb-4 p-3 border border-gray-300">
  <h1 class="text-2xl font-bold">Contratos de Servicio</h1>
  <button class="btn btn-primary btn-sm" onclick={() => showForm = !showForm}>
    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
    Nuevo Contrato
  </button>
</div>

{#if showForm}
  <div class="card bg-base-200 p-6 mb-6 max-w-xl">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-lg font-semibold">Nuevo Contrato</h2>
      <button class="btn btn-ghost btn-xs" onclick={() => showForm = false}>✕</button>
    </div>
    <form method="POST" action="?/create" use:enhance={handleSubmit}>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="label" for="account_id"><span class="label-text">Cuenta *</span></label>
          <select id="account_id" name="account_id" class="select select-bordered w-full" required>
            <option value="">Seleccionar</option>
            {#each accounts as a}
              <option value={a.id}>{a.name}</option>
            {/each}
          </select>
        </div>
        <div>
          <label class="label" for="sla_id"><span class="label-text">SLA *</span></label>
          <select id="sla_id" name="sla_id" class="select select-bordered w-full" required>
            <option value="">Seleccionar</option>
            {#each slas as sla}
              <option value={sla.id}>{sla.name} ({sla.response_hours}h respuesta)</option>
            {/each}
          </select>
        </div>
        <div>
          <label class="label" for="start_date"><span class="label-text">Fecha Inicio *</span></label>
          <input id="start_date" name="start_date" type="date" class="input input-bordered w-full" required />
        </div>
        <div>
          <label class="label" for="end_date"><span class="label-text">Fecha Fin</span></label>
          <input id="end_date" name="end_date" type="date" class="input input-bordered w-full" />
        </div>
      </div>
      {#if form?.errorMessage}<p class="text-red-500 text-sm mt-1">{form.errorMessage}</p>{/if}
      <div class="mt-4 flex gap-2">
        <button type="submit" class="btn btn-primary" disabled={loading}>
          {#if loading}<span class="loading loading-spinner"></span>{/if}
          Crear Contrato
        </button>
        <button type="button" class="btn btn-ghost" onclick={() => showForm = false}>Cancelar</button>
      </div>
    </form>
  </div>
{/if}

<div class="overflow-x-auto border border-gray-300">
  {#if contracts.length === 0}
    <div class="alert bg-base-200 max-w-md mt-4">
      <span>No hay contratos todavía.</span>
    </div>
  {:else}
    <table class="table">
      <thead>
        <tr>
          <th>Cuenta</th>
          <th>SLA</th>
          <th class="hidden sm:table-cell">Respuesta</th>
          <th class="hidden sm:table-cell">Resolución</th>
          <th>Inicio</th>
          <th>Fin</th>
        </tr>
      </thead>
      <tbody>
        {#each contracts as c}
          <tr>
            <td class="font-medium">{c.account?.name ?? "—"}</td>
            <td>{c.sla?.name ?? "—"}</td>
            <td class="hidden sm:table-cell">{c.sla?.response_hours ?? "—"}h</td>
            <td class="hidden sm:table-cell">{c.sla?.resolution_hours ?? "—"}h</td>
            <td>{new Date(c.start_date).toLocaleDateString()}</td>
            <td>{c.end_date ? new Date(c.end_date).toLocaleDateString() : "—"}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
</div>
