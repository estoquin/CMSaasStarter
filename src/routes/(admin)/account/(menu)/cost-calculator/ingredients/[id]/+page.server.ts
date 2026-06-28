import { error, fail } from "@sveltejs/kit"
import type { PageServerLoad, Actions } from "./$types"
import { requireSession, deleteDetailAction } from "$lib/crud.server"

export const load: PageServerLoad = async (event) => {
  const { session, organization_id, role } = await requireSession(event)
  const orgFilter = (q: any) => { if (organization_id) q = q.eq("organization_id", organization_id); if (role !== "admin") q = q.eq("user_id", session.user.id); return q }
  const q1 = orgFilter(event.locals.supabaseServiceRole.from("ingredients").select("*")).eq("id", event.params.id)
  const { data: item, error: err } = await q1.single()
  if (err || !item) error(404, "No encontrado")
  const { data: purchases } = await orgFilter(event.locals.supabaseServiceRole.from("purchases").select("*")).eq("ingredient_id", event.params.id).order("date", { ascending: false })
  const { data: latest } = await orgFilter(event.locals.supabaseServiceRole.from("purchases").select("unit_cost, date")).eq("ingredient_id", event.params.id).order("date", { ascending: false }).limit(1)
  return { item, purchases: purchases ?? [], latestPrice: latest?.[0] ?? null }
}

export const actions: Actions = {
  update: async (event) => {
    const { session, organization_id, role } = await requireSession(event)
    const fd = await event.request.formData()
    const name = String(fd.get("name") ?? ""); const unit = String(fd.get("unit") ?? "")
    if (!name.trim()) return fail(400, { errorMessage: "El nombre es obligatorio" })
    if (!unit.trim()) return fail(400, { errorMessage: "La unidad es obligatoria" })
    let q = event.locals.supabaseServiceRole.from("ingredients").update({ name: name.trim(), unit: unit.trim(), updated_at: new Date().toISOString() }).eq("id", event.params.id)
    if (organization_id) q = q.eq("organization_id", organization_id)
    if (role !== "admin") q = q.eq("user_id", session.user.id)
    const { error: err } = await q
    if (err) return fail(500, { errorMessage: "Error al actualizar" })
    return { success: true }
  },
  delete: deleteDetailAction("ingredients", "/account/cost-calculator/ingredients"),
}
