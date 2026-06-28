<script lang="ts">
  let { form } = $props()
</script>

<svelte:head>
  <title>Crear Organización</title>
</svelte:head>

<div class="flex min-h-dvh items-center justify-center p-8">
  <div class="flex flex-col w-80">

    {#if form?.success}
      <h1 class="text-2xl font-bold mb-4">Organización creada</h1>
      <div class="bg-success/10 border border-success rounded-lg p-4 mb-4">
        <p class="font-semibold">{form.org.name}</p>
        <p class="text-sm text-slate-600 mt-1">
          Código de acceso: <strong class="text-base">{form.org.slug}</strong>
        </p>
      </div>
      <p class="text-slate-600 text-sm">
        Comparte este código con el cliente para que lo use al registrarse.
      </p>
      <a href="/org/new" class="btn btn-primary mt-6">Crear otra</a>

    {:else}
      <h1 class="text-2xl font-bold mb-6">Crear organización</h1>
      <form method="POST" action="?/create" class="flex flex-col gap-4">
        <label class="form-control w-full">
          <span class="label-text">Nombre de la organización</span>
          <input
            name="name"
            type="text"
            class="input input-bordered w-full mt-1"
            placeholder="Ej: Restaurante El Chef"
            value={form?.name ?? ""}
            required
          />
        </label>

        <label class="form-control w-full">
          <span class="label-text">Código (slug) — opcional</span>
          <input
            name="slug"
            type="text"
            class="input input-bordered w-full mt-1"
            placeholder="ej: el-chef"
          />
          <span class="label-text-alt text-slate-500 mt-1">Si se deja vacío, se genera del nombre.</span>
        </label>

        {#if form?.error}
          <p class="text-error text-sm">{form.error}</p>
        {/if}

        <button type="submit" class="btn btn-primary w-full">
          Crear
        </button>
      </form>
      <div class="text-l text-slate-800 mt-4 text-center">
        <a class="underline" href="/login/sign_in">Volver al inicio</a>
      </div>
    {/if}

  </div>
</div>
