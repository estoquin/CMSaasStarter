<script lang="ts">import { getContext } from "svelte"; import type { Writable } from "svelte/store"; import { enhance, applyAction } from "$app/forms"; import type { SubmitFunction } from "@sveltejs/kit"
let adminSection: Writable<string> = getContext("adminSection"); adminSection.set("leads")
let { data, form } = $props(); let item = $derived(data.item); let editing = $state(false); let loading = $state(false)
const handleSubmit: SubmitFunction = () => { loading = true; return async ({ update, result }) => { await update({ reset: false }); await applyAction(result); loading = false; editing = false } }
</script>
<svelte:head><title>{item.name} - Prospectos</title></svelte:head>
<div class="mb-4"><a href="/account/leads" class="link link-neutral text-sm">&larr; Volver</a></div>
{#if editing}
<div class="card bg-base-200 p-6 max-w-xl">
  <div class="flex justify-between items-center mb-4"><h2 class="text-lg font-semibold">Editar Prospecto</h2><button class="btn btn-ghost btn-xs" onclick={() => editing = false}>✕</button></div>
  <form method="POST" action="?/update" use:enhance={handleSubmit}>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div class="sm:col-span-2"><label class="label" for="name"><span class="label-text">Nombre *</span></label><input id="name" name="name" type="text" class="input input-bordered w-full" value={form?.name ?? item.name} required />{#if form?.errorMessage}<p class="text-red-500 text-sm mt-1">{form.errorMessage}</p>{/if}</div>
      <div><label class="label" for="email"><span class="label-text">Correo Electrónico</span></label><input id="email" name="email" type="email" class="input input-bordered w-full" value={form?.email ?? item.email ?? ""} /></div>
      <div><label class="label" for="phone"><span class="label-text">Teléfono</span></label><input id="phone" name="phone" type="text" class="input input-bordered w-full" value={form?.phone ?? item.phone ?? ""} /></div>
      <div><label class="label" for="source"><span class="label-text">Origen</span></label><select id="source" name="source" class="select select-bordered w-full"><option value="">Seleccionar</option><option value="website" selected={item.source === "website"}>Sitio Web</option><option value="referral" selected={item.source === "referral"}>Referido</option><option value="social" selected={item.source === "social"}>Redes Sociales</option><option value="other" selected={item.source === "other"}>Otro</option></select></div>
      <div><label class="label" for="status"><span class="label-text">Estado</span></label><select id="status" name="status" class="select select-bordered w-full"><option value="new" selected={item.status === "new"}>Nuevo</option><option value="contacted" selected={item.status === "contacted"}>Contactado</option><option value="qualified" selected={item.status === "qualified"}>Calificado</option><option value="lost" selected={item.status === "lost"}>Perdido</option></select></div>
      <div class="sm:col-span-2"><label class="label" for="notes"><span class="label-text">Notas</span></label><textarea id="notes" name="notes" class="textarea textarea-bordered w-full" rows="4">{form?.notes ?? item.notes ?? ""}</textarea></div>
    </div>
    <div class="mt-4 flex gap-2"><button type="submit" class="btn btn-primary" disabled={loading}>{#if loading}<span class="loading loading-spinner"></span>{/if}Guardar</button><button type="button" class="btn btn-ghost" onclick={() => editing = false}>Cancelar</button></div>
  </form>
</div>
{:else}
<div class="card bg-base-200 p-6 max-w-xl">
  <div class="flex justify-between items-start mb-6"><div><h1 class="text-2xl font-bold">{item.name}</h1>{#if item.source}<span class="text-sm text-base-content/60">Origen: {item.source}</span>{/if}</div><div class="flex gap-2"><button class="btn btn-outline btn-sm" onclick={() => editing = true}>Editar</button><form method="POST" action="?/delete" use:enhance><button class="btn btn-outline btn-error btn-sm" onclick={() => confirm("¿Eliminar?")}>Eliminar</button></form></div></div>
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
    <div><span class="text-base-content/60 block text-xs uppercase tracking-wide">Correo Electrónico</span><span>{item.email ?? "—"}</span></div>
    <div><span class="text-base-content/60 block text-xs uppercase tracking-wide">Teléfono</span><span>{item.phone ?? "—"}</span></div>
    <div><span class="text-base-content/60 block text-xs uppercase tracking-wide">Estado</span><span class="badge badge-sm">{item.status}</span></div>
    <div class="sm:col-span-2"><span class="text-base-content/60 block text-xs uppercase tracking-wide">Notas</span><p class="whitespace-pre-wrap">{item.notes ?? "—"}</p></div>
  </div>
</div>
{/if}
