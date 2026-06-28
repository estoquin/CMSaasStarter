import { fail, redirect } from "@sveltejs/kit"
import type { Actions, PageServerLoad } from "./$types"
import { requireOrg } from "$lib/habits"

export const load: PageServerLoad = async ({ url, locals: { supabaseServiceRole, safeGetSession } }) => {
  const { session, organization_id } = await requireOrg(safeGetSession)

  const dateParam = url.searchParams.get("date")
  const bundleParam = url.searchParams.get("bundle")

  const { data: allBundles } = await supabaseServiceRole
    .from("habit_bundles")
    .select("id, name")
    .eq("organization_id", organization_id)
    .eq("active", true)
    .order("created_at", { ascending: false })

  const safeBundles: Array<{ id: string; name: string }> = allBundles ?? []
  const activeBundle = safeBundles.find((b) => b.id === bundleParam) ?? safeBundles[0] ?? null

  // Check-in edit view (date + bundle params present)
  if (dateParam && activeBundle) {
    const today = dateParam

    const { data: items } = await supabaseServiceRole
      .from("habit_bundle_items")
      .select("habit_id, sort_order, habits(id, name, description)")
      .eq("bundle_id", activeBundle.id)
      .order("sort_order")

    const itemList: Array<{ habit_id: string; sort_order: number | null; habits: { id: string; name: string; description: string | null } | null }> = items ?? []
    const habits = itemList.flatMap(i => i.habits ? [i.habits] : [])
    const habitIds = habits.map((h) => h.id)

    let existingRecords: Array<{ id: string; habit_id: string; completed: boolean | null; notes: string | null }> = []
    if (habitIds.length > 0) {
      const { data: records } = await supabaseServiceRole
        .from("habit_tracking_records")
        .select("id, habit_id, completed, notes")
        .eq("organization_id", organization_id)
        .eq("bundle_id", activeBundle.id)
        .eq("tracked_date", today)
      existingRecords = records ?? []
    }

    return {
      view: "edit",
      allBundles: safeBundles,
      activeBundle,
      habits,
      existingRecords,
      today,
    }
  }

  // List view (default)
  const today = new Date().toISOString().split("T")[0]

  let entries: Array<{ date: string; total: number; completed: number }> = []
  if (activeBundle) {
    const { data: summary } = await supabaseServiceRole
      .from("habit_tracking_records")
      .select("tracked_date, completed")
      .eq("organization_id", organization_id)
      .eq("bundle_id", activeBundle.id)
      .order("tracked_date", { ascending: false })

    if (summary) {
      const grouped: Record<string, { total: number; completed: number }> = {}
      for (const r of summary) {
        if (!grouped[r.tracked_date]) grouped[r.tracked_date] = { total: 0, completed: 0 }
        grouped[r.tracked_date].total++
        if (r.completed) grouped[r.tracked_date].completed++
      }
      entries = Object.entries(grouped).map(([date, stats]) => ({ date, ...stats }))
    }
  }

  return {
    view: "list",
    allBundles: safeBundles,
    activeBundle,
    entries,
    today,
  }
}

export const actions: Actions = {
  save: async ({ request, locals: { supabaseServiceRole, safeGetSession } }) => {
    const { session, organization_id } = await requireOrg(safeGetSession)

    const fd = await request.formData()
    const bundleId = fd.get("bundleId") as string
    const date = fd.get("date") as string
    if (!bundleId || !date) return fail(400, { error: "Datos incompletos" })

    const { data: bundle } = await supabaseServiceRole
      .from("habit_bundles")
      .select("id")
      .eq("id", bundleId)
      .eq("organization_id", organization_id)
      .maybeSingle()
    if (!bundle) return fail(403, { error: "Bundle no encontrado" })

    const completedHabits = new Set(JSON.parse(fd.get("completed") as string || "[]"))
    const habitNotes: Record<string, string> = JSON.parse(fd.get("notes") as string || "{}")

    const { data: items } = await supabaseServiceRole
      .from("habit_bundle_items")
      .select("habit_id")
      .eq("bundle_id", bundleId)
    const allHabitIds = ((items ?? []) as Array<{ habit_id: string }>).map(i => i.habit_id)

    for (const habitId of allHabitIds) {
      const completed = completedHabits.has(habitId)
      const note = habitNotes[habitId]?.trim() || null
      const { data: existing } = await supabaseServiceRole
        .from("habit_tracking_records")
        .select("id")
        .eq("organization_id", organization_id)
        .eq("bundle_id", bundleId)
        .eq("habit_id", habitId)
        .eq("tracked_date", date)
        .maybeSingle()

      if (existing) {
        await supabaseServiceRole
          .from("habit_tracking_records")
          .update({ completed, notes: note })
          .eq("id", existing.id)
      } else {
        await supabaseServiceRole
          .from("habit_tracking_records")
          .insert({ organization_id, bundle_id: bundleId, habit_id: habitId, tracked_date: date, completed, notes: note })
      }
    }

    return { success: true }
  },
}
