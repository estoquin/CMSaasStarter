<script lang="ts">
  import { getContext } from "svelte"
  import type { Writable } from "svelte/store"
  import { enhance } from "$app/forms"
  import type { SubmitFunction } from "@sveltejs/kit"

  let adminSection: Writable<string> = getContext("adminSection")
  adminSection.set("service")

  let { data, form } = $props()
  let ticket = $derived(data.ticket)
  let comments = $derived(data.comments)
  let timeLogs = $derived(data.timeLogs)
  let invoice = $derived(data.invoice)

  let statusLoading = $state(false)
  let commentLoading = $state(false)
  let timeLoading = $state(false)
  let invoiceLoading = $state(false)

  let showTimeForm = $state(false)
  let showInvoiceForm = $state(false)

  const statusColors: Record<string, string> = {
    open: "badge-info",
    in_progress: "badge-primary", pending: "badge-warning",
    resolved: "badge-success", closed: "badge-ghost",
  }
  const priorityColors: Record<string, string> = {
    low: "badge-ghost", medium: "badge-info", high: "badge-warning", critical: "badge-error",
  }

  const handleStatus: SubmitFunction = () => { statusLoading = true; return async ({ update }) => { await update({ reset: false }); statusLoading = false } }
  const handleComment: SubmitFunction = () => { commentLoading = true; return async ({ update }) => { await update({ reset: false }); commentLoading = false } }
  const handleTime: SubmitFunction = () => { timeLoading = true; return async ({ update }) => { await update({ reset: false }); timeLoading = false; showTimeForm = false } }
  const handleInvoice: SubmitFunction = () => { invoiceLoading = true; return async ({ update }) => { await update({ reset: false }); invoiceLoading = false; showInvoiceForm = false } }
</script>

<svelte:head><title>{ticket.title} - Service</title></svelte:head>

<div class="mb-4">
  <a href="/account/service" class="link link-neutral text-sm">&larr; Volver a Tickets</a>
</div>

