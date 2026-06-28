import { error, fail, redirect } from "@sveltejs/kit"
import type { Actions, PageServerLoad } from "./$types"
import { habitsRoute, requireOrg } from "$lib/habits"

export const load: PageServerLoad = async ({ params, locals: { supabaseServiceRole, safeGetSession } }) => {
  const { session, organization_id } = await requireOrg(safeGetSession)

  const { data: bundle, error: bundleError } = await supabaseServiceRole
    .from("habit_bundles")
    .select("*")
    .eq("id", params.id)
    .eq("organization_id", organization_id)
    .single()

  if (bundleError || !bundle) error(404, "Bundle no encontrado")

  const { data: items, error: itemsErr } = await supabaseServiceRole
    .from("habit_bundle_items")
    .select("habit_id, sort_order, habits(id, name)")
    .eq("bundle_id", bundle.id)
    .order("sort_order")

  if (itemsErr) console.error("[habits/bundles/[id]] items error:", itemsErr)

  const includedHabits = ((items ?? []) as Array<{ habit_id: string; sort_order: number | null; habits: { id: string; name: string } | null }>).map(i => ({
    id: i.habits?.id ?? i.habit_id,
    name: i.habits?.name ?? "—",
    sort_order: i.sort_order,
  }))

  return { bundle, includedHabits }
}

export const actions: Actions = {
  updateBundle: async ({ request, params, locals: { supabaseServiceRole, safeGetSession } }) => {
    const { session, organization_id } = await requireOrg(safeGetSession)

    const fd = await request.formData()
    const name = fd.get("name") as string
    const description = fd.get("description") as string
    const startDate = fd.get("start_date") as string
    const endDate = fd.get("end_date") as string

    if (!name?.trim()) return fail(400, { error: "El nombre es obligatorio" })

    const updates: Record<string, string | null> = { name: name.trim(), description: description?.trim() || null }
    if (startDate) updates.start_date = startDate
    if (endDate) updates.end_date = endDate || null

    const { error: updateError } = await supabaseServiceRole
      .from("habit_bundles")
      .update(updates)
      .eq("id", params.id)
      .eq("organization_id", organization_id)

    if (updateError) return fail(500, { error: updateError.message })
    return { success: true }
  },

  addHabit: async ({ request, params, locals: { supabaseServiceRole, safeGetSession } }) => {
    const { session, organization_id } = await requireOrg(safeGetSession)

    const fd = await request.formData()
    const habitId = fd.get("habitId") as string
    if (!habitId) return fail(400, { error: "Hábito requerido" })

    const { data: existing } = await supabaseServiceRole
      .from("habit_bundle_items")
      .select("id")
      .eq("bundle_id", params.id)
      .eq("habit_id", habitId)
      .maybeSingle()
    if (existing) return fail(409, { error: "El hábito ya está en el bundle" })

    const { data: sortData } = await supabaseServiceRole
      .from("habit_bundle_items")
      .select("sort_order")
      .eq("bundle_id", params.id)
      .order("sort_order", { ascending: false })
      .limit(1)
    const sortOrder = ((sortData ?? [])[0]?.sort_order ?? -1) + 1

    const { error: insertError } = await supabaseServiceRole
      .from("habit_bundle_items")
      .insert({ bundle_id: params.id, habit_id: habitId, sort_order: sortOrder })

    if (insertError) return fail(500, { error: insertError.message })
    return { success: true }
  },

  removeHabit: async ({ request, params, locals: { supabaseServiceRole, safeGetSession } }) => {
    const { session, organization_id } = await requireOrg(safeGetSession)

    const fd = await request.formData()
    const habitId = fd.get("habitId") as string

    const { error: deleteError } = await supabaseServiceRole
      .from("habit_bundle_items")
      .delete()
      .eq("bundle_id", params.id)
      .eq("habit_id", habitId)

    if (deleteError) return fail(500, { error: deleteError.message })
    return { success: true }
  },

  deactivate: async ({ params, locals: { supabaseServiceRole, safeGetSession } }) => {
    const { session, organization_id } = await requireOrg(safeGetSession)

    const { error: updateError } = await supabaseServiceRole
      .from("habit_bundles")
      .update({ active: false })
      .eq("id", params.id)
      .eq("organization_id", organization_id)

    if (updateError) return fail(500, { error: updateError.message })
    return { success: true }
  },

  delete: async ({ params, locals: { supabaseServiceRole, safeGetSession } }) => {
    const { session, organization_id } = await requireOrg(safeGetSession)

    const { error: deleteError } = await supabaseServiceRole
      .from("habit_bundles")
      .delete()
      .eq("id", params.id)
      .eq("organization_id", organization_id)

    if (deleteError) return fail(500, { error: deleteError.message })
    redirect(303, habitsRoute.bundles)
  },

  searchHabits: async ({ request, locals: { supabaseServiceRole, safeGetSession } }) => {
    const { session, organization_id } = await requireOrg(safeGetSession)

    const fd = await request.formData()
    const q = fd.get("q") as string
    if (!q?.trim()) return { results: [] }

    const { data: results, error: searchErr } = await supabaseServiceRole
      .from("habits")
      .select("id, name")
      .eq("organization_id", organization_id)
      .ilike("name", `%${q.trim()}%`)
      .order("name")
      .limit(20)

    if (searchErr) return fail(500, { error: searchErr.message })
    return { results: results ?? [] }
  },
}
