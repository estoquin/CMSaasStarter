<script lang="ts">import { getContext } from "svelte"; import type { Writable } from "svelte/store"; import { enhance } from "$app/forms"; import { goto } from "$app/navigation"; import type { SubmitFunction } from "@sveltejs/kit"
let adminSection: Writable<string> = getContext("adminSection"); adminSection.set("accounts")
let { data, form } = $props(); let showForm = $state(false); let loading = $state(false)
function openNew() { showForm = true }; function closeForm() { showForm = false }
const handleSubmit: SubmitFunction = () => { loading = true; return async ({ update }) => { await update({ reset: false }); loading = false; showForm = false } }
</script>
<svelte:head><title>Cuentas</title></svelte:head>

<div class="flex justify-between items-center mb-4 p-3 border border-gray-300"><h1 class="text-2xl font-bold">Cuentas</h1><button class="btn btn-primary btn-sm" onclick={openNew}>+ Nueva Cuenta</button></div>

{#if showForm}
<div class="card bg-base-200 p-6 mb-6 max-w-xl">
  <div class="flex justify-between items-center mb-4"><h2 class="text-lg font-semibold">Nueva Cuenta</h2><button class="btn btn-ghost btn-xs" onclick={closeForm}>✕</button></div>
  <form method="POST" action="?/create" use:enhance={handleSubmit}>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div class="sm:col-span-2"><label class="label" for="name"><span class="label-text">Nombre *</span></label><input id="name" name="name" type="text" class="input input-bordered w-full" value={form?.name ?? ""} required />{#if form?.errorMessage}<p class="text-red-500 text-sm mt-1">{form.errorMessage}</p>{/if}</div>
      <div><label class="label" for="email"><span class="label-text">Correo Electrónico</span></label><input id="email" name="email" type="email" class="input input-bordered w-full" value={form?.email ?? ""} /></div>
      <div><label class="label" for="phone"><span class="label-text">Teléfono</span></label><input id="phone" name="phone" type="text" class="input input-bordered w-full" value={form?.phone ?? ""} /></div>
      <div><label class="label" for="website"><span class="label-text">Sitio Web</span></label><input id="website" name="website" type="text" class="input input-bordered w-full" value={form?.website ?? ""} /></div>
      <div><label class="label" for="industry"><span class="label-text">Industria</span></label><input id="industry" name="industry" type="text" class="input input-bordered w-full" value={form?.industry ?? ""} /></div>
      <div class="sm:col-span-2"><label class="label" for="notes"><span class="label-text">Notas</span></label><textarea id="notes" name="notes" class="textarea textarea-bordered w-full" rows="3">{form?.notes ?? ""}</textarea></div>
    </div>
    <div class="mt-4 flex gap-2"><button type="submit" class="btn btn-primary" disabled={loading}>{#if loading}<span class="loading loading-spinner"></span>{/if}Crear</button><button type="button" class="btn btn-ghost" onclick={closeForm}>Cancelar</button></div>
  </form>
</div>
{/if}

<div class="overflow-x-auto border border-gray-300">
  {#if data.items.length === 0}<div class="alert bg-base-200 max-w-md mt-4"><span>Aún no hay cuentas.</span></div>
  {:else}
  <table class="table">
    <thead><tr><th>Nombre</th><th class="hidden sm:table-cell">Correo Electrónico</th><th class="hidden md:table-cell">Industria</th><th>Estado</th><th></th></tr></thead>
    <tbody>{#each data.items as item (item.id)}
      <tr class="cursor-pointer hover:bg-gray-100 odd:hover:bg-gray-100 even:hover:bg-gray-100" onclick={() => goto(`/account/accounts/${item.id}`)} onkeydown={(e) => e.key === 'Enter' && goto(`/account/accounts/${item.id}`)} tabindex="0"><td><a href="/account/accounts/{item.id}" class="link link-hover font-medium" onclick={(e) => e.stopPropagation()}>{item.name}</a></td><td class="hidden sm:table-cell">{item.email ?? "—"}</td><td class="hidden md:table-cell">{item.industry ?? "—"}</td><td><span class="badge badge-sm capitalize">{item.status}</span></td>
        <td class="text-right" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()}><form method="POST" action="?/delete" use:enhance><input type="hidden" name="id" value={item.id} /><button class="btn btn-outline btn-xs text-error" onclick={() => confirm("¿Eliminar?")}>Eliminar</button></form></td></tr>
    {/each}</tbody>
  </table>
  {/if}
</div>
