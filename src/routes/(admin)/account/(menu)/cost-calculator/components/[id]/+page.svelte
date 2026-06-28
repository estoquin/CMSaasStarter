<script lang="ts">import { getContext } from "svelte"; import type { Writable } from "svelte/store"; import { enhance, applyAction } from "$app/forms"; import type { SubmitFunction } from "@sveltejs/kit"
let adminSection: Writable<string> = getContext("adminSection"); adminSection.set("cost-calculator")
let { data, form } = $props(); let item = $derived(data.item); let editing = $state(false); let loading = $state(false)
const handleSubmit: SubmitFunction = () => { loading = true; return async ({ update, result }) => { await update({ reset: false }); await applyAction(result); loading = false; editing = false } }
</script>
<svelte:head><title>{item.name} - Componentes</title></svelte:head>
<div class="mb-4"><a href="/account/cost-calculator/components" class="link link-neutral text-sm">&larr; Volver</a></div>

<div class="card bg-base-200 p-6 max-w-xl mb-6">
  {#if editing}
    <div class="flex justify-between items-center mb-4"><h2 class="text-lg font-semibold">Editar Componente</h2><button class="btn btn-ghost btn-xs" onclick={() => editing = false}>✕</button></div>
    <form method="POST" action="?/update" use:enhance={handleSubmit}>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="sm:col-span-2"><label class="label" for="name"><span class="label-text">Nombre *</span></label><input id="name" name="name" type="text" class="input input-bordered w-full" value={form?.name ?? item.name} required />{#if form?.errorMessage}<p class="text-red-500 text-sm mt-1">{form.errorMessage}</p>{/if}</div>
        <div><label class="label" for="unit"><span class="label-text">Unidad *</span></label><input id="unit" name="unit" type="text" class="input input-bordered w-full" value={form?.unit ?? item.unit} required /></div>
        <div><label class="label" for="ingredient_id"><span class="label-text">Ingrediente *</span></label>
          <select id="ingredient_id" name="ingredient_id" class="select select-bordered w-full" required>
            <option value="">Seleccionar…</option>
            {#each data.ingredients as ing}<option value={ing.id} selected={item.ingredient_id === ing.id}>{ing.name} ({ing.unit})</option>{/each}
          </select>
        </div>
        <div><label class="label" for="ingredient_qty_used"><span class="label-text">Cantidad usada *</span></label><input id="ingredient_qty_used" name="ingredient_qty_used" type="number" step="0.01" class="input input-bordered w-full" value={form?.ingredient_qty_used ?? item.ingredient_qty_used} required /></div>
        <div><label class="label" for="yield_per_batch"><span class="label-text">Rendimiento por lote *</span></label><input id="yield_per_batch" name="yield_per_batch" type="number" class="input input-bordered w-full" value={form?.yield_per_batch ?? item.yield_per_batch} required /></div>
      </div>
      <div class="mt-4 flex gap-2"><button type="submit" class="btn btn-primary" disabled={loading}>{#if loading}<span class="loading loading-spinner"></span>{/if}Guardar</button><button type="button" class="btn btn-ghost" onclick={() => editing = false}>Cancelar</button></div>
    </form>
  {:else}
    <div class="flex justify-between items-start mb-4">
      <div><h1 class="text-2xl font-bold">{item.name}</h1><span class="text-sm text-base-content/60">{item.unit}</span></div>
      <div class="flex gap-2"><button class="btn btn-outline btn-sm" onclick={() => editing = true}>Editar</button><form method="POST" action="?/delete" use:enhance><button class="btn btn-outline btn-error btn-sm" onclick={() => confirm("¿Eliminar?")}>Eliminar</button></form></div>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mb-4">
      <div><span class="text-base-content/60 block text-xs uppercase tracking-wide">Ingrediente</span><span>{item.ingredients?.name ?? "—"}</span></div>
      <div><span class="text-base-content/60 block text-xs uppercase tracking-wide">Unidad del ingrediente</span><span>{item.ingredients?.unit ?? "—"}</span></div>
      <div><span class="text-base-content/60 block text-xs uppercase tracking-wide">Cantidad usada por lote</span><span>{Number(item.ingredient_qty_used).toFixed(2)}</span></div>
      <div><span class="text-base-content/60 block text-xs uppercase tracking-wide">Rendimiento por lote</span><span>{item.yield_per_batch} uds.</span></div>
    </div>
    <div class="p-3 border border-gray-300 bg-base-100">
      <span class="text-base-content/60 block text-xs uppercase tracking-wide">Costo por unidad de componente</span>
      <span class="text-2xl font-bold font-mono">${Number(data.componentUnitCost).toFixed(2)}</span>
      <span class="block text-xs text-base-content/40">Basado en: ${Number(data.latestIngredientPrice?.unit_cost ?? 0).toFixed(4)}/{item.ingredients?.unit ?? ""} × {Number(item.ingredient_qty_used).toFixed(2)} ÷ {item.yield_per_batch}</span>
    </div>
  {/if}
</div>
