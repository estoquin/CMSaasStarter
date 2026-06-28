import { redirect } from "@sveltejs/kit"
import type { PageServerLoad } from "./$types"

export const load: PageServerLoad = async ({ locals: { supabaseServiceRole, safeGetSession } }) => {
  const { session, organization_id, role } = await safeGetSession()
  if (!session) redirect(303, "/login")

  const orgFilter = (q: any) => { if (organization_id) q = q.eq("organization_id", organization_id); if (role !== "admin") q = q.eq("user_id", session.user.id); return q }

  const [openRes, ticketsRes] = await Promise.all([
    orgFilter(supabaseServiceRole.from("open_tickets").select("*")).order("opened_at", { ascending: false }),
    orgFilter(supabaseServiceRole.from("service_tickets").select("*")).order("opened_at", { ascending: false }),
  ])

  return {
    openTickets: openRes.data ?? [],
    tickets: ticketsRes.data ?? [],
  }
}
