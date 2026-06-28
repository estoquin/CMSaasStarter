<script lang="ts">
  import { getContext } from "svelte"
  import type { Writable } from "svelte/store"
  import { enhance, applyAction } from "$app/forms"
  import type { SubmitFunction } from "@sveltejs/kit"

  let adminSection: Writable<string> = getContext("adminSection")
  adminSection.set("erp")

  let { data, form } = $props()
  let product = $derived(data.product)

  let editing = $state(false)
  let loading = $state(false)

  const handleSubmit: SubmitFunction = () => {
    loading = true
    return async ({ update, result }) => {
      await update({ reset: false })
      await applyAction(result)
      loading = false
      editing = false
    }
  }
</script>

<svelte:head>
  <title>{product.name} - ERP</title>
</svelte:head>

<div class="mb-4">
  <a href="/account/erp" class="link link-neutral text-sm">&larr; Volver a Productos</a>
</div>

{#if editing}
  <div class="card bg-base-200 p-6 max-w-xl">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-lg font-semibold">Editar Producto</h2>
      <button class="btn btn-ghost btn-xs" onclick={() => editing = false}>✕</button>
    </div>
    <form method="POST" action="?/update" use:enhance={handleSubmit}>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="sm:col-span-2">
          <label class="label" for="name"><span class="label-text">Nombre *</span></label>
          <input id="name" name="name" type="text" class="input input-bordered w-full" value={form?.name ?? product.name} required />
          {#if form?.errorMessage}<p class="text-red-500 text-sm mt-1">{form.errorMessage}</p>{/if}
        </div>
        <div>
          <label class="label" for="sku"><span class="label-text">SKU</span></label>
          <input id="sku" name="sku" type="text" class="input input-bordered w-full" value={form?.sku ?? product.sku ?? ""} />
        </div>
        <div>
          <label class="label" for="price"><span class="label-text">Precio</span></label>
          <input id="price" name="price" type="number" step="0.01" min="0" class="input input-bordered w-full" value={form?.price ?? product.price} />
        </div>
        <div>
          <label class="label" for="stock"><span class="label-text">Stock</span></label>
          <input id="stock" name="stock" type="number" min="0" class="input input-bordered w-full" value={form?.stock ?? product.stock} />
        </div>
        <div class="sm:col-span-2">
          <label class="label" for="description"><span class="label-text">Descripción</span></label>
          <textarea id="description" name="description" class="textarea textarea-bordered w-full" rows="4">{form?.description ?? product.description ?? ""}</textarea>
        </div>
      </div>
      <div class="mt-4 flex gap-2">
        <button type="submit" class="btn btn-primary" disabled={loading}>
          {#if loading}<span class="loading loading-spinner"></span>{/if}
          Guardar Cambios
        </button>
        <button type="button" class="btn btn-ghost" onclick={() => editing = false}>Cancelar</button>
      </div>
    </form>
  </div>
{:else}
  <div class="card bg-base-200 p-6 max-w-xl">
    <div class="flex justify-between items-start mb-6">
      <div>
        <h1 class="text-2xl font-bold">{product.name}</h1>
        {#if product.sku}<span class="text-sm text-base-content/60">SKU: {product.sku}</span>{/if}
      </div>
      <div class="flex gap-2">
        <button class="btn btn-outline btn-sm" onclick={() => editing = true}>Editar</button>
        <form method="POST" action="?/delete" use:enhance>
          <button class="btn btn-outline btn-error btn-sm" onclick={() => confirm("¿Eliminar este producto?")}>Eliminar</button>
        </form>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
      <div>
        <span class="text-base-content/60 block text-xs uppercase tracking-wide">Precio</span>
        <span class="text-lg font-semibold">${Number(product.price).toFixed(2)}</span>
      </div>
      <div>
        <span class="text-base-content/60 block text-xs uppercase tracking-wide">Stock</span>
        <span class="badge {product.stock > 0 ? 'badge-success' : 'badge-error'}">{product.stock} unidades</span>
      </div>
      <div class="sm:col-span-2">
        <span class="text-base-content/60 block text-xs uppercase tracking-wide">Creado</span>
        <span>{product.created_at ? new Date(product.created_at).toLocaleDateString() : "—"}</span>
      </div>
      <div class="sm:col-span-2">
        <span class="text-base-content/60 block text-xs uppercase tracking-wide">Descripción</span>
        <p class="whitespace-pre-wrap">{product.description ?? "—"}</p>
      </div>
    </div>
  </div>
{/if}
