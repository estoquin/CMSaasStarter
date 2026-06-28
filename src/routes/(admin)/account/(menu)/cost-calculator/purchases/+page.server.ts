import { fail } from "@sveltejs/kit"
import type { PageServerLoad, Actions } from "./$types"
import { requireSession } from "$lib/crud.server"

export const load: PageServerLoad = async (event) => {
  const { session, organization_id, role } = await requireSession(event)
  const orgFilter = (q: any) => { if (organization_id) q = q.eq("organization_id", organization_id); if (role !== "admin") q = q.eq("user_id", session.user.id); return q }
  const { data: items, error } = await orgFilter(event.locals.supabaseServiceRole.from("purchases").select("*, ingredients(name, unit)")).order("date", { ascending: false })
  if (error) { console.error("Error loading purchases:", error); return { items: [], ingredients: [] } }
  const { data: ingredients } = await orgFilter(event.locals.supabaseServiceRole.from("ingredients").select("id, name, unit")).order("name")
  return { items, ingredients: ingredients ?? [] }
}

export const actions: Actions = {
  create: async (event) => {
    const { session, organization_id, role } = await requireSession(event)
    const fd = await event.request.formData()
    const ingredient_id = fd.get("ingredient_id") as string
    const date = fd.get("date") as string
    const quantity_bought = parseFloat(fd.get("quantity_bought") as string)
    const total_paid = parseFloat(fd.get("total_paid") as string)
    if (!ingredient_id) return fail(400, { errorMessage: "El ingrediente es obligatorio" })
    if (!quantity_bought || quantity_bought <= 0) return fail(400, { errorMessage: "La cantidad debe ser > 0" })
    if (isNaN(total_paid) || total_paid < 0) return fail(400, { errorMessage: "El total pagado debe ser >= 0" })
    const { error } = await event.locals.supabaseServiceRole.from("purchases").insert({ user_id: session.user.id, organization_id, ingredient_id, date: date || new Date().toISOString().slice(0,10), quantity_bought, total_paid })
    if (error) return fail(500, { errorMessage: "Error al crear" })
    return { success: true }
  },
}
