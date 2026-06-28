import { error, fail, redirect } from "@sveltejs/kit"
import type { PageServerLoad, Actions } from "./$types"
import { PUBLIC_SUPABASE_URL } from "$env/static/public"
import sharp from "sharp"

const BUCKET = "menu-item-images"

async function ensureBucket(supabase: import("@supabase/supabase-js").SupabaseClient): Promise<void> {
  const { data: existing } = await supabase.storage.getBucket(BUCKET)
  if (!existing) {
    console.log(`[ensureBucket] Creating bucket '${BUCKET}'`)
    const { error } = await supabase.storage.createBucket(BUCKET, { public: true })
    if (error) console.error(`[ensureBucket] Error creating bucket:`, error)
    else console.log(`[ensureBucket] Bucket '${BUCKET}' created`)
  } else {
    console.log(`[ensureBucket] Bucket '${BUCKET}' already exists`)
  }
}

async function processImage(file: File): Promise<{ buffer: Buffer; contentType: string }> {
  console.log(`[processImage] Original file: name=${file.name}, size=${file.size}, type=${file.type}`)
  const arrayBuffer = await file.arrayBuffer()
  console.log(`[processImage] arrayBuffer size: ${arrayBuffer.byteLength}`)
  const buffer = Buffer.from(arrayBuffer)
  console.log(`[processImage] Buffer size: ${buffer.length}`)
  const processed = await sharp(buffer).resize(800, 800, { fit: "inside", withoutEnlargement: true }).webp({ quality: 80 }).toBuffer()
  console.log(`[processImage] Processed WebP size: ${processed.length}`)
  return { buffer: processed, contentType: "image/webp" }
}

export const load: PageServerLoad = async ({ params, locals: { supabaseServiceRole, safeGetSession } }) => {
  const { session, organization_id, role } = await safeGetSession(); if (!session) redirect(303, "/login")
  const orgFilter = (q: any) => { if (organization_id) q = q.eq("organization_id", organization_id); if (role !== "admin") q = q.eq("user_id", session.user.id); return q }
  const q = orgFilter(supabaseServiceRole.from("menu_items").select("*")).eq("id", params.id)
  const { data: item, error: err } = await q.single()
  if (err || !item) error(404, "No encontrado")
  console.log(`[load] Item loaded: id=${item.id}, name=${item.name}, image_url=${item.image_url}`)

  const { data: recipe } = await supabaseServiceRole
    .from("menu_item_ingredients")
    .select("menu_item_id, line_type, ref_id, quantity_needed")
    .eq("menu_item_id", params.id)

  const { data: allIngredients } = await orgFilter(supabaseServiceRole.from("ingredients").select("id, name, unit")).order("name")
  const { data: allComponents } = await orgFilter(supabaseServiceRole.from("components").select("id, name, unit, ingredient_id, ingredient_qty_used, yield_per_batch")).order("name")
  const { data: latestPrices } = await orgFilter(supabaseServiceRole.from("purchases").select("ingredient_id, unit_cost, date"))

  const latestMap: Record<string, { unit_cost: number; date: string }> = {}
  if (latestPrices) {
    for (const p of latestPrices) {
      if (!latestMap[p.ingredient_id] || p.date > latestMap[p.ingredient_id].date) {
        latestMap[p.ingredient_id] = { unit_cost: p.unit_cost, date: p.date }
      }
    }
  }

  const ingMap = new Map((allIngredients ?? []).map(i => [i.id, i]))
  const compMap = new Map((allComponents ?? []).map(c => [c.id, c]))

  const recipeWithDetails = (recipe ?? []).map(r => {
    if (r.line_type === 'ingredient') {
      const ing = ingMap.get(r.ref_id)
      const unitCost = latestMap[r.ref_id]?.unit_cost ?? 0
      return { ...r, ref_name: ing?.name ?? "—", ref_unit: ing?.unit ?? "—", latest_unit_cost: unitCost, line_cost: unitCost * r.quantity_needed }
    } else {
      const comp = compMap.get(r.ref_id)
      const ingUnitCost = latestMap[comp?.ingredient_id ?? '']?.unit_cost ?? 0
      const compUnitCost = comp ? (ingUnitCost * comp.ingredient_qty_used) / comp.yield_per_batch : 0
      return { ...r, ref_name: comp?.name ?? "—", ref_unit: comp?.unit ?? "—", latest_unit_cost: compUnitCost, line_cost: compUnitCost * r.quantity_needed }
    }
  })

  return {
    item,
    recipe: recipeWithDetails,
    totalCost: recipeWithDetails.reduce((sum, r) => sum + r.line_cost, 0),
    allIngredients: allIngredients ?? [],
    allComponents: allComponents ?? [],
  }
}

