import { fail } from "@sveltejs/kit"
import type { Actions } from "./$types"

const ORG_CODE = "1234"

export const actions: Actions = {
  verify: async ({ request, locals: { supabaseServiceRole } }) => {
    const fd = await request.formData()
    const code = (fd.get("code") as string) || ""

    if (code === ORG_CODE) {
      return { codeVerified: true, code, mode: "new" }
    }

    // Check if code is an existing approved org slug
    const { data: org } = await supabaseServiceRole
      .from("organizations")
      .select("id, name, slug, approved")
      .eq("slug", code)
      .single()

    if (org && org.approved) {
      return { codeVerified: true, code, mode: "join", orgName: org.name }
    }

    if (org && !org.approved) {
      return fail(400, { codeError: "La organización aún no está aprobada" })
    }

    return fail(400, { codeError: "Código inválido" })
  },

  signup: async ({ request, url, locals: { supabase, supabaseServiceRole } }) => {
    const fd = await request.formData()
    const code = (fd.get("code") as string) || ""
    const email = fd.get("email") as string
    const password = fd.get("password") as string

    if (!email || !password) {
      return fail(400, { error: "Correo y contraseña requeridos", email })
    }
    if (password.length < 6) {
      return fail(400, { error: "La contraseña debe tener al menos 6 caracteres", email })
    }

    const userData: Record<string, string> = {}

    if (code === ORG_CODE) {
      // New org flow
      const orgName = fd.get("orgName") as string
      if (!orgName) {
        return fail(400, { error: "Nombre de la organización requerido", email })
      }
      userData.org_name = orgName
    } else {
      // Join existing org flow
      const { data: org } = await supabaseServiceRole
        .from("organizations")
        .select("id, approved")
        .eq("slug", code)
        .single()

      if (!org) {
        return fail(400, { error: "Organización no encontrada", email })
      }
      if (!org.approved) {
        return fail(400, { error: "La organización aún no está aprobada", email })
      }
      userData.org_slug = code
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
        emailRedirectTo: `${url.origin}/auth/callback`,
      },
    })

    if (error) {
      return fail(500, { error: error.message, email })
    }

    return { success: true, email }
  },
}
