<script lang="ts">import { getContext } from "svelte"; import type { Writable } from "svelte/store"; import { enhance, applyAction } from "$app/forms"; import type { SubmitFunction } from "@sveltejs/kit"
let adminSection: Writable<string> = getContext("adminSection"); adminSection.set("cost-calculator")
let { data, form } = $props(); let item = $derived(data.item); let editing = $state(false); let loading = $state(false)
const handleSubmit: SubmitFunction = () => { loading = true; return async ({ update, result }) => { await update({ reset: false }); await applyAction(result); loading = false; editing = false } }
</script>
<svelte:head><title>{item.name} - Ingredientes</title></svelte:head>
<div class="mb-4"><a href="/account/cost-calculator/ingredients" class="link link-neutral text-sm">&larr; Volver</a></div>

<div class="card bg-base-200 p-6 max-w-xl mb-6">
  {#if editing}
    <div class="flex justify-between items-center mb-4"><h2 class="text-lg font-semibold">Editar Ingrediente</h2><button class="btn btn-ghost btn-xs" onclick={() => editing = false}>✕</button></div>
    <form method="POST" action="?/update" use:enhance={handleSubmit}>
      <div class="grid grid-cols-1 gap-4">
        <div><label class="label" for="name"><span class="label-text">Nombre *</span></label><input id="name" name="name" type="text" class="input input-bordered w-full" value={form?.values?.name ?? item.name} required />{#if form?.errorMessage}<p class="text-red-500 text-sm mt-1">{form.errorMessage}</p>{/if}</div>
        <div><label class="label" for="unit"><span class="label-text">Unidad *</span></label><input id="unit" name="unit" type="text" class="input input-bordered w-full" value={form?.values?.unit ?? item.unit} required /></div>
      </div>
      <div class="mt-4 flex gap-2"><button type="submit" class="btn btn-primary" disabled={loading}>{#if loading}<span class="loading loading-spinner"></span>{/if}Guardar</button><button type="button" class="btn btn-ghost" onclick={() => editing = false}>Cancelar</button></div>
    </form>
  {:else}
    <div class="flex justify-between items-start mb-4">
      <div><h1 class="text-2xl font-bold">{item.name}</h1><span class="text-sm text-base-content/60">{item.unit}</span></div>
      <div class="flex gap-2"><button class="btn btn-outline btn-sm" onclick={() => editing = true}>Editar</button><form method="POST" action="?/delete" use:enhance><button class="btn btn-outline btn-error btn-sm" onclick={() => confirm("¿Eliminar?")}>Eliminar</button></form></div>
    </div>
    {#if data.latestPrice}
      <div class="p-3 border border-gray-300 bg-base-100"><span class="text-base-content/60 block text-xs uppercase tracking-wide">Último Costo Unitario</span><span class="text-xl font-bold font-mono">${Number(data.latestPrice.unit_cost).toFixed(4)}</span><span class="text-sm text-base-content/60 ml-2">por {item.unit}</span><span class="block text-xs text-base-content/40">desde {data.latestPrice.date}</span></div>
    {:else}
      <div class="p-3 border border-gray-300 bg-base-100"><span class="text-base-content/60 block text-xs uppercase tracking-wide">Último Costo Unitario</span><span class="text-base-content/40">Sin compras aún</span></div>
    {/if}
  {/if}
</div>

<h2 class="text-lg font-semibold mb-3">Historial de Compras</h2>
<div class="overflow-x-auto border border-gray-300">
  {#if data.purchases.length === 0}<div class="alert bg-base-200 max-w-md m-4"><span>No hay compras registradas para este ingrediente.</span></div>
  {:else}
  <table class="table">
    <thead><tr><th>Fecha</th><th>Cantidad ({item.unit})</th><th>Total Pagado</th><th>Costo Unitario</th></tr></thead>
    <tbody>{#each data.purchases as p (p.id)}
      <tr><td>{p.date}</td><td>{Number(p.quantity_bought).toFixed(2)}</td><td>${Number(p.total_paid).toFixed(2)}</td><td class="font-mono">${Number(p.unit_cost).toFixed(4)}</td></tr>
    {/each}</tbody>
  </table>
  {/if}
</div>
