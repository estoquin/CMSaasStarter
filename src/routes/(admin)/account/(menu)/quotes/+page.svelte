<script lang="ts">import { getContext } from "svelte"; import type { Writable } from "svelte/store"; import { enhance } from "$app/forms"; import type { SubmitFunction } from "@sveltejs/kit"
let adminSection: Writable<string> = getContext("adminSection"); adminSection.set("quotes")
let { data, form } = $props(); let showForm = $state(false); let loading = $state(false)
function openNew() { showForm = true }; function closeForm() { showForm = false }
const handleSubmit: SubmitFunction = () => { loading = true; return async ({ update }) => { await update({ reset: false }); loading = false; showForm = false } }
const statuses = ["draft","sent","accepted","rejected"]
const statusLabels: Record<string, string> = { draft: "Borrador", sent: "Enviado", accepted: "Aceptado", rejected: "Rechazado" }
</script>
<svelte:head><title>Cotizaciones</title></svelte:head>

<div class="flex justify-between items-center mb-4 p-3 border border-gray-300"><h1 class="text-2xl font-bold">Cotizaciones</h1><button class="btn btn-primary btn-sm" onclick={openNew}>+ Nueva Cotización</button></div>

{#if showForm}
<div class="card bg-base-200 p-6 mb-6 max-w-xl">
  <div class="flex justify-between items-center mb-4"><h2 class="text-lg font-semibold">Nueva Cotización</h2><button class="btn btn-ghost btn-xs" onclick={closeForm}>✕</button></div>
  <form method="POST" action="?/create" use:enhance={handleSubmit}>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div class="sm:col-span-2"><label class="label" for="name"><span class="label-text">Nombre *</span></label><input id="name" name="name" type="text" class="input input-bordered w-full" value={form?.name ?? ""} required />{#if form?.errorMessage}<p class="text-red-500 text-sm mt-1">{form.errorMessage}</p>{/if}</div>
      <div><label class="label" for="account_id"><span class="label-text">Account ID</span></label><input id="account_id" name="account_id" type="text" class="input input-bordered w-full" value={form?.account_id ?? ""} /></div>
      <div><label class="label" for="opportunity_id"><span class="label-text">Opportunity ID</span></label><input id="opportunity_id" name="opportunity_id" type="text" class="input input-bordered w-full" value={form?.opportunity_id ?? ""} /></div>
      <div><label class="label" for="total"><span class="label-text">Total</span></label><input id="total" name="total" type="number" step="0.01" class="input input-bordered w-full" value={form?.total ?? ""} /></div>
      <div><label class="label" for="status"><span class="label-text">Estado</span></label><select id="status" name="status" class="select select-bordered w-full"><option value="">Seleccionar estado</option>{#each statuses as s}<option value={s}>{statusLabels[s]}</option>{/each}</select></div>
      <div><label class="label" for="valid_until"><span class="label-text">Válido Hasta</span></label><input id="valid_until" name="valid_until" type="date" class="input input-bordered w-full" value={form?.valid_until ?? ""} /></div>
      <div class="sm:col-span-2"><label class="label" for="notes"><span class="label-text">Notes</span></label><textarea id="notes" name="notes" class="textarea textarea-bordered w-full" rows="3">{form?.notes ?? ""}</textarea></div>
    </div>
    <div class="mt-4 flex gap-2"><button type="submit" class="btn btn-primary" disabled={loading}>{#if loading}<span class="loading loading-spinner"></span>{/if}Crear</button><button type="button" class="btn btn-ghost" onclick={closeForm}>Cancelar</button></div>
  </form>
</div>
{/if}

<div class="overflow-x-auto border border-gray-300">
  {#if data.items.length === 0}<div class="alert bg-base-200 max-w-md mt-4"><span>Aún no hay cotizaciones.</span></div>
  {:else}
  <table class="table">
    <thead><tr><th>Nombre</th><th class="hidden sm:table-cell">Total</th><th class="hidden md:table-cell">Estado</th><th>Válido Hasta</th><th></th></tr></thead>
    <tbody>{#each data.items as item (item.id)}
      <tr><td><a href="/account/quotes/{item.id}" class="link link-hover font-medium">{item.name}</a></td><td class="hidden sm:table-cell">${Number(item.total).toFixed(2)}</td><td class="hidden md:table-cell"><span class="badge badge-sm">{statusLabels[item.status] ?? item.status}</span></td><td>{item.valid_until ?? "—"}</td>
        <td class="text-right"><form method="POST" action="?/delete" use:enhance><input type="hidden" name="id" value={item.id} /><button class="btn btn-outline btn-xs text-error" onclick={() => confirm("¿Eliminar?")}>Eliminar</button></form></td></tr>
    {/each}</tbody>
  </table>
  {/if}
</div>
