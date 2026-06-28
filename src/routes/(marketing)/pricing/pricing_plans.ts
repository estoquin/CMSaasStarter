export const defaultPlanId = "free"

export type PricingPlan = {
  id: string
  name: string
  description: string
  price: string
  priceIntervalName: string
  stripe_price_id: string | null
  stripe_product_id?: string
  features: string[]
}

export const pricingPlans: PricingPlan[] = [
  {
    id: "free",
    name: "Free",
    description: "¡Un plan gratuito para empezar!",
    price: "$0",
    priceIntervalName: "por mes",
    stripe_price_id: null,
    features: ["Licencia MIT", "Rendimiento Rápido", "Integración con Stripe"],
  },
  {
    id: "pro",
    name: "Pro",
    description:
      "Un plan para probar la experiencia de compra. Intenta comprarlo con la tarjeta de prueba 4242424242424242.",
    price: "$5",
    priceIntervalName: "por mes",
    stripe_price_id: "price_1NkdZCHMjzZ8mGZnRSjUm4yA",
    stripe_product_id: "prod_OXj1CcemGMWOlU",
    features: [
      "Todo lo de Gratuito",
      "Apóyanos con dinero ficticio",
      "Prueba la experiencia de compra",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description:
      "Un plan para probar la experiencia de actualización. Intenta comprarlo con la tarjeta de prueba 4242424242424242.",
    price: "$15",
    priceIntervalName: "por mes",
    stripe_price_id: "price_1Nkda2HMjzZ8mGZn4sKvbDAV",
    stripe_product_id: "prod_OXj20YNpHYOXi7",
    features: [
      "Todo lo de Pro",
      "Prueba la UX de 'actualizar plan'",
      "¡Sigue siendo gratis!",
    ],
  },
]
