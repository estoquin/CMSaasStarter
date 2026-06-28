<script lang="ts">
  import { getContext } from "svelte"
  import type { Writable } from "svelte/store"
  import { enhance } from "$app/forms"
  import type { SubmitFunction } from "@sveltejs/kit"

  let adminSection: Writable<string> = getContext("adminSection")
  adminSection.set("erp")

  let { data, form } = $props()

  let showForm = $state(false)
  let loading = $state(false)

  function openNew() { showForm = true }
  function closeForm() { showForm = false }

  const handleSubmit: SubmitFunction = () => {
    loading = true
    return async ({ update }) => {
      await update({ reset: false })
      loading = false
      showForm = false
    }
  }
</script>

<svelte:head>
  <title>ERP - Productos</title>
</svelte:head>

<div class="flex justify-between items-center mb-4 p-3 border border-gray-300">
  <h1 class="text-2xl font-bold">Productos</h1>
  <button class="btn btn-primary btn-sm" onclick={openNew}>
    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
    Nuevo Producto
  </button>
</div>

{#if showForm}
  <div class="card bg-base-200 p-6 mb-6 max-w-xl">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-lg font-semibold">Nuevo Producto</h2>
      <button class="btn btn-ghost btn-xs" onclick={closeForm}>✕</button>
    </div>
    <form method="POST" action="?/create" use:enhance={handleSubmit}>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="sm:col-span-2">
          <label class="label" for="name"><span class="label-text">Nombre *</span></label>
          <input id="name" name="name" type="text" class="input input-bordered w-full" value={form?.name ?? ""} required />
          {#if form?.errorMessage}<p class="text-red-500 text-sm mt-1">{form.errorMessage}</p>{/if}
        </div>
        <div>
          <label class="label" for="sku"><span class="label-text">SKU</span></label>
          <input id="sku" name="sku" type="text" class="input input-bordered w-full" value={form?.sku ?? ""} />
        </div>
        <div>
          <label class="label" for="price"><span class="label-text">Precio</span></label>
          <input id="price" name="price" type="number" step="0.01" min="0" class="input input-bordered w-full" value={form?.price ?? ""} />
        </div>
        <div>
          <label class="label" for="stock"><span class="label-text">Stock</span></label>
          <input id="stock" name="stock" type="number" min="0" class="input input-bordered w-full" value={form?.stock ?? ""} />
        </div>
        <div class="sm:col-span-2">
          <label class="label" for="description"><span class="label-text">Descripción</span></label>
          <textarea id="description" name="description" class="textarea textarea-bordered w-full" rows="3">{form?.description ?? ""}</textarea>
        </div>
      </div>
      <div class="mt-4 flex gap-2">
        <button type="submit" class="btn btn-primary" disabled={loading}>
          {#if loading}<span class="loading loading-spinner"></span>{/if}
          Crear Producto
        </button>
        <button type="button" class="btn btn-ghost" onclick={closeForm}>Cancelar</button>
      </div>
    </form>
  </div>
{/if}

<div class="overflow-x-auto border border-gray-300">
  {#if data.products.length === 0}
    <div class="alert bg-base-200 max-w-md mt-4">
      <span>Aún no hay productos. Haz clic en "Nuevo Producto" para añadir uno.</span>
    </div>
  {:else}
    <table class="table">
      <thead>
        <tr>
          <th>Nombre</th>
          <th class="hidden sm:table-cell">SKU</th>
          <th>Precio</th>
          <th>Stock</th>
          <th class="hidden lg:table-cell">Creado</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {#each data.products as product (product.id)}
          <tr>
            <td>
              <a href="/account/erp/{product.id}" class="link link-hover font-medium">{product.name}</a>
            </td>
            <td class="hidden sm:table-cell">{product.sku ?? "—"}</td>
            <td>${Number(product.price).toFixed(2)}</td>
            <td>
              <span class="badge {product.stock > 0 ? 'badge-success' : 'badge-error'} badge-sm">{product.stock}</span>
            </td>
            <td class="hidden lg:table-cell text-sm text-base-content/60">
              {product.created_at ? new Date(product.created_at).toLocaleDateString() : "—"}
            </td>
            <td class="text-right">
              <form method="POST" action="?/delete" use:enhance>
                <input type="hidden" name="id" value={product.id} />
                <button class="btn btn-outline btn-xs text-error" onclick={() => confirm("¿Eliminar este producto?")}>Eliminar</button>
              </form>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
</div>
