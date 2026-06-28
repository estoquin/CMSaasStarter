<script lang="ts">
  import { getContext } from "svelte"
  import type { Writable } from "svelte/store"
  import { enhance } from "$app/forms"
  import { habitsRoute } from "$lib/habits"
  import type { ActionResult } from "@sveltejs/kit"

  let adminSection: Writable<string> = getContext("adminSection")
  adminSection.set("habits")

  let { data } = $props()
  let bundle = $derived(data.bundle)
  let includedHabits = $derived(data.includedHabits)

  let searchQuery = $state("")
  let searchResults = $state<Array<{ id: string; name: string }>>([])
  let searchLoading = $state(false)
  let showingSearch = $state(false)

  function handleSearch({ formData, result }: { formData: FormData; result: ActionResult }) {
    if (result.data?.results) {
      searchResults = result.data.results
    }
    searchLoading = false
  }
</script>

<svelte:head>
  <title>{bundle.name} - Bundle</title>
</svelte:head>

<div class="mb-4">
  <a href={habitsRoute.bundles} class="link link-neutral text-sm">&larr; Volver a Bundles</a>
</div>

<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
  <!-- Bundle Info -->
  <div class="card bg-base-200 p-6">
    <h2 class="text-lg font-semibold mb-4">Editar Bundle</h2>
    <form method="POST" action="?/updateBundle" use:enhance id="update-bundle-form">
      <div class="flex flex-col gap-4">
        <div>
          <label class="label" for="name"><span class="label-text">Nombre *</span></label>
          <input id="name" name="name" type="text" class="input input-bordered w-full" value={bundle.name} required />
        </div>
        <div>
          <label class="label" for="description"><span class="label-text">Descripción</span></label>
          <textarea id="description" name="description" class="textarea textarea-bordered w-full" rows="2">{bundle.description ?? ""}</textarea>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="label" for="start_date"><span class="label-text">Fecha inicio</span></label>
            <input id="start_date" name="start_date" type="date" class="input input-bordered w-full" value={bundle.start_date ?? ""} />
          </div>
          <div>
            <label class="label" for="end_date"><span class="label-text">Fecha fin</span></label>
            <input id="end_date" name="end_date" type="date" class="input input-bordered w-full" value={bundle.end_date ?? ""} />
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-sm">Estado:</span>
          {#if bundle.active}
            <span class="badge badge-success badge-sm">Activo</span>
          {:else}
            <span class="badge badge-ghost badge-sm">Inactivo</span>
          {/if}
        </div>
      </div>
    </form>
    <div class="mt-4 flex items-center gap-2">
      <button type="submit" form="update-bundle-form" class="btn btn-primary flex-1">Guardar Cambios</button>
      <form method="POST" action="?/deactivate" use:enhance class="flex-1">
        <button type="submit" class="btn btn-outline btn-warning w-full">Desactivar</button>
      </form>
      <form method="POST" action="?/delete" use:enhance class="flex-1">
        <button type="submit" class="btn btn-outline btn-error w-full">Eliminar</button>
      </form>
    </div>
  </div>

  <!-- Manage Habits -->
  <div class="card bg-base-200 p-6">
    <h2 class="text-lg font-semibold mb-4">Hábitos en este bundle</h2>

    <!-- Included Habits List (default view) -->
    {#if !showingSearch}
      <div class="flex justify-between items-center mb-3">
        <span class="text-sm font-medium">{includedHabits.length} hábitos</span>
        <button class="btn btn-primary btn-sm" onclick={() => showingSearch = true}>+ Agregar</button>
      </div>
      {#if includedHabits.length === 0}
        <p class="text-sm text-base-content/60">No hay hábitos en este bundle.</p>
      {:else}
        <div class="flex flex-col gap-1">
          {#each includedHabits as habit (habit.id)}
            <div class="flex items-center justify-between px-2 py-1 bg-base-300">
              <span class="text-sm font-medium">{habit.name}</span>
              <form method="POST" action="?/removeHabit" use:enhance>
                <input type="hidden" name="habitId" value={habit.id} />
                <button type="submit" class="btn btn-outline btn-error btn-xs">Quitar</button>
              </form>
            </div>
          {/each}
        </div>
      {/if}

    <!-- Search & Add (toggled) -->
    {:else}
      <div class="flex justify-between items-center mb-3">
        <span class="text-sm font-medium">Buscar hábito</span>
        <button class="btn btn-ghost btn-sm" onclick={() => {
          showingSearch = false
          searchResults = []
          searchQuery = ""
        }}>← Volver</button>
      </div>
      <form method="POST" action="?/searchHabits" use:enhance={() => {
        searchLoading = true
        return async ({ formData, result }) => {
          handleSearch({ formData, result })
        }
      }}>
        <div class="join w-full">
          <input
            name="q"
            type="text"
            class="input input-bordered join-item w-full"
            placeholder="Escribe para buscar..."
            bind:value={searchQuery}
          />
          <button type="submit" class="btn btn-primary join-item" disabled={searchLoading}>
            {#if searchLoading}<span class="loading loading-spinner loading-xs"></span>{/if}
            Buscar
          </button>
        </div>
      </form>

      {#if searchResults.length > 0}
        <div class="mt-2 border border-base-300 max-h-48 overflow-y-auto">
          {#each searchResults as habit (habit.id)}
            <div class="flex items-center justify-between px-2 py-1 hover:bg-base-300">
              <span class="text-sm">{habit.name}</span>
              <form method="POST" action="?/addHabit" use:enhance>
                <input type="hidden" name="habitId" value={habit.id} />
                <button type="submit" class="btn btn-primary btn-xs">Agregar</button>
              </form>
            </div>
          {/each}
        </div>
      {:else if searchQuery && !searchLoading}
        <p class="text-sm text-base-content/50 mt-1">Sin resultados</p>
      {/if}
    {/if}
  </div>
</div>
