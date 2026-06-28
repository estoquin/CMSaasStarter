import { error, fail } from "@sveltejs/kit"
import type { PageServerLoad, Actions } from "./$types"
import { requireSession, deleteDetailAction } from "$lib/crud.server"

export const load: PageServerLoad = async (event) => {
  const { session, organization_id, role } = await requireSession(event)
  const orgFilter = (q: any) => { if (organization_id) q = q.eq("organization_id", organization_id); if (role !== "admin") q = q.eq("user_id", session.user.id); return q }
  const q1 = orgFilter(event.locals.supabaseServiceRole.from("components").select("*, ingredients(name, unit)")).eq("id", event.params.id)
  const { data: item, error: err } = await q1.single()
  if (err || !item) error(404, "No encontrado")

  const { data: latestPrice } = await orgFilter(event.locals.supabaseServiceRole.from("purchases").select("unit_cost, date")).eq("ingredient_id", item.ingredient_id).order("date", { ascending: false }).limit(1)

  const ingCost = latestPrice?.[0]?.unit_cost ?? 0
  const compUnitCost = item.yield_per_batch > 0 ? (ingCost * item.ingredient_qty_used) / item.yield_per_batch : 0

  const { data: ingredients } = await orgFilter(event.locals.supabaseServiceRole.from("ingredients").select("id, name, unit")).order("name")

  return {
    item,
    latestIngredientPrice: latestPrice?.[0] ?? null,
    componentUnitCost: compUnitCost,
    ingredients: ingredients ?? [],
  }
}

export const actions: Actions = {
  update: async (event) => {
    const { session, organization_id, role } = await requireSession(event)
    const fd = await event.request.formData()
    const name = String(fd.get("name") ?? "")
    const unit = String(fd.get("unit") ?? "")
    const ingredient_id = String(fd.get("ingredient_id") ?? "")
    const ingredient_qty_used = parseFloat(String(fd.get("ingredient_qty_used") ?? "0"))
    const yield_per_batch = parseInt(String(fd.get("yield_per_batch") ?? "0"))
    if (!name.trim()) return fail(400, { errorMessage: "El nombre es obligatorio" })
    if (!unit.trim()) return fail(400, { errorMessage: "La unidad es obligatoria" })
    if (!ingredient_id) return fail(400, { errorMessage: "El ingrediente es obligatorio" })
    if (ingredient_qty_used <= 0) return fail(400, { errorMessage: "La cantidad usada debe ser > 0" })
    if (yield_per_batch <= 0) return fail(400, { errorMessage: "El rendimiento debe ser > 0" })
    let q = event.locals.supabaseServiceRole.from("components").update({ name: name.trim(), unit: unit.trim(), ingredient_id, ingredient_qty_used, yield_per_batch, updated_at: new Date().toISOString() }).eq("id", event.params.id)
    if (organization_id) q = q.eq("organization_id", organization_id)
    if (role !== "admin") q = q.eq("user_id", session.user.id)
    const { error: err } = await q
    if (err) return fail(500, { errorMessage: "Error al actualizar" })
    return { success: true }
  },
  delete: deleteDetailAction("components", "/account/cost-calculator/components"),
}
