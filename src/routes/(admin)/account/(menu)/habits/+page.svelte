<script lang="ts">
  import { getContext } from "svelte"
  import type { Writable } from "svelte/store"
  import { enhance } from "$app/forms"
  import { goto } from "$app/navigation"
  import { habitsRoute } from "$lib/habits"

  let adminSection: Writable<string> = getContext("adminSection")
  adminSection.set("habits")

  let { data } = $props()
  let view = $derived(data.view)
  let allBundles = $derived(data.allBundles)
  let activeBundle = $derived(data.activeBundle)

  // Edit view
  let habits = $derived(data.habits ?? [])
  let existingRecords = $derived(data.existingRecords ?? [])
  let today = $derived(data.today)

  // List view
  let entries = $derived(data.entries ?? [])

  // Edit view state
  let existingMap = $derived(new Map(existingRecords.map((r: { habit_id: string; completed: boolean | null; notes: string | null }) => [r.habit_id, r])))
  let completed = $state<Record<string, boolean>>({})
  let notes = $state<Record<string, string>>({})
  let saving = $state(false)
  let toast = $state<{ message: string; type: "success" | "error" } | null>(null)

  let habitsKey = $derived(habits.map((h: { id: string }) => h.id).join(","))
  $effect(() => {
    habitsKey
    const map: Record<string, boolean> = {}
    const ns: Record<string, string> = {}
    for (const h of habits) {
      map[h.id] = existingMap.get(h.id)?.completed ?? false
      ns[h.id] = existingMap.get(h.id)?.notes ?? ""
    }
    completed = map
    notes = ns
  })

  $effect(() => {
    if (toast) {
      const t = setTimeout(() => toast = null, 3000)
      return () => clearTimeout(t)
    }
  })
</script>

<svelte:head>
  <title>Hábitos - Check-in Diario</title>
</svelte:head>

<h1 class="text-2xl font-bold mb-2">Check-in Diario</h1>
{#if view === "edit"}
  <p class="text-base-content/60 capitalize mb-4">{new Date(today).toLocaleDateString("es", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
{/if}

<div class="flex items-center gap-3 mb-4">
  <select class="select select-bordered select-sm" onchange={(e) => {
    const target = e.currentTarget as HTMLSelectElement
    goto(habitsRoute.checkin(target.value), { replaceState: true })
  }}>
    {#each allBundles as b (b.id)}
      <option value={b.id} selected={b.id === activeBundle?.id}>{b.name}</option>
    {/each}
  </select>
  <a href={habitsRoute.bundles} class="link link-hover text-sm">Gestionar bundles</a>
</div>

{#if toast}
  <div class="alert alert-{toast.type === 'success' ? 'success' : 'error'} mb-4 shadow-lg">
    <span>{toast.message}</span>
  </div>
{/if}

{#if view === "edit"}
  <!-- Check-in Edit View -->
  {#if habits.length === 0}
    <div class="alert bg-base-200 max-w-md">
      <span>Este bundle no tiene hábitos. <a href={habitsRoute.bundle(activeBundle.id)} class="link">Agrega algunos</a>.</span>
    </div>
  {:else}
    <form method="POST" action="?/save" use:enhance={() => {
      saving = true
      toast = null
      return async ({ result }) => {
        saving = false
        if (result.type === "success") {
          toast = { message: "Check-in guardado", type: "success" }
        } else if (result.type === "failure") {
          toast = { message: result.data?.error ?? "Error al guardar", type: "error" }
        }
      }
    }}>
      <input type="hidden" name="bundleId" value={activeBundle.id} />
      <input type="hidden" name="date" value={today} />
      <input type="hidden" name="completed" value={JSON.stringify(Object.keys(completed).filter((k) => completed[k]))} />
      <input type="hidden" name="notes" value={JSON.stringify(notes)} />

      <div class="card bg-base-200 p-4">
        <div class="flex items-center gap-2 mb-3">
          <input type="date" class="input input-bordered input-sm" value={today} onchange={(e) => {
            const target = e.currentTarget as HTMLInputElement
            goto(habitsRoute.checkin(activeBundle.id, target.value), { replaceState: true, keepFocus: true, noScroll: true })
          }} />
          <button type="button" class="btn btn-ghost btn-xs" onclick={() => goto(habitsRoute.checkin(activeBundle.id, today), { replaceState: true, keepFocus: true, noScroll: true })}>Hoy</button>
        </div>
        <table class="table table-sm">
          <thead>
            <tr>
              <th class="w-10"></th>
              <th>Hábito</th>
              <th class="w-1/2">Nota</th>
            </tr>
          </thead>
          <tbody>
            {#each habits as habit (habit.id)}
              <tr>
                <td>
                  <input
                    type="checkbox"
                    class="checkbox checkbox-primary checkbox-sm"
                    checked={completed[habit.id]}
                    onchange={() => { completed[habit.id] = !completed[habit.id] }}
                  />
                </td>
                <td class="{completed[habit.id] ? 'line-through text-base-content/50' : ''}">{habit.name}</td>
                <td>
                  <input type="text" class="input input-bordered input-sm w-full" placeholder="—" bind:value={notes[habit.id]} />
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
        <div class="mt-3 flex items-center gap-2">
          <button type="submit" class="btn btn-primary btn-sm" disabled={saving}>
            {#if saving}<span class="loading loading-spinner loading-xs"></span>{/if}
            Guardar Check-in
          </button>
          <button type="button" class="btn btn-ghost btn-sm" onclick={() => goto(habitsRoute.checkin(activeBundle.id), { replaceState: true })}>Volver</button>
        </div>
      </div>
    </form>
  {/if}

{:else}
  <!-- List View -->
  {#if !activeBundle}
    <div class="alert bg-base-200 max-w-md">
      <span>No hay un bundle activo. <a href={habitsRoute.bundles} class="link">Crea uno primero</a>.</span>
    </div>
  {:else if entries.length === 0}
    <div class="alert bg-base-200 max-w-md">
      <span>Aún no hay registros. <a href={habitsRoute.checkin(activeBundle.id, today)} class="link">Crea tu primer check-in</a>.</span>
    </div>
  {:else}
    <div class="overflow-x-auto border border-gray-300">
      <table class="table">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Progreso</th>
          </tr>
        </thead>
        <tbody>
          {#each entries as entry (entry.date)}
            <tr>
              <td class="font-medium"><a href={habitsRoute.checkin(activeBundle.id, entry.date)} class="link link-hover">{entry.date}</a></td>
              <td>{entry.completed}/{entry.total}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <div class="mt-4">
      <a href={habitsRoute.checkin(activeBundle.id, today)} class="btn btn-primary btn-sm">Check-in de Hoy</a>
    </div>
  {/if}
{/if}
