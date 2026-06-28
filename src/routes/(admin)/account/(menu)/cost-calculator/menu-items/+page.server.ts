import { fail, redirect } from "@sveltejs/kit"
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

export const load: PageServerLoad = async ({ locals: { supabaseServiceRole, safeGetSession } }) => {
  const { session, organization_id, role } = await safeGetSession()
  if (!session) redirect(303, "/login")
  const orgFilter = (q: any) => { if (organization_id) q = q.eq("organization_id", organization_id); if (role !== "admin") q = q.eq("user_id", session.user.id); return q }
  const { data: items, error } = await orgFilter(supabaseServiceRole.from("menu_items").select("*")).order("name")
  if (error) { console.error("Error loading menu items:", error); return { items: [] } }
  return { items }
}

export const actions: Actions = {
  create: async ({ request, locals: { supabaseServiceRole, safeGetSession } }) => {
    const { session, organization_id } = await safeGetSession(); if (!session) redirect(303, "/login")
    const fd = await request.formData()
    const name = String(fd.get("name") ?? "")
    if (!name.trim()) return fail(400, { errorMessage: "El nombre es obligatorio" })
    const imageFile = fd.get("image")
    const insertData: Record<string, any> = { user_id: session.user.id, name: name.trim() }; if (organization_id) insertData.organization_id = organization_id
    const { data: inserted, error } = await supabaseServiceRole.from("menu_items").insert(insertData).select("id").single()
    if (error) { console.error(`[create] DB insert error:`, error); return fail(500, { errorMessage: "Error al crear" }) }
    if (imageFile instanceof File && imageFile.size > 0) {
      try {
        await ensureBucket(supabaseServiceRole)
        const { buffer, contentType } = await processImage(imageFile)
        const path = `${session.user.id}/${inserted.id}.webp`
        const { data: uploadData, error: uploadError } = await supabaseServiceRole.storage.from(BUCKET).upload(path, buffer, { upsert: true, contentType })
        if (uploadError) {
          console.error(`[create] Storage upload error:`, uploadError)
        } else {
          const { data: { publicUrl } } = supabaseServiceRole.storage.from(BUCKET).getPublicUrl(path)
          await supabaseServiceRole.from("menu_items").update({ image_url: publicUrl }).eq("id", inserted.id)
        }
      } catch (err) {
        console.error(`[create] Image processing error:`, err)
      }
    }
    return { success: true }
  },
  delete: async ({ request, locals: { supabaseServiceRole, safeGetSession } }) => {
    const { session, organization_id, role } = await safeGetSession(); if (!session) redirect(303, "/login")
    const fd = await request.formData()
    const id = String(fd.get("id") ?? "")
    if (!id) return fail(400, { errorMessage: "ID obligatorio" })
    let q = supabaseServiceRole.from("menu_items").select("image_url").eq("id", id)
    if (organization_id) q = q.eq("organization_id", organization_id)
    if (role !== "admin") q = q.eq("user_id", session.user.id)
    const { data: item } = await q.single()
    if (item?.image_url) {
      const path = item.image_url.replace(`${PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/`, "")
      await supabaseServiceRole.storage.from(BUCKET).remove([path])
    }
    let dq = supabaseServiceRole.from("menu_items").delete().eq("id", id)
    if (organization_id) dq = dq.eq("organization_id", organization_id)
    if (role !== "admin") dq = dq.eq("user_id", session.user.id)
    const { error } = await dq
    if (error) return fail(500, { errorMessage: "Error al eliminar" })
    return { success: true }
  },
}
