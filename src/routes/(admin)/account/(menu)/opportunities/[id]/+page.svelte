<script lang="ts">import { getContext } from "svelte"; import type { Writable } from "svelte/store"; import { enhance, applyAction } from "$app/forms"; import type { SubmitFunction } from "@sveltejs/kit"
let adminSection: Writable<string> = getContext("adminSection"); adminSection.set("opportunities")
let { data, form } = $props(); let item = $derived(data.item); let editing = $state(false); let loading = $state(false)
const handleSubmit: SubmitFunction = () => { loading = true; return async ({ update, result }) => { await update({ reset: false }); await applyAction(result); loading = false; editing = false } }
const stages = ["prospecting","qualification","proposal","negotiation","closed_won","closed_lost"]
const stageLabels: Record<string,string> = { prospecting: "Prospección", qualification: "Calificación", proposal: "Propuesta", negotiation: "Negociación", closed_won: "Ganado", closed_lost: "Perdido" }
</script>
<svelte:head><title>{item.name} - Oportunidades</title></svelte:head>
<div class="mb-4"><a href="/account/opportunities" class="link link-neutral text-sm">&larr; Volver</a></div>

{#if editing}
<div class="card bg-base-200 p-6 max-w-xl">
  <div class="flex justify-between items-center mb-4"><h2 class="text-lg font-semibold">Editar Oportunidad</h2><button class="btn btn-ghost btn-xs" onclick={() => editing = false}>✕</button></div>
  <form method="POST" action="?/update" use:enhance={handleSubmit}>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div class="sm:col-span-2"><label class="label" for="name"><span class="label-text">Nombre *</span></label><input id="name" name="name" type="text" class="input input-bordered w-full" value={form?.name ?? item.name} required />{#if form?.errorMessage}<p class="text-red-500 text-sm mt-1">{form.errorMessage}</p>{/if}</div>
      <div><label class="label" for="account_id"><span class="label-text">ID de Cuenta</span></label><input id="account_id" name="account_id" type="text" class="input input-bordered w-full" value={form?.account_id ?? item.account_id ?? ""} /></div>
      <div><label class="label" for="value"><span class="label-text">Valor</span></label><input id="value" name="value" type="number" step="0.01" class="input input-bordered w-full" value={form?.value ?? item.value} /></div>
      <div><label class="label" for="stage"><span class="label-text">Etapa</span></label><select id="stage" name="stage" class="select select-bordered w-full">{#each stages as s}<option value={s} selected={item.stage === s}>{stageLabels[s]}</option>{/each}</select></div>
      <div><label class="label" for="probability"><span class="label-text">Probabilidad %</span></label><input id="probability" name="probability" type="number" min="0" max="100" class="input input-bordered w-full" value={form?.probability ?? item.probability} /></div>
      <div><label class="label" for="close_date"><span class="label-text">Fecha de Cierre</span></label><input id="close_date" name="close_date" type="date" class="input input-bordered w-full" value={form?.close_date ?? item.close_date ?? ""} /></div>
      <div class="sm:col-span-2"><label class="label" for="notes"><span class="label-text">Notas</span></label><textarea id="notes" name="notes" class="textarea textarea-bordered w-full" rows="4">{form?.notes ?? item.notes ?? ""}</textarea></div>
    </div>
    <div class="mt-4 flex gap-2"><button type="submit" class="btn btn-primary" disabled={loading}>{#if loading}<span class="loading loading-spinner"></span>{/if}Guardar</button><button type="button" class="btn btn-ghost" onclick={() => editing = false}>Cancelar</button></div>
  </form>
</div>
{:else}
<div class="card bg-base-200 p-6 max-w-xl">
  <div class="flex justify-between items-start mb-6"><div><h1 class="text-2xl font-bold">{item.name}</h1>{#if item.accounts?.name}<span class="text-sm text-base-content/60">{item.accounts.name}</span>{/if}</div><div class="flex gap-2"><button class="btn btn-outline btn-sm" onclick={() => editing = true}>Editar</button><form method="POST" action="?/delete" use:enhance><button class="btn btn-outline btn-error btn-sm" onclick={() => confirm("¿Eliminar?")}>Eliminar</button></form></div></div>
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
    <div><span class="text-base-content/60 block text-xs uppercase tracking-wide">Valor</span><span>${Number(item.value).toFixed(2)}</span></div>
    <div><span class="text-base-content/60 block text-xs uppercase tracking-wide">Etapa</span><span class="badge badge-sm">{stageLabels[item.stage] ?? item.stage}</span></div>
    <div><span class="text-base-content/60 block text-xs uppercase tracking-wide">Probabilidad</span><span>{item.probability}%</span></div>
    <div><span class="text-base-content/60 block text-xs uppercase tracking-wide">Fecha de Cierre</span><span>{item.close_date ?? "—"}</span></div>
    <div class="sm:col-span-2"><span class="text-base-content/60 block text-xs uppercase tracking-wide">Notas</span><p class="whitespace-pre-wrap">{item.notes ?? "—"}</p></div>
  </div>
</div>
{/if}
