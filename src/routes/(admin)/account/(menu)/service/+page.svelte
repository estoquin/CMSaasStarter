<script lang="ts">
  import { getContext } from "svelte"
  import type { Writable } from "svelte/store"

  let adminSection: Writable<string> = getContext("adminSection")
  adminSection.set("service")

  let { data } = $props()
  let tickets = $derived(data.openTickets)

  let statusFilter = $state("")
  let priorityFilter = $state("")
  let categoryFilter = $state("")

  let filteredTickets = $derived(
    tickets.filter((t: any) => {
      if (statusFilter && t.status !== statusFilter) return false
      if (priorityFilter && t.priority !== priorityFilter) return false
      if (categoryFilter && (t.category ?? "") !== categoryFilter) return false
      return true
    })
  )

  const statusColors: Record<string, string> = {
    open: "badge-info",
    in_progress: "badge-primary",
    pending: "badge-warning",
    resolved: "badge-success",
    closed: "badge-ghost",
  }

  const priorityColors: Record<string, string> = {
    low: "badge-ghost",
    medium: "badge-info",
    high: "badge-warning",
    critical: "badge-error",
  }

  const categories = $derived([...new Set(tickets.map((t: any) => t.category).filter(Boolean))])
</script>

<svelte:head><title>Service - Tickets</title></svelte:head>

<div class="flex justify-between items-center mb-4 p-3 border border-gray-300">
  <h1 class="text-2xl font-bold">Tickets</h1>
  <a href="/account/service/new" class="btn btn-primary btn-sm">
    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
    Nuevo Ticket
  </a>
</div>

<div class="flex flex-wrap gap-2 mb-4">
  <select class="select select-bordered select-sm" bind:value={statusFilter}>
    <option value="">Todos los estados</option>
    <option value="open">Abierto</option>
    <option value="in_progress">En Progreso</option>
    <option value="pending">Pendiente</option>
    <option value="resolved">Resuelto</option>
    <option value="closed">Cerrado</option>
  </select>
  <select class="select select-bordered select-sm" bind:value={priorityFilter}>
    <option value="">Todas las prioridades</option>
    <option value="low">Baja</option>
    <option value="medium">Media</option>
    <option value="high">Alta</option>
    <option value="critical">Crítica</option>
  </select>
  <select class="select select-bordered select-sm" bind:value={categoryFilter}>
    <option value="">Todas las categorías</option>
    {#each categories as cat}
      <option value={cat}>{cat}</option>
    {/each}
  </select>
</div>

<div class="overflow-x-auto border border-gray-300">
  {#if filteredTickets.length === 0}
    <div class="alert bg-base-200 max-w-md mt-4">
      <span>No hay tickets. Crea uno nuevo para comenzar.</span>
    </div>
  {:else}
    <table class="table">
      <thead>
        <tr>
          <th>Título</th>
          <th class="hidden sm:table-cell">Cuenta</th>
          <th>Prioridad</th>
          <th>Estado</th>
          <th class="hidden md:table-cell">Categoría</th>
          <th class="hidden lg:table-cell">Horas Abierto</th>
        </tr>
      </thead>
      <tbody>
        {#each filteredTickets as ticket (ticket.id)}
          <tr>
            <td>
              <a href="/account/service/{ticket.id}" class="link link-hover font-medium">{ticket.title}</a>
            </td>
            <td class="hidden sm:table-cell">{ticket.account_name ?? "—"}</td>
            <td>
              <span class="badge {priorityColors[ticket.priority] || 'badge-ghost'} badge-sm">{ticket.priority}</span>
            </td>
            <td>
              <span class="badge {statusColors[ticket.status] || 'badge-ghost'} badge-sm">{ticket.status}</span>
            </td>
            <td class="hidden md:table-cell">{ticket.category ?? "—"}</td>
            <td class="hidden lg:table-cell text-sm text-base-content/60">
              {ticket.hours_open != null ? ticket.hours_open.toFixed(1) + "h" : "—"}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
</div>
