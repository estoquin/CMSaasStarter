<script lang="ts">
  import { getContext } from "svelte"
  import type { Writable } from "svelte/store"
  import SettingsModule from "../settings/settings_module.svelte"
  import PricingModule from "../../../../(marketing)/pricing/pricing_module.svelte"
  import {
    pricingPlans,
    defaultPlanId,
  } from "../../../../(marketing)/pricing/pricing_plans"

  let adminSection: Writable<string> = getContext("adminSection")
  adminSection.set("billing")

  let { data } = $props()

  let currentPlanId = $derived(data.currentPlanId ?? defaultPlanId)
  let currentPlanName = $derived(
    pricingPlans.find((x) => x.id === data.currentPlanId)?.name,
  )
</script>

<svelte:head>
  <title>Facturación</title>
</svelte:head>

<h1 class="text-2xl font-bold mb-2">
  {data.isActiveCustomer ? "Facturación" : "Seleccionar un Plan"}
</h1>
<div>
  Visita nuestra <a href="/pricing" target="_blank" class="link">página de precios</a> para más detalles.
</div>

{#if !data.isActiveCustomer}
  <div class="mt-8">
    <PricingModule {currentPlanId} callToAction="Seleccionar Plan" center={false} />
  </div>

  {#if data.hasEverHadSubscription}
    <div class="mt-10">
      <a href="/account/billing/manage" class="link">Ver facturas anteriores</a>
    </div>
  {/if}
{:else}
  <SettingsModule
    title="Suscripción"
    editable={false}
    fields={[
      {
        id: "plan",
        label: "Plan Actual",
        initialValue: currentPlanName || "",
      },
    ]}
    editButtonTitle="Gestionar Suscripción"
    editLink="/account/billing/manage"
  />
{/if}
