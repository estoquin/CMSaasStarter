<script lang="ts">import { getContext } from "svelte"; import type { Writable } from "svelte/store"
let adminSection: Writable<string> = getContext("adminSection"); adminSection.set("cost-calculator")
let { data } = $props()
</script>
<svelte:head><title>Calculadora de Costos</title></svelte:head>

<div class="flex justify-between items-center mb-4 p-3 border border-gray-300"><h1 class="text-2xl font-bold">Panel de Calculadora de Costos</h1></div>

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
  <div class="p-4 border border-gray-300"><span class="text-base-content/60 block text-xs uppercase tracking-wide">Productos del Menú</span><span class="text-2xl font-bold">{data.costs.length}</span></div>
  <div class="p-4 border border-gray-300"><span class="text-base-content/60 block text-xs uppercase tracking-wide">Ingredientes</span><span class="text-2xl font-bold">{data.ingredients.length}</span></div>
  <div class="p-4 border border-gray-300"><span class="text-base-content/60 block text-xs uppercase tracking-wide">Componentes</span><span class="text-2xl font-bold">{data.components.length}</span></div>
  <div class="p-4 border border-gray-300"><span class="text-base-content/60 block text-xs uppercase tracking-wide">Compras Registradas</span><span class="text-2xl font-bold">{data.purchases.length}</span></div>
</div>

<h2 class="text-lg font-semibold mb-3">Costos por Hamburguesa (por unidad)</h2>
<div class="overflow-x-auto border border-gray-300">
  {#if data.costs.length === 0}
    <div class="alert bg-base-200 max-w-md m-4"><span>Aún no hay productos. Crea productos e ingredientes primero, luego registra compras.</span></div>
  {:else}
    <table class="table">
      <thead><tr><th>Hamburguesa</th><th>Ingredientes</th><th>Costo Total</th></tr></thead>
      <tbody>
        {#each data.costs as item (item.menu_item_id)}
          <tr>
            <td><a href="/account/cost-calculator/menu-items/{item.menu_item_id}" class="link link-hover font-medium">{item.menu_item_name}</a></td>
            <td>{item.ingredient_count}</td>
            <td class="font-mono">${Number(item.total_cost).toFixed(2)}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
</div>

<h2 class="text-lg font-semibold mt-6 mb-3">Últimas Compras</h2>
<div class="overflow-x-auto border border-gray-300">
  {#if data.purchases.length === 0}
    <div class="alert bg-base-200 max-w-md m-4"><span>Aún no hay compras.</span></div>
  {:else}
    <table class="table">
      <thead><tr><th>Fecha</th><th>Ingrediente</th><th>Cant.</th><th>Pagado</th><th>Costo Unitario</th></tr></thead>
      <tbody>
        {#each data.purchases as p (p.id)}
          <tr>
            <td>{p.date}</td>
            <td>{p.ingredient_id.slice(0,8)}…</td>
            <td>{Number(p.quantity_bought).toFixed(2)}</td>
            <td>${Number(p.total_paid).toFixed(2)}</td>
            <td class="font-mono">${Number(p.unit_cost).toFixed(4)}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
</div>
