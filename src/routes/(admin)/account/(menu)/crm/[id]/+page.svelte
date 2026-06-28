<script lang="ts">
  import { getContext } from "svelte"
  import type { Writable } from "svelte/store"
  import { enhance, applyAction } from "$app/forms"
  import type { SubmitFunction } from "@sveltejs/kit"

  let adminSection: Writable<string> = getContext("adminSection")
  adminSection.set("crm")

  let { data, form } = $props()
  let contact = $derived(data.contact)

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

  const statusColors: Record<string, string> = {
    lead: "badge-ghost",
    active: "badge-info",
    qualified: "badge-primary",
    closed: "badge-success",
    lost: "badge-error",
  }
</script>

<svelte:head>
  <title>{contact.name} - CRM</title>
</svelte:head>

<div class="mb-4">
  <a href="/account/crm" class="link link-neutral text-sm">&larr; Volver a Contactos</a>
</div>

{#if editing}
  <div class="card bg-base-200 p-6 max-w-xl">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-lg font-semibold">Editar Contacto</h2>
      <button class="btn btn-ghost btn-xs" onclick={() => editing = false}>✕</button>
    </div>
    <form method="POST" action="?/update" use:enhance={handleSubmit}>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="sm:col-span-2">
          <label class="label" for="name"><span class="label-text">Nombre *</span></label>
          <input id="name" name="name" type="text" class="input input-bordered w-full" value={form?.name ?? contact.name} required />
          {#if form?.errorMessage}<p class="text-red-500 text-sm mt-1">{form.errorMessage}</p>{/if}
        </div>
        <div>
          <label class="label" for="email"><span class="label-text">Correo Electrónico</span></label>
          <input id="email" name="email" type="email" class="input input-bordered w-full" value={form?.email ?? contact.email ?? ""} />
        </div>
        <div>
          <label class="label" for="phone"><span class="label-text">Teléfono</span></label>
          <input id="phone" name="phone" type="text" class="input input-bordered w-full" value={form?.phone ?? contact.phone ?? ""} />
        </div>
        <div>
          <label class="label" for="company"><span class="label-text">Empresa</span></label>
          <input id="company" name="company" type="text" class="input input-bordered w-full" value={form?.company ?? contact.company ?? ""} />
        </div>
        <div>
          <label class="label" for="status"><span class="label-text">Estado</span></label>
          <select id="status" name="status" class="select select-bordered w-full">
            <option value="lead" selected={contact.status === "lead"}>Prospecto</option>
            <option value="active" selected={contact.status === "active"}>Activo</option>
            <option value="qualified" selected={contact.status === "qualified"}>Calificado</option>
            <option value="closed" selected={contact.status === "closed"}>Cerrado</option>
            <option value="lost" selected={contact.status === "lost"}>Perdido</option>
          </select>
        </div>
        <div class="sm:col-span-2">
          <label class="label" for="notes"><span class="label-text">Notas</span></label>
          <textarea id="notes" name="notes" class="textarea textarea-bordered w-full" rows="4">{form?.notes ?? contact.notes ?? ""}</textarea>
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
        <h1 class="text-2xl font-bold">{contact.name}</h1>
        <span class="badge {statusColors[contact.status] || 'badge-ghost'} mt-1">{contact.status}</span>
      </div>
      <div class="flex gap-2">
        <button class="btn btn-outline btn-sm" onclick={() => editing = true}>Editar</button>
        <form method="POST" action="?/delete" use:enhance>
          <button class="btn btn-outline btn-error btn-sm" onclick={() => confirm("¿Eliminar este contacto?")}>Eliminar</button>
        </form>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
      <div>
        <span class="text-base-content/60 block text-xs uppercase tracking-wide">Correo Electrónico</span>
        <span>{contact.email ?? "—"}</span>
      </div>
      <div>
        <span class="text-base-content/60 block text-xs uppercase tracking-wide">Teléfono</span>
        <span>{contact.phone ?? "—"}</span>
      </div>
      <div>
        <span class="text-base-content/60 block text-xs uppercase tracking-wide">Empresa</span>
        <span>{contact.company ?? "—"}</span>
      </div>
      <div>
        <span class="text-base-content/60 block text-xs uppercase tracking-wide">Creado</span>
        <span>{contact.created_at ? new Date(contact.created_at).toLocaleDateString() : "—"}</span>
      </div>
      <div class="sm:col-span-2">
        <span class="text-base-content/60 block text-xs uppercase tracking-wide">Notas</span>
        <p class="whitespace-pre-wrap">{contact.notes ?? "—"}</p>
      </div>
    </div>
  </div>
{/if}
