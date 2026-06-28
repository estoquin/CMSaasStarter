import { fail, redirect } from "@sveltejs/kit"
import type { Actions, PageServerLoad } from "./$types"
import { requireOrg } from "$lib/habits"

export const load: PageServerLoad = async ({ locals: { supabaseServiceRole, safeGetSession } }) => {
  const { session, organization_id } = await requireOrg(safeGetSession)

  const { data: habits, error } = await supabaseServiceRole
    .from("habits")
    .select("id, name, description, active, created_at")
    .eq("organization_id", organization_id)
    .order("name")

  if (error) console.error("[habits/catalog] load error:", error)
  return { habits: habits ?? [] }
}

export const actions: Actions = {
  create: async ({ request, locals: { supabaseServiceRole, safeGetSession } }) => {
    const { session, organization_id } = await requireOrg(safeGetSession)

    const fd = await request.formData()
    const name = fd.get("name") as string
    const description = fd.get("description") as string

    if (!name?.trim()) return fail(400, { error: "El nombre es obligatorio" })

    const { error } = await supabaseServiceRole.from("habits").insert({
      organization_id,
      name: name.trim(),
      description: description?.trim() || null,
    })

    if (error) return fail(500, { error: error.message })
    return { success: true }
  },

  toggleActive: async ({ request, locals: { supabaseServiceRole, safeGetSession } }) => {
    const { session, organization_id } = await requireOrg(safeGetSession)

    const fd = await request.formData()
    const id = fd.get("id") as string
    const active = fd.get("active") === "true"

    const { error } = await supabaseServiceRole
      .from("habits")
      .update({ active })
      .eq("id", id)
      .eq("organization_id", organization_id)

    if (error) return fail(500, { error: error.message })
    return { success: true }
  },
}
