<script lang="ts">
  import { getContext } from "svelte"
  import type { Writable } from "svelte/store"
  import { enhance } from "$app/forms"
  import type { SubmitFunction } from "@sveltejs/kit"

  let adminSection: Writable<string> = getContext("adminSection")
  adminSection.set("service")

  let { data, form } = $props()
  let loading = $state(false)

  let accounts = $derived(data.accounts)
  let contacts = $derived(data.contacts)

  function filteredContacts(accountId: string) {
    return contacts.filter((c: any) => true)
  }

  const handleSubmit: SubmitFunction = () => {
    loading = true
    return async ({ update }) => {
      await update({ reset: false })
      loading = false
    }
  }
</script>

<svelte:head><title>Nuevo Ticket - Service</title></svelte:head>

<div class="mb-4">
  <a href="/account/service" class="link link-neutral text-sm">&larr; Volver a Tickets</a>
</div>

<div class="card bg-base-200 p-6 max-w-xl">
  <h1 class="text-2xl font-bold mb-4">Nuevo Ticket</h1>
  <form method="POST" action="?/create" use:enhance={handleSubmit}>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div class="sm:col-span-2">
        <label class="label" for="title"><span class="label-text">Título *</span></label>
        <input id="title" name="title" type="text" class="input input-bordered w-full" value={form?.title ?? ""} required />
        {#if form?.errorMessage}<p class="text-red-500 text-sm mt-1">{form.errorMessage}</p>{/if}
      </div>
      <div class="sm:col-span-2">
        <label class="label" for="description"><span class="label-text">Descripción</span></label>
        <textarea id="description" name="description" class="textarea textarea-bordered w-full" rows="4">{form?.description ?? ""}</textarea>
      </div>
      <div>
        <label class="label" for="account_id"><span class="label-text">Cuenta *</span></label>
        <select id="account_id" name="account_id" class="select select-bordered w-full" required>
          <option value="">Seleccionar cuenta</option>
          {#each accounts as a}
            <option value={a.id} selected={form?.account_id === a.id}>{a.name}</option>
          {/each}
        </select>
      </div>
      <div>
        <label class="label" for="contact_id"><span class="label-text">Contacto</span></label>
        <select id="contact_id" name="contact_id" class="select select-bordered w-full">
          <option value="">Sin contacto</option>
          {#each contacts as c}
            <option value={c.id} selected={form?.contact_id === c.id}>{c.name}</option>
          {/each}
        </select>
      </div>
      <div>
        <label class="label" for="priority"><span class="label-text">Prioridad</span></label>
        <select id="priority" name="priority" class="select select-bordered w-full">
          <option value="low">Baja</option>
          <option value="medium" selected>Media</option>
          <option value="high">Alta</option>
          <option value="critical">Crítica</option>
        </select>
      </div>
      <div>
        <label class="label" for="category"><span class="label-text">Categoría</span></label>
        <input id="category" name="category" type="text" class="input input-bordered w-full" value={form?.category ?? ""} placeholder="ej. técnico, facturación" />
      </div>
    </div>
    <div class="mt-4 flex gap-2">
      <button type="submit" class="btn btn-primary" disabled={loading}>
        {#if loading}<span class="loading loading-spinner"></span>{/if}
        Crear Ticket
      </button>
      <a href="/account/service" class="btn btn-ghost">Cancelar</a>
    </div>
  </form>
</div>
