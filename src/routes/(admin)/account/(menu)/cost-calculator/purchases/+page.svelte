<script lang="ts">import { getContext } from "svelte"; import type { Writable } from "svelte/store"; import { enhance } from "$app/forms"; import type { SubmitFunction } from "@sveltejs/kit"
let adminSection: Writable<string> = getContext("adminSection"); adminSection.set("cost-calculator")
let { data, form } = $props(); let showForm = $state(false); let loading = $state(false)
function openNew() { showForm = true }; function closeForm() { showForm = false }
const handleSubmit: SubmitFunction = () => { loading = true; return async ({ update }) => { await update({ reset: false }); loading = false; showForm = false } }
let calcQty = $state(0); let calcTotal = $state(0); let calcUnit = $derived(calcQty > 0 ? calcTotal / calcQty : 0)
</script>
<svelte:head><title>Compras</title></svelte:head>

<div class="flex justify-between items-center mb-4 p-3 border border-gray-300"><h1 class="text-2xl font-bold">Compras</h1><button class="btn btn-primary btn-sm" onclick={openNew}>+ Registrar Compra</button></div>

{#if showForm}
<div class="card bg-base-200 p-6 mb-6 max-w-md">
  <div class="flex justify-between items-center mb-4"><h2 class="text-lg font-semibold">Registrar Compra</h2><button class="btn btn-ghost btn-xs" onclick={closeForm}>✕</button></div>
  <form method="POST" action="?/create" use:enhance={handleSubmit}>
    <div class="grid grid-cols-1 gap-4">
      <div><label class="label" for="ingredient_id"><span class="label-text">Ingrediente *</span></label>
        <select id="ingredient_id" name="ingredient_id" class="select select-bordered w-full" required>
          <option value="">Seleccionar ingrediente…</option>
          {#each data.ingredients as ing}<option value={ing.id}>{ing.name} ({ing.unit})</option>{/each}
        </select>
        {#if form?.errorMessage && !form?.ingredient_id}<p class="text-red-500 text-sm mt-1">{form.errorMessage}</p>{/if}
      </div>
      <div><label class="label" for="date"><span class="label-text">Fecha</span></label><input id="date" name="date" type="date" class="input input-bordered w-full" value={form?.date ?? new Date().toISOString().slice(0,10)} /></div>
      <div><label class="label" for="quantity_bought"><span class="label-text">Cantidad Comprada *</span></label><input id="quantity_bought" name="quantity_bought" type="number" step="0.01" class="input input-bordered w-full" value={form?.quantity_bought ?? ""} required oninput={e => calcQty = parseFloat(e.target.value) || 0} /></div>
      <div><label class="label" for="total_paid"><span class="label-text">Total Pagado ($) *</span></label><input id="total_paid" name="total_paid" type="number" step="0.01" class="input input-bordered w-full" value={form?.total_paid ?? ""} required oninput={e => calcTotal = parseFloat(e.target.value) || 0} /></div>
      <div class="p-3 bg-base-100 border border-gray-300 text-sm"><span class="text-base-content/60">Costo unitario: </span><span class="font-mono font-bold">${calcUnit.toFixed(4)}</span></div>
    </div>
    <div class="mt-4 flex gap-2"><button type="submit" class="btn btn-primary" disabled={loading}>{#if loading}<span class="loading loading-spinner"></span>{/if}Registrar</button><button type="button" class="btn btn-ghost" onclick={closeForm}>Cancelar</button></div>
  </form>
</div>
{/if}

<div class="overflow-x-auto border border-gray-300">
  {#if data.items.length === 0}<div class="alert bg-base-200 max-w-md m-4"><span>Aún no hay compras.</span></div>
  {:else}
  <table class="table">
    <thead><tr><th>Fecha</th><th>Ingrediente</th><th>Cant.</th><th>Total Pagado</th><th>Costo Unitario</th></tr></thead>
    <tbody>{#each data.items as item (item.id)}
      <tr><td>{item.date}</td><td>{item.ingredients?.name ?? "—"}</td><td>{Number(item.quantity_bought).toFixed(2)} {item.ingredients?.unit ?? ""}</td><td>${Number(item.total_paid).toFixed(2)}</td><td class="font-mono">${Number(item.unit_cost).toFixed(4)}</td></tr>
    {/each}</tbody>
  </table>
  {/if}
</div>
