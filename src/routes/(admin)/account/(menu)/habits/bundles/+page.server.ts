import { fail, redirect } from "@sveltejs/kit"
import type { Actions, PageServerLoad } from "./$types"
import { requireOrg } from "$lib/habits"

export const load: PageServerLoad = async ({ locals: { supabaseServiceRole, safeGetSession } }) => {
  const { session, organization_id } = await requireOrg(safeGetSession)

  const { data: bundles, error } = await supabaseServiceRole
    .from("habit_bundles")
    .select("id, name, description, start_date, end_date, active, created_at")
    .eq("organization_id", organization_id)
    .order("created_at", { ascending: false })

  if (error) console.error("[habits/bundles] load error:", error)
  return { bundles: bundles ?? [] }
}

export const actions: Actions = {
  create: async ({ request, locals: { supabaseServiceRole, safeGetSession } }) => {
    const { session, organization_id } = await requireOrg(safeGetSession)

    const fd = await request.formData()
    const name = fd.get("name") as string
    const description = fd.get("description") as string

    if (!name?.trim()) return fail(400, { error: "El nombre es obligatorio" })

    const { error } = await supabaseServiceRole.from("habit_bundles").insert({
      organization_id,
      name: name.trim(),
      description: description?.trim() || null,
      active: false,
    })

    if (error) return fail(500, { error: error.message })
    return { success: true }
  },

  setActive: async ({ request, locals: { supabaseServiceRole, safeGetSession } }) => {
    const { session, organization_id } = await requireOrg(safeGetSession)

    const fd = await request.formData()
    const id = fd.get("id") as string
    if (!id) return fail(400, { error: "ID requerido" })

    const { error: deactivateErr } = await supabaseServiceRole
      .from("habit_bundles")
      .update({ active: false })
      .eq("organization_id", organization_id)

    if (deactivateErr) return fail(500, { error: deactivateErr.message })

    const { error } = await supabaseServiceRole
      .from("habit_bundles")
      .update({ active: true })
      .eq("id", id)
      .eq("organization_id", organization_id)

    if (error) return fail(500, { error: error.message })
    return { success: true }
  },

  deactivate: async ({ request, locals: { supabaseServiceRole, safeGetSession } }) => {
    const { session, organization_id } = await requireOrg(safeGetSession)

    const fd = await request.formData()
    const id = fd.get("id") as string
    if (!id) return fail(400, { error: "ID requerido" })

    const { error } = await supabaseServiceRole
      .from("habit_bundles")
      .update({ active: false })
      .eq("id", id)
      .eq("organization_id", organization_id)

    if (error) return fail(500, { error: error.message })
    return { success: true }
  },

  delete: async ({ request, locals: { supabaseServiceRole, safeGetSession } }) => {
    const { session, organization_id } = await requireOrg(safeGetSession)

    const fd = await request.formData()
    const id = fd.get("id") as string
    if (!id) return fail(400, { error: "ID requerido" })

    const { error } = await supabaseServiceRole
      .from("habit_bundles")
      .delete()
      .eq("id", id)
      .eq("organization_id", organization_id)

    if (error) return fail(500, { error: error.message })
    return { success: true }
  },
}
