<script lang="ts">import { getContext } from "svelte"; import type { Writable } from "svelte/store"; import { enhance, applyAction } from "$app/forms"; import type { SubmitFunction } from "@sveltejs/kit"
let adminSection: Writable<string> = getContext("adminSection"); adminSection.set("cost-calculator")
let { data, form } = $props(); let item = $derived(data.item); let editing = $state(false); let loading = $state(false); let addLine = $state(false); let addLoading = $state(false)
let imagePreview = $state<string | null>(null)
const handleSubmit: SubmitFunction = () => { loading = true; return async ({ update, result }) => { await update({ reset: false }); await applyAction(result); loading = false; editing = false; imagePreview = null } }
const handleAdd: SubmitFunction = () => { addLoading = true; return async ({ update, result }) => { await update({ reset: false }); await applyAction(result); addLoading = false; addLine = false } }
let addType = $state('ingredient')
let usedIngredientIds = $derived(data.recipe.filter(r => r.line_type === 'ingredient').map(r => r.ref_id))
let usedComponentIds = $derived(data.recipe.filter(r => r.line_type === 'component').map(r => r.ref_id))
let availableIngredients = $derived(data.allIngredients.filter(i => !usedIngredientIds.includes(i.id)))
let availableComponents = $derived(data.allComponents.filter(c => !usedComponentIds.includes(c.id)))
function onImagePick(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) { const reader = new FileReader(); reader.onload = () => imagePreview = reader.result as string; reader.readAsDataURL(file) } else { imagePreview = null }
}
</script>
<svelte:head><title>{item.name} - Productos del Menú</title></svelte:head>
<div class="mb-4"><a href="/account/cost-calculator/menu-items" class="link link-neutral text-sm">&larr; Volver</a></div>

