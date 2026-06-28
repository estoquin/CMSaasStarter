<script lang="ts">import { getContext } from "svelte"; import type { Writable } from "svelte/store"; import { enhance, applyAction } from "$app/forms"; import type { SubmitFunction } from "@sveltejs/kit"
let adminSection: Writable<string> = getContext("adminSection"); adminSection.set("orders")
let { data, form } = $props(); let item = $derived(data.item); let editing = $state(false); let loading = $state(false)
const handleSubmit: SubmitFunction = () => { loading = true; return async ({ update, result }) => { await update({ reset: false }); await applyAction(result); loading = false; editing = false } }
const statuses = ["pending","confirmed","shipped","delivered","cancelled"]
const statusLabels: Record<string, string> = { pending: "Pendiente", confirmed: "Confirmado", shipped: "Enviado", delivered: "Entregado", cancelled: "Cancelado" }
</script>
<svelte:head><title>{item.name} - Pedidos</title></svelte:head>
<div class="mb-4"><a href="/account/orders" class="link link-neutral text-sm">&larr; Volver</a></div>

{#if editing}
<div class="card bg-base-200 p-6 max-w-xl">
  <div class="flex justify-between items-center mb-4"><h2 class="text-lg font-semibold">Editar Pedido</h2><button class="btn btn-ghost btn-xs" onclick={() => editing = false}>✕</button></div>
  <form method="POST" action="?/update" use:enhance={handleSubmit}>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div class="sm:col-span-2"><label class="label" for="name"><span class="label-text">Nombre *</span></label><input id="name" name="name" type="text" class="input input-bordered w-full" value={form?.name ?? item.name} required />{#if form?.errorMessage}<p class="text-red-500 text-sm mt-1">{form.errorMessage}</p>{/if}</div>
      <div><label class="label" for="account_id"><span class="label-text">Account ID</span></label><input id="account_id" name="account_id" type="text" class="input input-bordered w-full" value={form?.account_id ?? item.account_id ?? ""} /></div>
      <div><label class="label" for="quote_id"><span class="label-text">Quote ID</span></label><input id="quote_id" name="quote_id" type="text" class="input input-bordered w-full" value={form?.quote_id ?? item.quote_id ?? ""} /></div>
      <div><label class="label" for="total"><span class="label-text">Total</span></label><input id="total" name="total" type="number" step="0.01" class="input input-bordered w-full" value={form?.total ?? item.total} /></div>
      <div><label class="label" for="status"><span class="label-text">Estado</span></label><select id="status" name="status" class="select select-bordered w-full">{#each statuses as s}<option value={s} selected={item.status === s}>{statusLabels[s]}</option>{/each}</select></div>
      <div><label class="label" for="order_date"><span class="label-text">Fecha del Pedido</span></label><input id="order_date" name="order_date" type="date" class="input input-bordered w-full" value={form?.order_date ?? item.order_date ?? ""} /></div>
      <div class="sm:col-span-2"><label class="label" for="notes"><span class="label-text">Notes</span></label><textarea id="notes" name="notes" class="textarea textarea-bordered w-full" rows="4">{form?.notes ?? item.notes ?? ""}</textarea></div>
    </div>
    <div class="mt-4 flex gap-2"><button type="submit" class="btn btn-primary" disabled={loading}>{#if loading}<span class="loading loading-spinner"></span>{/if}Guardar</button><button type="button" class="btn btn-ghost" onclick={() => editing = false}>Cancelar</button></div>
  </form>
</div>
{:else}
<div class="card bg-base-200 p-6 max-w-xl">
  <div class="flex justify-between items-start mb-6"><div><h1 class="text-2xl font-bold">{item.name}</h1>{#if item.accounts?.name}<span class="text-sm text-base-content/60">{item.accounts.name}</span>{/if}</div><div class="flex gap-2"><button class="btn btn-outline btn-sm" onclick={() => editing = true}>Editar</button><form method="POST" action="?/delete" use:enhance><button class="btn btn-outline btn-error btn-sm" onclick={() => confirm("¿Eliminar?")}>Eliminar</button></form></div></div>
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
    <div><span class="text-base-content/60 block text-xs uppercase tracking-wide">Total</span><span>${Number(item.total).toFixed(2)}</span></div>
    <div><span class="text-base-content/60 block text-xs uppercase tracking-wide">Estado</span><span class="badge badge-sm">{statusLabels[item.status] ?? item.status}</span></div>
    <div><span class="text-base-content/60 block text-xs uppercase tracking-wide">Fecha del Pedido</span><span>{item.order_date ?? "—"}</span></div>
    <div class="sm:col-span-2"><span class="text-base-content/60 block text-xs uppercase tracking-wide">Notas</span><p class="whitespace-pre-wrap">{item.notes ?? "—"}</p></div>
  </div>
</div>
{/if}
