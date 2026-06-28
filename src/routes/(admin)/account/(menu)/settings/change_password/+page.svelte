<script lang="ts">
  import { page } from "$app/stores"
  import { getContext } from "svelte"
  import type { Writable } from "svelte/store"
  import SettingsModule from "../settings_module.svelte"

  let adminSection: Writable<string> = getContext("adminSection")
  adminSection.set("settings")

  let { data } = $props()
  let user = $derived(data.user)
  let supabase = $derived(data.supabase)

  // True if definitely has a password, but can be false if they
  // logged in with oAuth or email link
  // Supabase does not maintain an AMR typedef so we cast through any
  let amr: { method: string }[] | undefined = $derived(
    (user as unknown as Record<string, unknown>)?.amr as
      | { method: string }[]
      | undefined,
  )
  let hasPassword = $derived(
    amr?.find((x) => x.method === "password") ? true : false,
  )
  let usingOAuth = $derived(
    amr?.find((x) => x.method === "oauth") ? true : false,
  )

  let sendBtnDisabled = $state(false)
  let sendBtnText = $state("Enviar correo para establecer contraseña")
  let sentEmail = $state(false)
  let sendForgotPassword = () => {
    sendBtnDisabled = true
    sendBtnText = "Enviando..."

    let email = user?.email
    if (email) {
      supabase.auth
        .resetPasswordForEmail(email, {
          redirectTo: `${$page.url.origin}/auth/callback?next=%2Faccount%2Fsettings%2Freset_password`,
        })
        .then((d) => {
          sentEmail = d.error ? false : true
          sendBtnDisabled = false
          sendBtnText = "Enviar correo de restablecimiento"
        })
    }
  }
</script>

<svelte:head>
  <title>Cambiar Contraseña</title>
</svelte:head>

<h1 class="text-2xl font-bold mb-6">Cambiar Contraseña</h1>

{#if hasPassword}
  <SettingsModule
    title="Cambiar Contraseña"
    editable={true}
    saveButtonTitle="Cambiar Contraseña"
    successTitle="Contraseña Cambiada"
    successBody="En el próximo inicio de sesión, usa tu nueva contraseña."
    formTarget="/account/api?/updatePassword"
    fields={[
      {
        id: "newPassword1",
        label: "Nueva Contraseña",
        initialValue: "",
        inputType: "password",
      },
      {
        id: "newPassword2",
        label: "Confirmar Nueva Contraseña",
        initialValue: "",
        inputType: "password",
      },
      {
        id: "currentPassword",
        label: "Contraseña Actual",
        initialValue: "",
        inputType: "password",
      },
    ]}
  />
{:else}
  <div
    class="card p-6 pb-7 mt-8 max-w-xl flex flex-col md:flex-row shadow-sm max-w-md"
  >
    <div class="flex flex-col gap-y-4">
      {#if usingOAuth}
        <div class="font-bold">Establecer Contraseña por Correo Electrónico</div>
        <div>
          Usas oAuth para iniciar sesión ("Iniciar sesión con Github" o similar). ¡Puedes
          continuar accediendo a tu cuenta usando solo oAuth si lo deseas!
        </div>
      {:else}
        <div class="font-bold">Cambiar Contraseña por Correo Electrónico</div>
      {/if}
      <div>
        El botón de abajo te enviará un correo a {user?.email} que te permitirá
        establecer tu contraseña.
      </div>
      <button
        class="btn btn-outline btn-wide {sentEmail ? 'hidden' : ''}"
        disabled={sendBtnDisabled}
        onclick={sendForgotPassword}
      >
        {sendBtnText}
      </button>
      <div class="success alert alert-success {sentEmail ? '' : 'hidden'}">
        ¡Correo enviado! Revisa tu bandeja de entrada y usa el enlace para
        establecer tu contraseña.
      </div>
    </div>
  </div>
{/if}
