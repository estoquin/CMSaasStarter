<script lang="ts">import { getContext } from "svelte"; import type { Writable } from "svelte/store"; import { enhance } from "$app/forms"; import type { SubmitFunction } from "@sveltejs/kit"
let adminSection: Writable<string> = getContext("adminSection"); adminSection.set("cost-calculator")
let { data, form } = $props(); let showForm = $state(false); let loading = $state(false); let imagePreview = $state<string | null>(null)
function openNew() { showForm = true }; function closeForm() { showForm = false; imagePreview = null }
const handleSubmit: SubmitFunction = () => { loading = true; return async ({ update }) => { await update({ reset: false }); loading = false; showForm = false; imagePreview = null } }
function onImagePick(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) { const reader = new FileReader(); reader.onload = () => imagePreview = reader.result as string; reader.readAsDataURL(file) } else { imagePreview = null }
}
</script>
<svelte:head><title>Productos del Menú</title></svelte:head>

<div class="flex justify-between items-center mb-4 p-3 border border-gray-300"><h1 class="text-2xl font-bold">Productos del Menú</h1><button class="btn btn-primary btn-sm" onclick={openNew}>+ Nuevo Producto</button></div>

{#if showForm}
<div class="card bg-base-200 p-6 mb-6 max-w-md">
  <div class="flex justify-between items-center mb-4"><h2 class="text-lg font-semibold">Nuevo Producto</h2><button class="btn btn-ghost btn-xs" onclick={closeForm}>✕</button></div>
  <form method="POST" action="?/create" use:enhance={handleSubmit} enctype="multipart/form-data">
    <div><label class="label" for="name"><span class="label-text">Nombre *</span></label><input id="name" name="name" type="text" class="input input-bordered w-full" value={form?.name ?? ""} required placeholder="ej. Hamburguesa Clásica" />{#if form?.errorMessage}<p class="text-red-500 text-sm mt-1">{form.errorMessage}</p>{/if}</div>
    <div class="mt-3"><label class="label" for="image"><span class="label-text">Imagen</span></label><input id="image" name="image" type="file" accept="image/*" class="file-input file-input-bordered w-full" onchange={onImagePick} /></div>
    {#if imagePreview}<div class="mt-2"><img src={imagePreview} alt="preview" class="w-24 h-24 object-cover rounded" /></div>{/if}
    <div class="mt-4 flex gap-2"><button type="submit" class="btn btn-primary" disabled={loading}>{#if loading}<span class="loading loading-spinner"></span>{/if}Crear</button><button type="button" class="btn btn-ghost" onclick={closeForm}>Cancelar</button></div>
  </form>
</div>
{/if}

<div class="overflow-x-auto border border-gray-300">
  {#if data.items.length === 0}<div class="alert bg-base-200 max-w-md m-4"><span>No hay productos aún.</span></div>
  {:else}
  <table class="table">
    <thead><tr><th>Imagen</th><th>Nombre</th><th></th></tr></thead>
    <tbody>{#each data.items as item (item.id)}
      <tr><td>{#if item.image_url}<img src={item.image_url} alt={item.name} class="w-10 h-10 object-cover rounded" />{:else}<div class="w-10 h-10 rounded bg-base-300"></div>{/if}</td>
        <td><a href="/account/cost-calculator/menu-items/{item.id}" class="link link-hover font-medium">{item.name}</a></td>
        <td class="text-right"><form method="POST" action="?/delete" use:enhance><input type="hidden" name="id" value={item.id} /><button class="btn btn-outline btn-xs text-error" onclick={() => confirm("¿Eliminar este producto?")}>Eliminar</button></form></td></tr>
    {/each}</tbody>
  </table>
  {/if}
</div>
