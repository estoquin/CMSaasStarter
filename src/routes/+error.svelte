<script>
  import "../app.css"
  import { page } from "$app/stores"

  const defaultMessage = "Algo salió mal. Por favor intenta de nuevo."
  let errorMessage = $derived($page?.error?.message
    ? ($page.error.status === 404 ? "Página no encontrada" : defaultMessage)
    : defaultMessage
  )
</script>

<div class="hero min-h-[100vh]">
  <div class="hero-content text-center">
    <div class="max-w-lg">
      <h1 class="text-5xl font-bold">Esto es embarazoso...</h1>
      <p class="py-6 text-2xl">{errorMessage}</p>
      <div>
        <a href="/" class="btn btn-primary btn-wide">Volver al Inicio</a>
      </div>
    </div>
  </div>
</div>
