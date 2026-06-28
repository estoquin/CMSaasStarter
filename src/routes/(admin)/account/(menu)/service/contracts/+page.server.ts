import { fail } from "@sveltejs/kit"
import type { PageServerLoad, Actions } from "./$types"
import { requireSession } from "$lib/crud.server"

export const load: PageServerLoad = async (event) => {
  const { session, organization_id, role } = await requireSession(event)
  const orgFilter = (q: any) => { if (organization_id) q = q.eq("organization_id", organization_id); if (role !== "admin") q = q.eq("user_id", session.user.id); return q }
  const [contractsRes, accountsRes, slasRes] = await Promise.all([
    orgFilter(event.locals.supabaseServiceRole.from("service_contracts").select("*, account:account_id(name), sla:sla_id(name, response_hours, resolution_hours)")).order("created_at", { ascending: false }),
    orgFilter(event.locals.supabaseServiceRole.from("accounts").select("id, name")).order("name"),
    event.locals.supabaseServiceRole.from("slas").select("*").order("name"),
  ])
  return {
    contracts: contractsRes.data ?? [],
    accounts: accountsRes.data ?? [],
    slas: slasRes.data ?? [],
  }
}

export const actions: Actions = {
  create: async (event) => {
    const { session, organization_id, role } = await requireSession(event)
    const fd = await event.request.formData()
    const account_id = String(fd.get("account_id") ?? "")
    const sla_id = String(fd.get("sla_id") ?? "")
    const start_date = String(fd.get("start_date") ?? "")
    if (!account_id || !sla_id || !start_date) return fail(400, { errorMessage: "Todos los campos son obligatorios" })
    const { error: err } = await event.locals.supabaseServiceRole.from("service_contracts").insert({
      account_id, sla_id, start_date, organization_id, end_date: String(fd.get("end_date") ?? "") || null,
    })
    if (err) return fail(500, { errorMessage: "Error al crear contrato" })
    return { success: true }
  },
}
