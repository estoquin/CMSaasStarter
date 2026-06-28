<script lang="ts">
  import PricingModule from "./pricing_module.svelte"
  import { WebsiteName } from "./../../../config"

  type PlanFeatureRow = {
    name: string
    freeIncluded?: boolean
    proIncluded?: boolean
    freeString?: string
    proString?: string
    header?: boolean
  }

  const planFeatures: PlanFeatureRow[] = [
    {
      name: "Sección 1",
      header: true,
    },
    {
      name: "Característica 1",
      freeIncluded: true,
      proIncluded: true,
    },
    {
      name: "Característica 2",
      freeIncluded: false,
      proIncluded: true,
    },
    {
      name: "Característica 3",
      freeString: "3",
      proString: "Ilimitado",
    },
    {
      name: "Sección 2",
      header: true,
    },
    {
      name: "Característica 4",
      freeIncluded: true,
      proIncluded: true,
    },
    {
      name: "Característica 5",
      freeIncluded: false,
      proIncluded: true,
    },
  ]
</script>

<svelte:head>
  <title>Precios</title>
  <meta name="description" content="Precios - {WebsiteName}" />
</svelte:head>

<div class="min-h-[70vh] pb-8 pt-[5vh] px-4">
  <h1 class="text-3xl font-bold text-center">Precios</h1>
  <h2 class="text-xl text-center text-slate-500 mt-1 pb-3">
    Completamente gratis, escala a millones de usuarios
  </h2>

  <div class="w-full my-8">
    <PricingModule callToAction="Comenzar" highlightedPlanId="pro" />
    <h1 class="text-2xl font-bold text-center mt-24">Preguntas Frecuentes</h1>
    <div class="flex place-content-center">
      <div class="join join-vertical max-w-xl py-6 mx-auto">
        <div class="collapse collapse-arrow join-item border border-primary">
          <input type="radio" name="faq-accordion" />
          <div class="collapse-title text-lg font-medium">
            ¿Esta plantilla es gratuita?
          </div>
          <div class="collapse-content">
            <p>¡Sí! Esta plantilla es gratuita para cualquier proyecto.</p>
          </div>
        </div>
        <div class="collapse collapse-arrow join-item border border-primary">
          <input type="radio" name="faq-accordion" />
          <div class="collapse-title text-lg font-medium">
            ¿Por qué una plantilla gratuita tiene una página de precios?
          </div>
          <div class="collapse-content">
            <p>
              La página de precios es parte de la plantilla base. Muestra cómo la
              página de precios se integra con el portal de facturación y los
              flujos de Stripe Checkout.
            </p>
          </div>
        </div>
        <div class="collapse collapse-arrow join-item border border-primary">
          <input type="radio" name="faq-accordion" />
          <div class="collapse-title text-lg font-medium">
            ¿Bajo qué licencia está la plantilla?
          </div>
          <div class="collapse-content">
            <p>La plantilla está bajo la licencia MIT.</p>
          </div>
        </div>
        <div class="collapse collapse-arrow join-item border border-primary">
          <input type="radio" name="faq-accordion" />
          <div class="collapse-title text-lg font-medium">
            ¿Puedo probar los flujos de compra sin una tarjeta de crédito real?
          </div>
          <div class="collapse-content">
            <p>
              Nuestra página demo <a href="https://saasstarter.work" class="link"
                >SaasStarter.work</a
              > tiene una página demo funcional, usando el entorno de prueba de Stripe.
            </p>
            <p class="mt-4">
              Puedes usar el número de tarjeta 4242 4242 4242 4242 con cualquier
              fecha de vencimiento futura para probar los flujos de pago y mejora.
            </p>
          </div>
        </div>
      </div>
    </div>

    <svg style="display:none" version="2.0">
      <defs>
        <symbol
          id="checkcircle"
          viewBox="0 0 24 24"
          stroke-width="2"
          fill="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path
            d="M16.417 10.283A7.917 7.917 0 1 1 8.5 2.366a7.916 7.916 0 0 1 7.917 7.917zm-4.105-4.498a.791.791 0 0 0-1.082.29l-3.828 6.63-1.733-2.08a.791.791 0 1 0-1.216 1.014l2.459 2.952a.792.792 0 0 0 .608.285.83.83 0 0 0 .068-.003.791.791 0 0 0 .618-.393L12.6 6.866a.791.791 0 0 0-.29-1.081z"
          />
        </symbol>
      </defs>
    </svg>

    <svg style="display:none" version="2.0">
      <defs>
        <symbol id="nocircle" viewBox="0 0 24 24" fill="currentColor">
          <path
            d="M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Zm4,11H8a1,1,0,0,1,0-2h8a1,1,0,0,1,0,2Z"
          />
        </symbol>
      </defs>
    </svg>

    <h1 class="text-2xl font-bold text-center mt-16">Características del Plan</h1>
    <h2 class="text-xl text-center text-slate-500 mt-1 pb-3">
      Tabla de ejemplo de características
    </h2>

    <div class="overflow-visible mx-auto max-w-xl mt-4">
      <table class="table">
        <thead
          class="text-lg sticky top-0 bg-base-100 bg-opacity-50 z-10 backdrop-blur-sm"
        >
          <tr>
            <th></th>
            <th class="text-center">Gratis</th>
            <th class="text-center">Pro</th>
          </tr>
        </thead>
        <tbody>
          {#each planFeatures as feature}
            {#if feature.header}
              <tr class="bg-base-200 font-bold">
                <td colspan="3">{feature.name} </td>
              </tr>
            {:else}
              <tr class="relative">
                <td>{feature.name} </td>
                <td class="text-center">
                  {#if feature.freeString}
                    {feature.freeString}
                  {:else if feature.freeIncluded}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="w-8 h-8 ml-2 inline text-success"
                    >
                      <use href="#checkcircle" />
                    </svg>
                  {:else}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="w-[26px] h-[26px] inline text-base-200"
                    >
                      <use href="#nocircle" />
                    </svg>
                  {/if}
                </td>
                <td class="text-center">
                  {#if feature.proString}
                    {feature.proString}
                  {:else if feature.proIncluded}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="w-8 h-8 ml-2 inline text-success"
                    >
                      <use href="#checkcircle" />
                    </svg>
                  {:else}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="w-[26px] h-[26px] inline text-base-200"
                    >
                      <use href="#nocircle" />
                    </svg>
                  {/if}
                </td>
              </tr>
            {/if}
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</div>
