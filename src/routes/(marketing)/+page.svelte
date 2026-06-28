<script lang="ts">
  import {
    WebsiteName,
    WebsiteBaseUrl,
    WebsiteDescription,
  } from "./../../config"

  const ldJson = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: WebsiteName,
    url: WebsiteBaseUrl,
  }
  const jsonldScript = `<script type="application/ld+json">${
    JSON.stringify(ldJson) + "<"
  }/script>`

  const features = [
    {
      name: "Gratis para alojar",
      description:
        "Instrucciones incluidas para Cloudflare+Supabase. Gratis para empezar y rentable al escalar.",
      link: "https://github.com/CriticalMoments/CMSaasStarter?tab=readme-ov-file#suggested-hosting-stack",
      linkText: "Docs",
      newPage: true,
      svgContent: `<path d="M4.01207 15.7618L5.70156 10.6933C6.46758 8.39525 6.85059 7.24623 7.75684 7.03229C8.6631 6.81835 9.51953 7.67478 11.2324 9.38764L14.6114 12.7666C16.3242 14.4795 17.1807 15.3359 16.9667 16.2422C16.7528 17.1484 15.6038 17.5314 13.3057 18.2975L8.23724 19.987C5.47183 20.9088 4.08912 21.3697 3.35924 20.6398C2.62936 19.9099 3.09026 18.5272 4.01207 15.7618Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
<path d="M12.2351 18.3461C12.2351 18.3461 11.477 16.0649 11.477 14.5552C11.477 13.0454 12.2351 10.7643 12.2351 10.7643M8.06517 19.4833C8.06517 19.4833 7.42484 16.7314 7.307 14.9343C7.11229 11.965 8.06517 7.35254 8.06517 7.35254" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
<path d="M14.5093 10.0061L14.6533 9.28614C14.7986 8.55924 15.3224 7.96597 16.0256 7.73155C16.7289 7.49714 17.2526 6.90387 17.398 6.17697L17.542 5.45703" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
<path d="M17.5688 12.2533L17.7817 12.3762C18.4388 12.7556 19.265 12.6719 19.8327 12.1685C20.3468 11.7126 21.0789 11.597 21.7085 11.8723L22 11.9997" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
<path d="M10.5352 3C10.1977 3.55206 10.2823 4.26344 10.7399 4.72097L10.8377 4.81885C11.2309 5.21201 11.3759 5.78959 11.215 6.32182" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
<path d="M13.561 4.39648C13.7621 4.19542 13.8626 4.09489 13.9788 4.05804C14.0772 4.02688 14.1827 4.02688 14.281 4.05804C14.3973 4.09489 14.4978 4.19542 14.6989 4.39648C14.8999 4.59753 15.0004 4.69806 15.0373 4.8143C15.0685 4.91262 15.0685 5.01817 15.0373 5.11648C15.0004 5.23272 14.8999 5.33325 14.6989 5.53431C14.4978 5.73536 14.3973 5.83589 14.281 5.87274C14.1827 5.90391 14.0772 5.90391 13.9788 5.87274C13.8626 5.83589 13.7621 5.73536 13.561 5.53431C13.36 5.33325 13.2594 5.23272 13.2226 5.11648C13.1914 5.01817 13.1914 4.91262 13.2226 4.8143C13.2594 4.69806 13.36 4.59753 13.561 4.39648Z" fill="currentColor"/>
<path d="M19.4682 7.46822C19.7136 7.22283 19.8363 7.10014 19.9747 7.04681C20.1367 6.9844 20.3161 6.9844 20.4781 7.04681C20.6165 7.10014 20.7392 7.22283 20.9846 7.46822C21.23 7.71362 21.3527 7.83631 21.406 7.97472C21.4684 8.1367 21.4684 8.31609 21.406 8.47807C21.3527 8.61649 21.23 8.73918 20.9846 8.98457C20.7392 9.22996 20.6165 9.35266 20.4781 9.40599C20.3161 9.4684 20.1367 9.4684 19.9747 9.40599C19.8363 9.35266 19.7136 9.22996 19.4682 8.98457C19.2228 8.73918 19.1001 8.61649 19.0468 8.47807C18.9844 8.31609 18.9844 8.1367 19.0468 7.97472C19.1001 7.83631 19.2228 7.71362 19.4682 7.46822Z" fill="currentColor"/>
<path d="M6.92712 3.94079C7.13659 3.73132 7.47621 3.73132 7.68567 3.94079C7.89514 4.15026 7.89514 4.48988 7.68567 4.69935C7.47621 4.90882 7.13659 4.90882 6.92712 4.69935C6.71765 4.48988 6.71765 4.15026 6.92712 3.94079Z" fill="currentColor"/>
<path d="M19.058 15.3134C19.2674 15.1039 19.6071 15.1039 19.8165 15.3134C20.026 15.5228 20.026 15.8624 19.8165 16.0719C19.6071 16.2814 19.2674 16.2814 19.058 16.0719C18.8485 15.8624 18.8485 15.5228 19.058 15.3134Z" fill="currentColor"/>
<path d="M17.5 9.74145C17.7095 9.53198 18.0491 9.53198 18.2586 9.74145C18.468 9.95092 18.468 10.2905 18.2586 10.5C18.0491 10.7095 17.7095 10.7095 17.5 10.5C17.2905 10.2905 17.2905 9.95092 17.5 9.74145Z" fill="currentColor"/>`,
    },
    {
      name: "Autenticación de Usuarios",
      link: "/login",
      description:
        "Registro, cierre de sesión, recuperación de contraseña, verificación de correo y oAuth. Impulsado por Supabase Auth.",
      svgContent: `<path
                  d="M14.2084 13.5521C16.3025 13.5521 18 11.8615 18 9.77606C18 7.6906 16.3025 6 14.2084 6C12.1144 6 10.4169 7.6906 10.4169 9.77606C10.4169 10.742 10.8578 11.4446 10.8578 11.4446L6.27264 16.011C6.0669 16.2159 5.77886 16.7486 6.27264 17.2404L6.8017 17.7673C7.00743 17.9429 7.52471 18.1888 7.94796 17.7673L8.56519 17.1526C9.18242 17.7673 9.88782 17.416 10.1523 17.0647C10.5932 16.45 10.0642 15.8353 10.0642 15.8353L10.2405 15.6597C11.087 16.5027 11.8277 16.011 12.0922 15.6597C12.5331 15.045 12.0922 14.4303 12.0922 14.4303C11.9159 14.079 11.5632 14.079 12.004 13.64L12.5331 13.113C12.9564 13.4643 13.8264 13.5521 14.2084 13.5521Z"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linejoin="round"
                />
                <path
                  d="M22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C21.5093 4.43821 21.8356 5.80655 21.9449 8"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                />`,
    },
    {
      name: "Página de Precios",
      link: "/pricing",
      description:
        "Página de precios personalizable y rápida, integrada en el portal de facturación.",
      svgContent: `<path d="M12 6V18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
<path d="M15 9.5C15 8.11929 13.6569 7 12 7C10.3431 7 9 8.11929 9 9.5C9 10.8807 10.3431 12 12 12C13.6569 12 15 13.1193 15 14.5C15 15.8807 13.6569 17 12 17C10.3431 17 9 15.8807 9 14.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
<path d="M7 3.33782C8.47087 2.48697 10.1786 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 10.1786 2.48697 8.47087 3.33782 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`,
    },
  ]
