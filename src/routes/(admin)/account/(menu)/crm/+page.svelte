<script lang="ts">
  import { getContext } from "svelte"
  import type { Writable } from "svelte/store"
  import { enhance } from "$app/forms"
  import type { SubmitFunction } from "@sveltejs/kit"

  let adminSection: Writable<string> = getContext("adminSection")
  adminSection.set("crm")

  let { data, form } = $props()

  let showForm = $state(false)
  let loading = $state(false)

  function openNew() {
    showForm = true
  }

  function closeForm() {
    showForm = false
  }

  const handleSubmit: SubmitFunction = () => {
    loading = true
    return async ({ update }) => {
      await update({ reset: false })
      loading = false
      showForm = false
    }
  }

  const statusColors: Record<string, string> = {
    lead: "badge-ghost",
    active: "badge-info",
    qualified: "badge-primary",
    closed: "badge-success",
    lost: "badge-error",
  }
</script>

<svelte:head>
  <title>CRM - Contactos</title>
</svelte:head>

<div class="flex justify-between items-center mb-4 p-3 border border-gray-300">
  <h1 class="text-2xl font-bold">Contactos</h1>
  <button class="btn btn-primary btn-sm" onclick={openNew}>
    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
    Nuevo Contacto
  </button>
</div>

{#if showForm}
  <div class="card bg-base-200 p-6 mb-6 max-w-xl">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-lg font-semibold">Nuevo Contacto</h2>
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
          <label class="label" for="email"><span class="label-text">Correo Electrónico</span></label>
          <input id="email" name="email" type="email" class="input input-bordered w-full" value={form?.email ?? ""} />
        </div>
        <div>
          <label class="label" for="phone"><span class="label-text">Teléfono</span></label>
          <input id="phone" name="phone" type="text" class="input input-bordered w-full" value={form?.phone ?? ""} />
        </div>
        <div>
          <label class="label" for="company"><span class="label-text">Empresa</span></label>
          <input id="company" name="company" type="text" class="input input-bordered w-full" value={form?.company ?? ""} />
        </div>
        <div class="sm:col-span-2">
          <label class="label" for="notes"><span class="label-text">Notas</span></label>
          <textarea id="notes" name="notes" class="textarea textarea-bordered w-full" rows="3">{form?.notes ?? ""}</textarea>
        </div>
      </div>
      <div class="mt-4 flex gap-2">
        <button type="submit" class="btn btn-primary" disabled={loading}>
          {#if loading}<span class="loading loading-spinner"></span>{/if}
          Crear Contacto
        </button>
        <button type="button" class="btn btn-ghost" onclick={closeForm}>Cancelar</button>
      </div>
    </form>
  </div>
{/if}

<div class="overflow-x-auto border border-gray-300">
  {#if data.contacts.length === 0}
    <div class="alert bg-base-200 max-w-md mt-4">
      <span>Aún no hay contactos. Haz clic en "Nuevo Contacto" para añadir uno.</span>
    </div>
  {:else}
    <table class="table">
      <thead>
        <tr>
          <th>Nombre</th>
          <th class="hidden sm:table-cell">Correo Electrónico</th>
          <th class="hidden md:table-cell">Empresa</th>
          <th>Estado</th>
          <th class="hidden lg:table-cell">Creado</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {#each data.contacts as contact (contact.id)}
          <tr>
            <td>
              <a href="/account/crm/{contact.id}" class="link link-hover font-medium">{contact.name}</a>
            </td>
            <td class="hidden sm:table-cell">{contact.email ?? "—"}</td>
            <td class="hidden md:table-cell">{contact.company ?? "—"}</td>
            <td>
              <span class="badge {statusColors[contact.status] || 'badge-ghost'} badge-sm">
                {contact.status}
              </span>
            </td>
            <td class="hidden lg:table-cell text-sm text-base-content/60">
              {contact.created_at ? new Date(contact.created_at).toLocaleDateString() : "—"}
            </td>
            <td class="text-right">
              <form method="POST" action="?/delete" use:enhance>
                <input type="hidden" name="id" value={contact.id} />
                <button class="btn btn-outline btn-xs text-error" onclick={() => confirm("¿Eliminar este contacto?")}>Eliminar</button>
              </form>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
</div>
