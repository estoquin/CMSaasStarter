<script lang="ts">
  import { enhance } from "$app/forms"

  let { data, form } = $props()
  let organizations = $derived(data.organizations)
</script>

<svelte:head><title>Plataforma - Organizaciones</title></svelte:head>

<div class="min-h-dvh p-8 max-w-5xl mx-auto">
  <div class="flex items-center justify-between mb-8">
    <h1 class="text-2xl font-bold">Administración de Organizaciones</h1>
    <a href="/account" class="btn btn-ghost btn-sm">Ir al panel</a>
  </div>

  {#if organizations.length === 0}
    <p class="text-slate-500">No hay organizaciones registradas.</p>
  {:else}
    <div class="overflow-x-auto border rounded-lg">
      <table class="table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Slug</th>
            <th>Estado</th>
            <th>Creada</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {#each organizations as org}
            <tr>
              <td class="font-medium">{org.name}</td>
              <td class="text-slate-500 font-mono text-sm">{org.slug}</td>
              <td>
                {#if org.approved}
                  <span class="badge badge-success">Activa</span>
                {:else}
                  <span class="badge badge-warning">Pendiente</span>
                {/if}
              </td>
              <td class="text-sm text-slate-500">{new Date(org.created_at).toLocaleDateString()}</td>
              <td>
                {#if !org.approved}
                  <form method="POST" action="?/approve" use:enhance>
                    <input type="hidden" name="orgId" value={org.id} />
                    <button type="submit" class="btn btn-primary btn-sm">Aprobar</button>
                  </form>
                {/if}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}

  <div class="mt-8 text-sm text-slate-400">
    <a href="/org/new" class="link">Crear nueva organización</a>
  </div>
</div>
