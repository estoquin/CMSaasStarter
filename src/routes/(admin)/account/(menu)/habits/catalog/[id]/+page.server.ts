import { error, fail, redirect } from "@sveltejs/kit"
import type { Actions, PageServerLoad } from "./$types"
import { requireOrg } from "$lib/habits"

export const load: PageServerLoad = async ({ params, locals: { supabaseServiceRole, safeGetSession } }) => {
  const { session, organization_id } = await requireOrg(safeGetSession)

  const { data: habit, error: habitErr } = await supabaseServiceRole
    .from("habits")
    .select("*")
    .eq("id", params.id)
    .eq("organization_id", organization_id)
    .single()

  if (habitErr || !habit) error(404, "Hábito no encontrado")
  return { habit }
}

export const actions: Actions = {
  update: async ({ request, params, locals: { supabaseServiceRole, safeGetSession } }) => {
    const { session, organization_id } = await requireOrg(safeGetSession)

    const fd = await request.formData()
    const name = fd.get("name") as string
    const description = fd.get("description") as string

    if (!name?.trim()) return fail(400, { error: "El nombre es obligatorio" })

    const { error: updateErr } = await supabaseServiceRole
      .from("habits")
      .update({ name: name.trim(), description: description?.trim() || null })
      .eq("id", params.id)
      .eq("organization_id", organization_id)

    if (updateErr) return fail(500, { error: updateErr.message })
    return { success: true }
  },
}