<div class="card bg-base-200 p-6 mb-6">
  <div class="flex justify-between items-start mb-4">
    <div>
      <h1 class="text-2xl font-bold">{ticket.title}</h1>
      <div class="flex gap-2 mt-2">
        <span class="badge {statusColors[ticket.status] || 'badge-ghost'}">{ticket.status}</span>
        <span class="badge {priorityColors[ticket.priority] || 'badge-ghost'}">{ticket.priority}</span>
        {#if ticket.category}<span class="badge badge-ghost">{ticket.category}</span>{/if}
      </div>
    </div>
    <form method="POST" action="?/updateStatus" use:enhance={handleStatus}>
      <div class="flex items-center gap-2">
        <select name="status" class="select select-bordered select-sm">
          <option value="open" selected={ticket.status === "open"}>Abierto</option>
          <option value="in_progress" selected={ticket.status === "in_progress"}>En Progreso</option>
          <option value="pending" selected={ticket.status === "pending"}>Pendiente</option>
          <option value="resolved" selected={ticket.status === "resolved"}>Resuelto</option>
          <option value="closed" selected={ticket.status === "closed"}>Cerrado</option>
        </select>
        <button class="btn btn-outline btn-sm" disabled={statusLoading}>
          {#if statusLoading}<span class="loading loading-spinner"></span>{/if}
          Actualizar
        </button>
      </div>
    </form>
  </div>

  {#if ticket.description}
    <p class="text-sm whitespace-pre-wrap mb-4">{ticket.description}</p>
  {/if}

  <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
    <div>
      <span class="text-base-content/60 block text-xs uppercase tracking-wide">Cuenta</span>
      <span>{ticket.account_name ?? "—"}</span>
    </div>
    <div>
      <span class="text-base-content/60 block text-xs uppercase tracking-wide">Contacto</span>
      <span>{ticket.contact_name ?? "—"}</span>
    </div>
    <div>
      <span class="text-base-content/60 block text-xs uppercase tracking-wide">Agente Asignado</span>
      <span>{ticket.assigned_agent ?? "—"}</span>
    </div>
    <div>
      <span class="text-base-content/60 block text-xs uppercase tracking-wide">Horas Abierto</span>
      <span>{ticket.opened_at ? ((new Date().getTime() - new Date(ticket.opened_at).getTime()) / 3600000).toFixed(1) + "h" : "—"}</span>
    </div>
  </div>
</div>

<div class="card bg-base-200 p-6 mb-6">
  <h2 class="text-lg font-bold mb-4">Comentarios ({comments.length})</h2>
  <div class="space-y-3 mb-4">
    {#each comments as c}
      <div class="p-3 rounded-lg {c.is_internal ? 'bg-warning/10 border border-warning/30' : 'bg-base-100'}">
        <div class="flex justify-between text-xs text-base-content/60 mb-1">
          <span>{c.author?.full_name ?? "Desconocido"}{c.is_internal ? ' (interno)' : ''}</span>
          <span>{c.created_at ? new Date(c.created_at).toLocaleString() : ""}</span>
        </div>
        <p class="text-sm whitespace-pre-wrap">{c.body}</p>
      </div>
    {/each}
  </div>
  <form method="POST" action="?/addComment" use:enhance={handleComment}>
    <textarea name="body" class="textarea textarea-bordered w-full mb-2" rows="3" placeholder="Escribe un comentario..." required></textarea>
    <div class="flex items-center gap-4">
      <label class="flex items-center gap-2 text-sm cursor-pointer">
        <input type="checkbox" name="is_internal" value="true" class="checkbox checkbox-xs" />
        Interno
      </label>
      <button class="btn btn-primary btn-sm" disabled={commentLoading}>
        {#if commentLoading}<span class="loading loading-spinner"></span>{/if}
        Comentar
      </button>
    </div>
    {#if form?.commentError}<p class="text-red-500 text-sm mt-1">{form.commentError}</p>{/if}
  </form>
</div>

<div class="card bg-base-200 p-6 mb-6">
  <div class="flex justify-between items-center mb-4">
    <h2 class="text-lg font-bold">Tiempo Registrado</h2>
    <button class="btn btn-outline btn-sm" onclick={() => showTimeForm = !showTimeForm}>
      {showTimeForm ? 'Cancelar' : 'Registrar Tiempo'}
    </button>
  </div>
  {#if showTimeForm}
    <form method="POST" action="?/logTime" use:enhance={handleTime} class="mb-4 p-3 bg-base-100 rounded-lg">
      <div class="flex gap-2 items-end">
        <div>
          <label class="label" for="minutes"><span class="label-text">Minutos</span></label>
          <input id="minutes" name="minutes" type="number" min="1" class="input input-bordered input-sm w-24" required />
        </div>
        <div class="flex-1">
          <label class="label" for="note"><span class="label-text">Nota</span></label>
          <input id="note" name="note" type="text" class="input input-bordered input-sm w-full" />
        </div>
        <button class="btn btn-primary btn-sm" disabled={timeLoading}>
          {#if timeLoading}<span class="loading loading-spinner"></span>{/if}
          Guardar
        </button>
      </div>
      {#if form?.timeError}<p class="text-red-500 text-sm mt-1">{form.timeError}</p>{/if}
    </form>
  {/if}
  {#if timeLogs.length === 0}
    <p class="text-sm text-base-content/60">Sin tiempo registrado.</p>
  {:else}
    <div class="space-y-2">
      {#each timeLogs as log}
        <div class="flex justify-between text-sm p-2 bg-base-100 rounded-lg">
          <div>
            <span class="font-medium">{log.agent?.full_name ?? "—"}</span>
            {#if log.note}<span class="text-base-content/60 ml-2">— {log.note}</span>{/if}
          </div>
          <span class="font-mono">{log.minutes} min</span>
        </div>
      {/each}
    </div>
  {/if}
</div>

<div class="card bg-base-200 p-6">
  <div class="flex justify-between items-center mb-4">
    <h2 class="text-lg font-bold">Factura</h2>
    {#if !invoice}
      <button class="btn btn-outline btn-sm" onclick={() => showInvoiceForm = !showInvoiceForm}>
        {showInvoiceForm ? 'Cancelar' : 'Crear Factura'}
      </button>
    {/if}
  </div>
  {#if invoice}
    <div class="flex gap-4 text-sm">
      <div>
        <span class="text-base-content/60 block text-xs uppercase tracking-wide">Estado</span>
        <span class="badge badge-sm">{invoice.status}</span>
      </div>
      <div>
        <span class="text-base-content/60 block text-xs uppercase tracking-wide">Monto</span>
        <span class="font-mono">${Number(invoice.amount).toFixed(2)}</span>
      </div>
    </div>
  {:else if showInvoiceForm}
    <form method="POST" action="?/createInvoice" use:enhance={handleInvoice} class="p-3 bg-base-100 rounded-lg">
      <div class="flex gap-2 items-end">
        <div>
          <label class="label" for="amount"><span class="label-text">Monto ($)</span></label>
          <input id="amount" name="amount" type="number" step="0.01" min="0" class="input input-bordered input-sm w-32" required />
        </div>
        <button class="btn btn-primary btn-sm" disabled={invoiceLoading}>
          {#if invoiceLoading}<span class="loading loading-spinner"></span>{/if}
          Crear
        </button>
      </div>
      {#if form?.invoiceError}<p class="text-red-500 text-sm mt-1">{form.invoiceError}</p>{/if}
    </form>
  {:else}
    <p class="text-sm text-base-content/60">Sin factura asociada.</p>
  {/if}
</div>
