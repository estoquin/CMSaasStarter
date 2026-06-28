<script lang="ts">
  import { getContext } from "svelte"
  import type { Writable } from "svelte/store"
  import { enhance } from "$app/forms"
  import { habitsRoute } from "$lib/habits"

  let adminSection: Writable<string> = getContext("adminSection")
  adminSection.set("habits")

  let { data } = $props()
  let habit = $derived(data.habit)
</script>

<svelte:head>
  <title>{habit.name} - Editar Hábito</title>
</svelte:head>

<div class="mb-4">
  <a href={habitsRoute.catalog} class="link link-neutral text-sm">&larr; Volver al Catálogo</a>
</div>

<div class="card bg-base-200 p-6 max-w-xl">
  <h1 class="text-2xl font-bold mb-6">Editar Hábito</h1>
  <form method="POST" action="?/update" use:enhance>
    <div class="flex flex-col gap-4">
      <div>
        <label class="label" for="name"><span class="label-text">Nombre *</span></label>
        <input id="name" name="name" type="text" class="input input-bordered w-full" value={habit.name} required />
      </div>
      <div>
        <label class="label" for="description"><span class="label-text">Descripción</span></label>
        <textarea id="description" name="description" class="textarea textarea-bordered w-full" rows="3">{habit.description ?? ""}</textarea>
      </div>
    </div>
    <div class="mt-6">
      <button type="submit" class="btn btn-primary">Guardar Cambios</button>
    </div>
  </form>
</div>
