<script lang="ts">
  let { form } = $props()

  let codeVerified = $derived(form?.codeVerified === true)
  let isNewOrg = $derived(form?.mode === "new")
  let isJoinOrg = $derived(form?.mode === "join")
  let orgName = $derived(form?.orgName ?? "")
  let signupSuccess = $derived(form?.success === true)
</script>

<svelte:head>
  <title>Registrarse</title>
</svelte:head>

{#if signupSuccess}
  <h1 class="text-2xl font-bold mb-4">Revisa tu correo</h1>
  <p class="text-slate-600">
    Te enviamos un enlace de confirmación a <strong>{form?.email}</strong>.
  </p>
  <div class="text-l text-slate-800 mt-6">
    <a class="underline" href="/login/sign_in">Inicia sesión</a> después de confirmar.
  </div>

{:else if !codeVerified}
  <h1 class="text-2xl font-bold mb-6">Código de acceso</h1>
  <p class="text-sm text-slate-500 mb-4">
    Ingresa el código de tu organización o el código general "1234" para crear una nueva.
  </p>
  <form method="POST" action="?/verify" class="flex flex-col gap-4">
    <label class="form-control w-full">
      <span class="label-text">Código o slug de la organización</span>
      <input
        name="code"
        type="text"
        class="input input-bordered w-full mt-1"
        placeholder="Ej: 1234 o mi-restaurante-abc123"
        required
      />
    </label>
    {#if form?.codeError}
      <p class="text-error text-sm">{form.codeError}</p>
    {/if}
    <button type="submit" class="btn btn-primary w-full">
      Verificar
    </button>
  </form>
  <div class="text-l text-slate-800 mt-4">
    ¿Ya tienes cuenta? <a class="underline" href="/login/sign_in">Inicia sesión</a>.
  </div>

{:else if isNewOrg}
  <h1 class="text-2xl font-bold mb-6">Crear nueva organización</h1>
  <form method="POST" action="?/signup" class="flex flex-col gap-4">
    <input type="hidden" name="code" value="1234" />

    <label class="form-control w-full">
      <span class="label-text">Nombre de la organización</span>
      <input
        name="orgName"
        type="text"
        class="input input-bordered w-full mt-1"
        placeholder="Mi Empresa"
        required
      />
    </label>

    <label class="form-control w-full">
      <span class="label-text">Correo electrónico</span>
      <input
        name="email"
        type="email"
        class="input input-bordered w-full mt-1"
        placeholder="correo@ejemplo.com"
        required
      />
    </label>

    <label class="form-control w-full">
      <span class="label-text">Contraseña</span>
      <input
        name="password"
        type="password"
        class="input input-bordered w-full mt-1"
        placeholder="Mínimo 6 caracteres"
        minlength={6}
        required
      />
    </label>

    {#if form?.error}
      <p class="text-error text-sm">{form.error}</p>
    {/if}

    <button type="submit" class="btn btn-primary w-full">
      Crear cuenta
    </button>
  </form>
  <div class="text-l text-slate-800 mt-4">
    <a class="underline" href="/login/sign_up">Volver</a>
  </div>

{:else if isJoinOrg}
  <h1 class="text-2xl font-bold mb-6">Unirse a {orgName}</h1>
  <form method="POST" action="?/signup" class="flex flex-col gap-4">
    <input type="hidden" name="code" value={form?.code ?? ""} />

    <label class="form-control w-full">
      <span class="label-text">Correo electrónico</span>
      <input
        name="email"
        type="email"
        class="input input-bordered w-full mt-1"
        placeholder="correo@ejemplo.com"
        required
      />
    </label>

    <label class="form-control w-full">
      <span class="label-text">Contraseña</span>
      <input
        name="password"
        type="password"
        class="input input-bordered w-full mt-1"
        placeholder="Mínimo 6 caracteres"
        minlength={6}
        required
      />
    </label>

    {#if form?.error}
      <p class="text-error text-sm">{form.error}</p>
    {/if}

    <button type="submit" class="btn btn-primary w-full">
      Unirse
    </button>
  </form>
  <div class="text-l text-slate-800 mt-4">
    <a class="underline" href="/login/sign_up">Volver</a>
  </div>
{/if}
