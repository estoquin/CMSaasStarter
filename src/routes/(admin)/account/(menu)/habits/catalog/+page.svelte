<script lang="ts">
  import { getContext } from "svelte"
  import type { Writable } from "svelte/store"
  import { enhance } from "$app/forms"
  import { habitsRoute } from "$lib/habits"

  let adminSection: Writable<string> = getContext("adminSection")
  adminSection.set("habits")

  let { data } = $props()
  let habits = $derived(data.habits)

  let showForm = $state(false)
  let loading = $state(false)
</script>

<svelte:head>
  <title>Catálogo de Hábitos</title>
</svelte:head>

<div class="flex justify-between items-center mb-4 p-3 border border-gray-300">
  <h1 class="text-2xl font-bold">Catálogo de Hábitos</h1>
  <button class="btn btn-primary btn-sm" onclick={() => showForm = true}>
    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
    Nuevo Hábito
  </button>
</div>

{#if showForm}
  <div class="card bg-base-200 p-6 mb-6 max-w-xl">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-lg font-semibold">Nuevo Hábito</h2>
      <button class="btn btn-ghost btn-xs" onclick={() => showForm = false}>✕</button>
    </div>
    <form method="POST" action="?/create" use:enhance={() => {
      loading = true
      return async ({ update }) => {
        await update({ reset: false })
        loading = false
        showForm = false
      }
    }}>
      <div class="flex flex-col gap-4">
        <div>
          <label class="label" for="name"><span class="label-text">Nombre *</span></label>
          <input id="name" name="name" type="text" class="input input-bordered w-full" required />
        </div>
        <div>
          <label class="label" for="description"><span class="label-text">Descripción</span></label>
          <textarea id="description" name="description" class="textarea textarea-bordered w-full" rows="2"></textarea>
        </div>
      </div>
      <div class="mt-4 flex gap-2">
        <button type="submit" class="btn btn-primary" disabled={loading}>
          {#if loading}<span class="loading loading-spinner"></span>{/if}
          Crear
        </button>
        <button type="button" class="btn btn-ghost" onclick={() => showForm = false}>Cancelar</button>
      </div>
    </form>
  </div>
{/if}

<div class="overflow-x-auto border border-gray-300">
  {#if habits.length === 0}
    <div class="alert bg-base-200 max-w-md mt-4">
      <span>Aún no hay hábitos. Crea el primero.</span>
    </div>
  {:else}
    <table class="table">
      <thead>
        <tr>
          <th>Nombre</th>
          <th class="hidden sm:table-cell">Descripción</th>
          <th>Activo</th>
        </tr>
      </thead>
      <tbody>
        {#each habits as habit (habit.id)}
          <tr>
            <td>
              <a href={habitsRoute.habit(habit.id)} class="link link-hover font-medium">{habit.name}</a>
            </td>
            <td class="hidden sm:table-cell text-sm text-base-content/60">{habit.description ?? "—"}</td>
            <td>
              <form method="POST" action="?/toggleActive" use:enhance>
                <input type="hidden" name="id" value={habit.id} />
                <input type="hidden" name="active" value={String(!habit.active)} />
                <input
                  type="checkbox"
                  class="toggle toggle-primary toggle-sm"
                  checked={habit.active}
                  onchange={(e) => {
                    const target = e.currentTarget as HTMLInputElement
                    const form = target.closest("form") as HTMLFormElement
                    const hidden = form.querySelector('[name="active"]') as HTMLInputElement
                    hidden.value = String(target.checked)
                    form.requestSubmit()
                  }}
                />
              </form>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
</div>