</script>

<svelte:head>
  <title>{WebsiteName}</title>
  <meta name="description" content={WebsiteDescription} />
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  {@html jsonldScript}
</svelte:head>

<div class="hero min-h-[70vh]" style="background-image: url(/images/banner.jpg); background-size: cover; background-position: center;">
  <div class="hero-overlay bg-black/50"></div>
  <div class="hero-content text-center py-12 text-neutral-content">
    <div class="max-w-xl">
      <div
        class="text-4xl md:text-6xl font-bold px-2"
        style="line-height: 1.2;"
      >
        La
        <span
          class="underline decoration-secondary decoration-4 md:decoration-[6px]"
          >plantilla SaaS</span
        >
        de
        <span
          class="underline decoration-secondary decoration-4 md:decoration-[6px]"
          >código abierto</span
        >,
        <span
          class="underline decoration-secondary decoration-4 md:decoration-[6px]"
          >rápida</span
        >
        y
        <span
          class="underline decoration-secondary decoration-4 md:decoration-[6px]"
          >gratuita para alojar</span
        >
      </div>

      <div
        class="mt-6 md:mt-4 flex flex-row flex-wrap gap-4 place-content-center"
      >
        <a href="https://github.com/CriticalMoments/CMSaasStarter">
          <button class="btn btn-primary px-6">★ Danos estrella en Github</button>
        </a>
        <a
          href="https://github.com/CriticalMoments/CMSaasStarter/tree/main#saas-starter"
        >
          <button class="btn btn-outline btn-primary px-6">Leer Documentación</button
          >
        </a>
      </div>
    </div>
  </div>