<div class="card bg-base-200 p-6 max-w-xl mb-6">
  {#if editing}
    <div class="flex justify-between items-center mb-4"><h2 class="text-lg font-semibold">Editar Producto</h2><button class="btn btn-ghost btn-xs" onclick={() => editing = false}>✕</button></div>
    <form method="POST" action="?/update" use:enhance={handleSubmit} enctype="multipart/form-data">
      <div><label class="label" for="name"><span class="label-text">Nombre *</span></label><input id="name" name="name" type="text" class="input input-bordered w-full" value={form?.name ?? item.name} required />{#if form?.errorMessage}<p class="text-red-500 text-sm mt-1">{form.errorMessage}</p>{/if}</div>
      <div class="mt-3"><label class="label" for="image"><span class="label-text">Imagen</span></label><input id="image" name="image" type="file" accept="image/*" class="file-input file-input-bordered w-full" onchange={onImagePick} /></div>
      {#if imagePreview}<div class="mt-2"><img src={imagePreview} alt="preview" class="w-24 h-24 object-cover rounded" /></div>{/if}
      <div class="mt-4 flex gap-2"><button type="submit" class="btn btn-primary" disabled={loading}>{#if loading}<span class="loading loading-spinner"></span>{/if}Guardar</button><button type="button" class="btn btn-ghost" onclick={() => editing = false}>Cancelar</button></div>
    </form>
  {:else}
    <div class="flex justify-between items-start mb-4">
      <div class="flex gap-4 items-start">
        {#if item.image_url}<img src={item.image_url} alt={item.name} class="w-20 h-20 object-cover rounded" />{/if}
        <div><h1 class="text-2xl font-bold">{item.name}</h1></div>
      </div>
      <div class="flex gap-2"><button class="btn btn-outline btn-sm" onclick={() => editing = true}>Editar</button><form method="POST" action="?/delete" use:enhance><button class="btn btn-outline btn-error btn-sm" onclick={() => confirm("¿Eliminar este producto?")}>Eliminar</button></form></div>
    </div>
    <div class="p-3 border border-gray-300 bg-base-100"><span class="text-base-content/60 block text-xs uppercase tracking-wide">Costo Total por Unidad</span><span class="text-2xl font-bold font-mono">${Number(data.totalCost).toFixed(2)}</span></div>
  {/if}
</div>

<div class="flex justify-between items-center mb-3"><h2 class="text-lg font-semibold">Receta</h2><button class="btn btn-outline btn-sm" onclick={() => addLine = true}>+ Agregar Insumo</button></div>

{#if addLine}
<div class="card bg-base-200 p-4 mb-4 max-w-md">
  <div class="flex justify-between items-center mb-3"><h3 class="font-semibold">Agregar Insumo</h3><button class="btn btn-ghost btn-xs" onclick={() => addLine = false}>✕</button></div>
  <form method="POST" action="?/add_recipe_line" use:enhance={handleAdd}>
    <div class="grid grid-cols-1 gap-3">
      <div><label class="label" for="line_type"><span class="label-text">Tipo</span></label>
        <select id="line_type" name="line_type" class="select select-bordered w-full" onchange={e => addType = e.target.value}>
          <option value="ingredient">Ingrediente</option>
          <option value="component">Componente</option>
        </select>
      </div>
      <div><label class="label" for="ref_id"><span class="label-text">{addType === 'ingredient' ? 'Ingrediente' : 'Componente'}</span></label>
        <select id="ref_id" name="ref_id" class="select select-bordered w-full" required>
          <option value="">Seleccionar…</option>
          {#if addType === 'ingredient'}
            {#each availableIngredients as ing}<option value={ing.id}>{ing.name} ({ing.unit})</option>{/each}
          {:else}
            {#each availableComponents as comp}<option value={comp.id}>{comp.name} ({comp.unit})</option>{/each}
          {/if}
        </select>
        {#if form?.errorMessage}<p class="text-red-500 text-sm mt-1">{form.errorMessage}</p>{/if}
      </div>
      <div><label class="label" for="quantity_needed"><span class="label-text">Cantidad Necesaria</span></label><input id="quantity_needed" name="quantity_needed" type="number" step="0.01" class="input input-bordered w-full" required /></div>
    </div>
    <div class="mt-3 flex gap-2"><button type="submit" class="btn btn-primary btn-sm" disabled={addLoading}>{#if addLoading}<span class="loading loading-spinner"></span>{/if}Agregar</button><button type="button" class="btn btn-ghost btn-sm" onclick={() => addLine = false}>Cancelar</button></div>
  </form>
</div>
{/if}

<div class="overflow-x-auto border border-gray-300">
  {#if data.recipe.length === 0}<div class="alert bg-base-200 max-w-md m-4"><span>Aún no hay insumos en la receta. Agrega ingredientes o componentes arriba.</span></div>
  {:else}
  <table class="table">
    <thead><tr><th>Tipo</th><th>Insumo</th><th>Cant. Necesaria</th><th>Unidad</th><th>Costo Unit.</th><th>Costo x Línea</th><th></th></tr></thead>
    <tbody>
      {#each data.recipe as r (r.ref_id + r.line_type)}
        <tr>
          <td><span class="badge badge-sm">{r.line_type === 'ingredient' ? 'Ingrediente' : 'Componente'}</span></td>
          <td class="font-medium">{r.ref_name}</td>
          <td>{Number(r.quantity_needed).toFixed(2)}</td>
          <td>{r.ref_unit}</td>
          <td class="font-mono">${Number(r.latest_unit_cost).toFixed(4)}</td>
          <td class="font-mono font-bold">${Number(r.line_cost).toFixed(2)}</td>
          <td class="text-right"><form method="POST" action="?/remove_recipe_line" use:enhance><input type="hidden" name="line_type" value={r.line_type} /><input type="hidden" name="ref_id" value={r.ref_id} /><button class="btn btn-outline btn-xs text-error" onclick={() => confirm("¿Quitar este insumo?")}>Quitar</button></form></td>
        </tr>
      {/each}
    </tbody>
  </table>
  {/if}
</div>
