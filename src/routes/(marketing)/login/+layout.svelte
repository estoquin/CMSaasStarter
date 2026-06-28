<script lang="ts">
  import { WebsiteName } from "../../../config"

  interface Props {
    children?: import("svelte").Snippet
  }

  let { children }: Props = $props()
  let isEurope = $state(false)
  try {
    isEurope = Intl.DateTimeFormat()
      .resolvedOptions()
      .timeZone.startsWith("Europe/")
  } catch {
    /* continue */
  }
</script>

<div class="flex min-h-dvh">
  <div class="flex-1 flex flex-col items-center justify-center p-8">
    <a href="/" class="text-2xl font-bold mb-8 text-primary">{WebsiteName}</a>
    <div class="flex flex-col w-64 lg:w-80 text-center">
      {@render children?.()}
      <div class="mt-8 {isEurope ? 'block' : 'hidden'}">
        🍪 Iniciar sesión usa Cookies 🍪
      </div>
    </div>
  </div>
  <div class="flex-1 hidden md:block bg-cover bg-center" style="background-image: url(/images/banner.jpg);"></div>
</div>
