import { redirect } from "@sveltejs/kit"
import type { PageServerLoad } from "./$types"

export const load: PageServerLoad = async ({ locals: { supabaseServiceRole, safeGetSession } }) => {
  const { session } = await safeGetSession()
  if (!session) redirect(303, "/login")

  const { data: workload, error } = await supabaseServiceRole
    .from("agent_workload")
    .select("*")
    .order("open_tickets", { ascending: false })

  if (error) {
    console.error("Error loading agent workload:", error)
    return { workload: [] }
  }

  return { workload }
}