export const actions: Actions = {
  update: async ({ request, params, locals: { supabaseServiceRole, safeGetSession } }) => {
    const { session, organization_id, role } = await safeGetSession(); if (!session) redirect(303, "/login")
    const fd = await request.formData()
    const name = String(fd.get("name") ?? "")
    if (!name.trim()) return fail(400, { errorMessage: "El nombre es obligatorio" })
    const updateData: Record<string, unknown> = { name: name.trim(), updated_at: new Date().toISOString() }
    const imageFile = fd.get("image")
    if (imageFile instanceof File && imageFile.size > 0) {
      try {
        await ensureBucket(supabaseServiceRole)
        let q = supabaseServiceRole.from("menu_items").select("image_url").eq("id", params.id)
        if (organization_id) q = q.eq("organization_id", organization_id)
        if (role !== "admin") q = q.eq("user_id", session.user.id)
        const { data: current } = await q.single()
        if (current?.image_url) {
          const oldPath = current.image_url.replace(`${PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/`, "")
          await supabaseServiceRole.storage.from(BUCKET).remove([oldPath])
        }
        const { buffer, contentType } = await processImage(imageFile)
        const path = `${session.user.id}/${params.id}.webp`
        const { data: uploadData, error: uploadError } = await supabaseServiceRole.storage.from(BUCKET).upload(path, buffer, { upsert: true, contentType })
        if (uploadError) {
          console.error(`[update] Storage upload error:`, uploadError)
        } else {
          const { data: { publicUrl } } = supabaseServiceRole.storage.from(BUCKET).getPublicUrl(path)
          updateData.image_url = publicUrl
        }
      } catch (err) {
        console.error(`[update] Image processing error:`, err)
      }
    }
    let uq = supabaseServiceRole.from("menu_items").update(updateData).eq("id", params.id)
    if (organization_id) uq = uq.eq("organization_id", organization_id)
    if (role !== "admin") uq = uq.eq("user_id", session.user.id)
    const { data: updatedItem, error: err } = await uq.select("*").single()
    if (err) { console.error(`[update] DB update error:`, err); return fail(500, { errorMessage: "Error al actualizar" }) }
    return { success: true }
  },
  add_recipe_line: async ({ request, params, locals: { supabaseServiceRole, safeGetSession } }) => {
    const { session } = await safeGetSession(); if (!session) redirect(303, "/login")
    const fd = await request.formData()
    const line_type = String(fd.get("line_type") ?? "")
    const ref_id = String(fd.get("ref_id") ?? "")
    const quantity_needed = parseFloat(String(fd.get("quantity_needed") ?? "0"))
    if (!line_type || !['ingredient', 'component'].includes(line_type)) return fail(400, { errorMessage: "Tipo de línea inválido" })
    if (!ref_id) return fail(400, { errorMessage: "Referencia obligatoria" })
    if (quantity_needed <= 0) return fail(400, { errorMessage: "La cantidad debe ser > 0" })
    const { error } = await supabaseServiceRole.from("menu_item_ingredients").insert({ menu_item_id: params.id, line_type, ref_id, quantity_needed })
    if (error?.message?.includes("duplicate")) return fail(400, { errorMessage: "Este elemento ya está en la receta" })
    if (error) return fail(500, { errorMessage: "Error al agregar" })
    return { success: true }
  },
  remove_recipe_line: async ({ request, params, locals: { supabaseServiceRole, safeGetSession } }) => {
    const { session } = await safeGetSession(); if (!session) redirect(303, "/login")
    const fd = await request.formData()
    const line_type = String(fd.get("line_type") ?? "")
    const ref_id = String(fd.get("ref_id") ?? "")
    const { error } = await supabaseServiceRole.from("menu_item_ingredients").delete().eq("menu_item_id", params.id).eq("line_type", line_type).eq("ref_id", ref_id)
    if (error) return fail(500, { errorMessage: "Error al quitar" })
    return { success: true }
  },
  delete: async ({ params, locals: { supabaseServiceRole, safeGetSession } }) => {
    const { session, organization_id, role } = await safeGetSession(); if (!session) redirect(303, "/login")
    let q = supabaseServiceRole.from("menu_items").select("image_url").eq("id", params.id)
    if (organization_id) q = q.eq("organization_id", organization_id)
    if (role !== "admin") q = q.eq("user_id", session.user.id)
    const { data: item } = await q.single()
    if (item?.image_url) {
      const path = item.image_url.replace(`${PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/`, "")
      await supabaseServiceRole.storage.from(BUCKET).remove([path])
    }
    let dq = supabaseServiceRole.from("menu_items").delete().eq("id", params.id)
    if (organization_id) dq = dq.eq("organization_id", organization_id)
    if (role !== "admin") dq = dq.eq("user_id", session.user.id)
    await dq
    redirect(303, "/account/cost-calculator/menu-items")
  },
}
