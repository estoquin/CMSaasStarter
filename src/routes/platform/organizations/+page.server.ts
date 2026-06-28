import { redirect, fail } from "@sveltejs/kit"
import type { Actions, PageServerLoad } from "./$types"

export const load: PageServerLoad = async ({ locals: { supabaseServiceRole, safeGetSession } }) => {
  const { session } = await safeGetSession()
  if (!session) redirect(303, "/login")

  const { data: orgs, error } = await supabaseServiceRole
    .from("organizations")
    .select("id, name, slug, approved, created_at")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error loading orgs:", error)
    return { organizations: [] }
  }

  return { organizations: orgs ?? [] }
}

export const actions: Actions = {
  approve: async ({ request, locals: { supabaseServiceRole, safeGetSession } }) => {
    const { session } = await safeGetSession()
    if (!session) redirect(303, "/login")

    const fd = await request.formData()
    const orgId = fd.get("orgId") as string
    if (!orgId) return fail(400, { error: "ID de organización requerido" })

    const { error } = await supabaseServiceRole
      .from("organizations")
      .update({ approved: true })
      .eq("id", orgId)

    if (error) {
      console.error("Error approving org:", error)
      return fail(500, { error: "Error al aprobar la organización" })
    }

    return { success: true }
  },
}
