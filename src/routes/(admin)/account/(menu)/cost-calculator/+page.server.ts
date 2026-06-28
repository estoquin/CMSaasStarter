import { redirect } from "@sveltejs/kit"
import type { PageServerLoad } from "./$types"

export const load: PageServerLoad = async ({ locals: { supabaseServiceRole, safeGetSession } }) => {
  const { session, organization_id, role } = await safeGetSession()
  if (!session) redirect(303, "/login")
  const orgFilter = (q: any) => { if (organization_id) q = q.eq("organization_id", organization_id); if (role !== "admin") q = q.eq("user_id", session.user.id); return q }
  const { data: costs, error: err1 } = await orgFilter(supabaseServiceRole.from("menu_item_costs").select("*")).order("menu_item_name")
  if (err1) { console.error("Error loading costs:", err1) }
  const { data: ingredients, error: err2 } = await orgFilter(supabaseServiceRole.from("ingredients").select("id, name, unit"))
  if (err2) { console.error("Error loading ingredients:", err2) }
  const { data: components, error: err4 } = await orgFilter(supabaseServiceRole.from("components").select("id, name"))
  if (err4) { console.error("Error loading components:", err4) }
  const { data: purchases, error: err3 } = await orgFilter(supabaseServiceRole.from("purchases").select("id, ingredient_id, date, quantity_bought, total_paid, unit_cost")).order("date", { ascending: false }).limit(50)
  if (err3) { console.error("Error loading purchases:", err3) }
  return { costs: costs ?? [], ingredients: ingredients ?? [], components: components ?? [], purchases: purchases ?? [] }
}
