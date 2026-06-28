import { fail } from "@sveltejs/kit"
import type { PageServerLoad, Actions } from "./$types"
import { requireSession } from "$lib/crud.server"

export const load: PageServerLoad = async (event) => {
  const { session, organization_id, role } = await requireSession(event)
  const orgFilter = (q: any) => { if (organization_id) q = q.eq("organization_id", organization_id); if (role !== "admin") q = q.eq("user_id", session.user.id); return q }
  const { data: items, error } = await orgFilter(event.locals.supabaseServiceRole.from("components").select("*, ingredients(name, unit)")).order("name")
  if (error) { console.error("Error loading components:", error); return { items: [], ingredients: [] } }
  const { data: ingredients } = await orgFilter(event.locals.supabaseServiceRole.from("ingredients").select("id, name, unit")).order("name")
  return { items, ingredients: ingredients ?? [] }
}

export const actions: Actions = {
  create: async (event) => {
    const { session, organization_id, role } = await requireSession(event)
    const fd = await event.request.formData()
    const name = fd.get("name") as string; const unit = fd.get("unit") as string
    const ingredient_id = fd.get("ingredient_id") as string
    const ingredient_qty_used = parseFloat(fd.get("ingredient_qty_used") as string)
    const yield_per_batch = parseInt(fd.get("yield_per_batch") as string)
    if (!name?.trim()) return fail(400, { errorMessage: "El nombre es obligatorio" })
    if (!unit?.trim()) return fail(400, { errorMessage: "La unidad es obligatoria" })
    if (!ingredient_id) return fail(400, { errorMessage: "El ingrediente es obligatorio" })
    if (!ingredient_qty_used || ingredient_qty_used <= 0) return fail(400, { errorMessage: "La cantidad usada debe ser > 0" })
    if (!yield_per_batch || yield_per_batch <= 0) return fail(400, { errorMessage: "El rendimiento debe ser > 0" })
    const insertData: Record<string, any> = { user_id: session.user.id, name: name.trim(), unit: unit.trim(), ingredient_id, ingredient_qty_used, yield_per_batch }; if (organization_id) insertData.organization_id = organization_id
    const { error } = await event.locals.supabaseServiceRole.from("components").insert(insertData)
    if (error) return fail(500, { errorMessage: "Error al crear" })
    return { success: true }
  },
  delete: async (event) => {
    const { session, organization_id, role } = await requireSession(event)
    const id = (await event.request.formData()).get("id") as string
    if (!id) return fail(400, { errorMessage: "ID obligatorio" })
    let q = event.locals.supabaseServiceRole.from("components").delete().eq("id", id)
    if (organization_id) q = q.eq("organization_id", organization_id)
    if (role !== "admin") q = q.eq("user_id", session.user.id)
    const { error } = await q
    if (error) return fail(500, { errorMessage: "Error al eliminar" })
    return { success: true }
  },
}
