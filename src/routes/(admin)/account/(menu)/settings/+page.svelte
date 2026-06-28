<script lang="ts">
  import { getContext } from "svelte"
  import type { Writable } from "svelte/store"
  import SettingsModule from "./settings_module.svelte"
  import PricingModule from "../../../../(marketing)/pricing/pricing_module.svelte"
  import { pricingPlans, defaultPlanId } from "../../../../(marketing)/pricing/pricing_plans"

  let adminSection: Writable<string> = getContext("adminSection")
  adminSection.set("settings")

  let { data } = $props()
  let profile = $derived(data.profile)
  let user = $derived(data.user)
  let currentPlanId = $derived(data.currentPlanId ?? defaultPlanId)
  let currentPlanName = $derived(pricingPlans.find((x) => x.id === data.currentPlanId)?.name)

  const tabs = ["Perfil", "Organización", "Facturación", "Tema"]
  let activeTab = $state("Perfil")

  const palettes = [
    { id: "green", label: "Verde", color: "#166534" },
    { id: "blue", label: "Azul", color: "#1d4ed8" },
    { id: "red", label: "Rojo", color: "#b91c1c" },
    { id: "orange", label: "Naranja", color: "#c2410c" },
  ]

  function parseTheme(theme: string): { palette: string; dark: boolean } {
    if (theme === "saasstartertheme") return { palette: "green", dark: false }
    if (theme === "saasstarterdark") return { palette: "green", dark: true }
    const parts = theme.split("-")
    const dark = parts[0] === "saasstarterdark"
    const palette = parts.slice(1).join("-")
    return { palette, dark }
  }

  function buildTheme(palette: string, dark: boolean): string {
    if (palette === "green") return dark ? "saasstarterdark" : "saasstartertheme"
    return dark ? `saasstarterdark-${palette}` : `saasstartertheme-${palette}`
  }

  let currentTheme = $state(
    typeof document !== "undefined"
      ? document.documentElement.getAttribute("data-theme") ?? "saasstartertheme"
      : "saasstartertheme"
  )
  let { palette: currentPalette, dark: isDark } = $derived(parseTheme(currentTheme))

  function setPalette(id: string) {
    currentTheme = buildTheme(id, isDark)
    document.documentElement.setAttribute("data-theme", currentTheme)
    localStorage.setItem("theme", currentTheme)
  }

  function toggleDark() {
    currentTheme = buildTheme(currentPalette, !isDark)
    document.documentElement.setAttribute("data-theme", currentTheme)
    localStorage.setItem("theme", currentTheme)
  }
</script>

<svelte:head><title>Configuración</title></svelte:head>

<h1 class="text-sm font-bold mb-4">Configuración</h1>

<div class="tabs tabs-bordered mb-8 border-b border-gray-300">
  {#each tabs as tab}
    <button class="tab tab-sm {activeTab === tab ? 'tab-active text-primary' : ''}" onclick={() => activeTab = tab}>{tab}</button>
  {/each}
</div>

{#if activeTab === "Perfil"}
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
    <div class="[&>:first-child]:max-w-none">
      <SettingsModule
        title="Perfil"
        editable={false}
        fields={[
          { id: "fullName", label: "Nombre", initialValue: profile?.full_name ?? "" },
          { id: "companyName", label: "Nombre de la Empresa", initialValue: profile?.company_name ?? "" },
          { id: "website", label: "Sitio Web", initialValue: profile?.website ?? "" },
        ]}
        editButtonTitle="Editar Perfil"
        editLink="/account/settings/edit_profile"
      />
    </div>

    <div class="card p-5 pb-6 flex flex-col md:flex-row border border-gray-300">
      <div class="text-sm font-bold mb-3 w-48 md:pr-8 flex-none">Cuenta</div>
      <div class="w-full min-w-48">
        <div class="flex items-center justify-between mb-3">
          <div><span class="text-xs text-gray-500">Correo Electrónico</span><div class="text-sm mt-0.5">{user?.email || ""}</div></div>
          <a href="/account/settings/change_email" class="btn btn-outline btn-xs">Editar</a>
        </div>
        <div class="flex items-center justify-between mb-3">
          <div><span class="text-xs text-gray-500">Contraseña</span><div class="text-sm mt-0.5">••••••••••••••••</div></div>
          <a href="/account/settings/change_password" class="btn btn-outline btn-xs">Editar</a>
        </div>
        <div class="flex items-center justify-between mb-3">
          <div><span class="text-xs text-gray-500">Suscripciones de Correo</span><div class="text-sm mt-0.5">{profile?.unsubscribed ? "No suscrito" : "Suscrito"}</div></div>
          <a href="/account/settings/change_email_subscription" class="btn btn-outline btn-xs">Editar</a>
        </div>
      </div>
    </div>
  </div>

  <SettingsModule
    title="Zona Peligrosa"
    editable={false}
    dangerous={true}
    fields={[]}
    editButtonTitle="Eliminar Cuenta"
    editLink="/account/settings/delete_account"
  />

{:else if activeTab === "Organización"}
  <SettingsModule
    title="Organización"
    editable={false}
    fields={[
      { id: "companyName", label: "Nombre de la Empresa", initialValue: profile?.company_name ?? "" },
      { id: "website", label: "Sitio Web", initialValue: profile?.website ?? "" },
    ]}
    editButtonTitle="Editar Organización"
    editLink="/account/settings/edit_profile"
  />

  <div class="card p-6 pb-7 mt-8 max-w-xl border border-gray-300">
    <div class="text-sm font-bold mb-3 w-48 flex-none">Configuración de la Organización</div>
    <p class="text-base-content/60 text-sm">Más opciones de organización próximamente.</p>
  </div>

{:else if activeTab === "Facturación"}
  {#if !data.isActiveCustomer}
    <div class="mt-4">
      <PricingModule {currentPlanId} callToAction="Seleccionar Plan" center={false} />
    </div>
    {#if data.hasEverHadSubscription}
      <div class="mt-6">
        <a href="/account/billing/manage" class="link">Ver facturas anteriores</a>
      </div>
    {/if}
  {:else}
    <SettingsModule
      title="Suscripción"
      editable={false}
      fields={[{ id: "plan", label: "Plan Actual", initialValue: currentPlanName || "" }]}
      editButtonTitle="Gestionar Suscripción"
      editLink="/account/billing/manage"
    />
  {/if}

{:else if activeTab === "Tema"}
  <div class="card p-6 pb-7 mt-4 max-w-xl border border-gray-300">
    <div class="text-sm font-bold mb-3">Tema</div>
    <div class="mb-4">
      <span class="font-medium block mb-3">Paleta de Colores</span>
      <div class="flex gap-2">
        {#each palettes as p}
          <button
            class="w-9 h-9 rounded-full
              {currentPalette === p.id ? 'ring-2 ring-base-content ring-offset-2' : 'ring-1 ring-base-content/20'}"
            style="background-color: {p.color}"
            aria-label={p.label}
            title={p.label}
            onclick={() => setPalette(p.id)}
          ></button>
        {/each}
      </div>
    </div>
    <div class="flex items-center justify-between py-3 border-t border-base-300">
      <div><span class="font-medium">Modo Oscuro</span><p class="text-sm text-base-content/60">Alterna entre tema claro y oscuro</p></div>
      <input type="checkbox" class="toggle toggle-primary" checked={isDark} onchange={toggleDark} />
    </div>
  </div>
{/if}
