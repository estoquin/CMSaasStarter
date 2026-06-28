<script lang="ts">
  import { getContext } from "svelte"
  import type { Writable } from "svelte/store"

  let adminSection: Writable<string> = getContext("adminSection")
  adminSection.set("cost-calculator")
</script>

<svelte:head><title>Calculadora de Porciones</title></svelte:head>

<h1 class="text-2xl font-bold mb-2">Calculadora de Porciones</h1>
<p class="text-sm text-base-content/70 mb-6 max-w-lg">Algunos componentes de la hamburguesa no pueden calcularse manualmente, y hay que hacer un estimado basado en la compra de un ingrediente, y cuantas unidades se vendieron hasta que se acabaron</p>
