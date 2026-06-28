import { fail } from "@sveltejs/kit"
import type { Actions } from "./$types"

export const actions: Actions = {
  create: async ({ request, locals: { supabaseServiceRole } }) => {
    const fd = await request.formData()
    const name = fd.get("name") as string
    const slug = fd.get("slug") as string

    if (!name) {
      return fail(400, { error: "El nombre de la organización es requerido" })
    }

    const orgSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")

    const { data, error } = await supabaseServiceRole
      .from("organizations")
      .insert({ name, slug: orgSlug })
      .select("id, name, slug")
      .single()

    if (error) {
      if (error.code === "23505") {
        return fail(400, { error: "El código (slug) ya existe. Prueba con otro.", name })
      }
      return fail(500, { error: "Error al crear la organización", name })
    }

    return { success: true, org: data }
  },
}