</div>
<div class="min-h-[60vh]">
  <div class="pt-20 pb-8 px-7">
    <div class="max-w-lg mx-auto text-center">
      <div
        class="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-linear-to-r from-primary to-accent pb-2"
      >
        Explora las Funcionalidades
      </div>
      <div class="mt-4 text-xl font-bold">
        Y pruébalas en esta
        <span
          class="underline decoration-secondary decoration-[3px] md:decoration-[4px]"
        >
          demostración completamente funcional
        </span>
      </div>
    </div>

    <div
      class="flex gap-6 mt-12 max-w-[1064px] mx-auto place-content-center flex-wrap"
    >
      {#each features as feature}
        <div class="card bg-white w-[270px] min-h-[300px] flex-none border border-base-content/20">
          <div class="card-body items-center text-center p-[24px] pt-[32px]">
            <div>
              <svg
                width="50px"
                height="50px"
                class="mb-2 mt-1"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <!-- eslint-disable-next-line svelte/no-at-html-tags -->
                {@html feature.svgContent}
              </svg>
            </div>
            <h2 class="card-title">
              {feature.name}
            </h2>
            <p class="text-sm">
              {feature.description}
            </p>
            {#if feature.link}
              <a
                href={feature.link}
                class="pb-4"
                target={feature.newPage ? "_blank" : ""}
              >
                <button
                  class="btn btn-xs btn-outline rounded-full btn-primary min-w-[100px]"
                  >{feature.linkText ? feature.linkText : "Probar"}</button
                >
              </a>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>
<div class="hero min-h-[60vh] mt-12">
  <div class="hero-content text-center pb-16 pt-4 px-4">
    <div class="max-w-lg">
      <div
        class="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-linear-to-r from-primary to-accent mt-4 pb-2"
      >
        Ver en Acción
      </div>
      <div
        class="flex flex-col lg:flex-row mt-6 gap-6 place-content-center content-center"
      >
        <div class="hidden md:block">
          <a href="https://criticalmoments.io" target="_blank" class="link">
            <div class="mockup-browser border">
              <div class="mockup-browser-toolbar">
                <div class="input" style="background:var(--color-base-200);">
                  https://criticalmoments.io
                </div>
              </div>
              <div class="flex justify-center">
                <img
                  alt="Captura de la página principal de criticalmoments.io"
                  class="aspect-2044/1242"
                  src="/images/example-home.png"
                />
              </div>
            </div>
          </a>
        </div>
        <div class="md:hidden">
          <a href="https://criticalmoments.io" target="_blank" class="link">
            <div class="card shadow-xl border overflow-hidden">
              <img
                alt="Screenshot of criticalmoments.io homepage"
                class="aspect-2044/1242"
                src="/images/example-home.png"
              />
            </div></a
          >
        </div>
        <div class="min-w-[270px] lg:min-w-[420px] flex mt-6 lg:mt-0">
          <div class="my-auto">
            <div class="px-4 text-lg md:text-xl">
              <a href="https://criticalmoments.io" class="" target="_blank"
                >SaaS Starter fue creado por <span
                  class="font-bold whitespace-nowrap">Critical Moments</span
                >: un SDK para ayudar a aplicaciones móviles a
                <span class="underline decoration-secondary decoration-[3px]"
                  >aumentar las tasas de conversión y calificaciones.</span
                ></a
              >
            </div>
            <div class="px-4 mt-6 text-lg md:text-xl">
              Nuestra <a
                href="https://criticalmoments.io"
                class="link font-bold"
                target="_blank">página web</a
              > es el mejor ejemplo de SaaS Starter con estilo y contenido real.
            </div>
            <div class="mt-4 text-large">
              <a href="https://criticalmoments.io" target="_blank">
                <button class="btn btn-primary btn-wide mt-3"
                  >Ver en Acción</button
                >
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
