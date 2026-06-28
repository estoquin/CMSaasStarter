<script lang="ts">import { getContext } from "svelte"; import type { Writable } from "svelte/store"; import { enhance } from "$app/forms"; import type { SubmitFunction } from "@sveltejs/kit"
let adminSection: Writable<string> = getContext("adminSection"); adminSection.set("cost-calculator")
let { data, form } = $props(); let showForm = $state(false); let loading = $state(false)
function openNew() { showForm = true }; function closeForm() { showForm = false }
const handleSubmit: SubmitFunction = () => { loading = true; return async ({ update }) => { await update({ reset: false }); loading = false; showForm = false } }
let selIngQty = $state(0); let selYield = $state(0); let calcCost = $derived(selIngQty > 0 && selYield > 0 ? 0 : 0)
</script>
<svelte:head><title>Componentes</title></svelte:head>

<div class="flex justify-between items-center mb-4 p-3 border border-gray-300"><h1 class="text-2xl font-bold">Componentes</h1><button class="btn btn-primary btn-sm" onclick={openNew}>+ Nuevo Componente</button></div>

{#if showForm}
<div class="card bg-base-200 p-6 mb-6 max-w-xl">
  <div class="flex justify-between items-center mb-4"><h2 class="text-lg font-semibold">Nuevo Componente</h2><button class="btn btn-ghost btn-xs" onclick={closeForm}>✕</button></div>
  <form method="POST" action="?/create" use:enhance={handleSubmit}>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div class="sm:col-span-2"><label class="label" for="name"><span class="label-text">Nombre *</span></label><input id="name" name="name" type="text" class="input input-bordered w-full" value={form?.name ?? ""} required />{#if form?.errorMessage}<p class="text-red-500 text-sm mt-1">{form.errorMessage}</p>{/if}</div>
      <div><label class="label" for="unit"><span class="label-text">Unidad *</span></label><input id="unit" name="unit" type="text" class="input input-bordered w-full" value={form?.unit ?? ""} required placeholder="ej. unidades, gramos" /></div>
      <div><label class="label" for="ingredient_id"><span class="label-text">Ingrediente *</span></label>
        <select id="ingredient_id" name="ingredient_id" class="select select-bordered w-full" required>
          <option value="">Seleccionar…</option>
          {#each data.ingredients as ing}<option value={ing.id}>{ing.name} ({ing.unit})</option>{/each}
        </select>
      </div>
      <div><label class="label" for="ingredient_qty_used"><span class="label-text">Cantidad usada *</span></label><input id="ingredient_qty_used" name="ingredient_qty_used" type="number" step="0.01" class="input input-bordered w-full" value={form?.ingredient_qty_used ?? ""} required oninput={e => selIngQty = parseFloat(e.target.value) || 0} /></div>
      <div><label class="label" for="yield_per_batch"><span class="label-text">Rendimiento por lote *</span></label><input id="yield_per_batch" name="yield_per_batch" type="number" class="input input-bordered w-full" value={form?.yield_per_batch ?? ""} required oninput={e => selYield = parseInt(e.target.value) || 0} /></div>
    </div>
    <div class="mt-4 flex gap-2"><button type="submit" class="btn btn-primary" disabled={loading}>{#if loading}<span class="loading loading-spinner"></span>{/if}Crear</button><button type="button" class="btn btn-ghost" onclick={closeForm}>Cancelar</button></div>
  </form>
</div>
{/if}

<div class="overflow-x-auto border border-gray-300">
  {#if data.items.length === 0}<div class="alert bg-base-200 max-w-md m-4"><span>Aún no hay componentes.</span></div>
  {:else}
  <table class="table">
    <thead><tr><th>Nombre</th><th>Unidad</th><th>Ingrediente</th><th>Cantidad Usada</th><th>Rendimiento</th><th></th></tr></thead>
    <tbody>{#each data.items as item (item.id)}
      <tr><td><a href="/account/cost-calculator/components/{item.id}" class="link link-hover font-medium">{item.name}</a></td><td><span class="badge badge-sm">{item.unit}</span></td><td>{item.ingredients?.name ?? "—"}</td><td>{Number(item.ingredient_qty_used).toFixed(2)}</td><td>{item.yield_per_batch}</td>
        <td class="text-right"><form method="POST" action="?/delete" use:enhance><input type="hidden" name="id" value={item.id} /><button class="btn btn-outline btn-xs text-error" onclick={() => confirm("¿Eliminar?")}>Eliminar</button></form></td></tr>
    {/each}</tbody>
  </table>
  {/if}
</div>
