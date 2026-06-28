<script lang="ts">
  import { getContext } from "svelte"
  import type { Writable } from "svelte/store"
  import { appVisibility } from "$lib/stores/appVisibility"
  import { page } from "$app/stores"
  import { habitsRoute } from "$lib/habits"

  let adminSection: Writable<string> = getContext("adminSection")
  adminSection.set("home")

  let now = $state(new Date())
  $effect(() => {
    const id = setInterval(() => now = new Date(), 1000)
    return () => clearInterval(id)
  })
  const formattedDate = $derived(
    now.toLocaleDateString("es-ES", {
      weekday: "long", year: "numeric", month: "long", day: "numeric"
    }).replace(/^\w/, c => c.toUpperCase())
  )
  const formattedTime = $derived(
    now.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })
  )

  const apps = $derived([
    { id: "crm", name: "CRM", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z", href: "/account/crm", visible: $appVisibility.crm },
    { id: "erp", name: "ERP", icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4", href: "/account/accounts", visible: $appVisibility.erp },
    { id: "cost-calculator", name: "Calculadora de Costos", icon: "M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z", href: "/account/cost-calculator", visible: $appVisibility.costCalculator },
    { id: "service", name: "Servicio", icon: "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z", href: "/account/service", visible: $appVisibility.service },
    { id: "habits", name: "Hábitos", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4", href: habitsRoute.root, visible: $appVisibility.habits }
  ])
</script>

<svelte:head>
  <title>Panel Principal</title>
</svelte:head>

<h1 class="text-2xl font-bold mb-1">{formattedDate}</h1>
<p class="text-lg text-gray-500 mb-6">{formattedTime}</p>

<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
  {#each apps as app}
    {#if app.visible}
      <a
        href={app.href}
        class="card bg-base-100 border border-gray-300 hover:shadow-lg hover:border-primary transition-all duration-200"
      >
        <div class="card-body items-center text-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-primary mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d={app.icon} />
          </svg>
          <h2 class="card-title text-xl">{app.name}</h2>
        </div>
      </a>
    {/if}
  {/each}
</div>

<hr class="my-8 border-gray-300" />
