import { fail, redirect } from "@sveltejs/kit"
import { sendAdminEmail, sendUserEmail } from "$lib/mailer"
import { WebsiteBaseUrl } from "../../../../config"
import type { Actions } from "./$types"

export const actions: Actions = {
  toggleEmailSubscription: async ({ locals: { supabase, safeGetSession } }) => {
    const { session } = await safeGetSession()

    if (!session) {
      redirect(303, "/login")
    }

    const { data: currentProfile } = await supabase
      .from("profiles")
      .select("unsubscribed")
      .eq("id", session.user.id)
      .single()

    const newUnsubscribedStatus = !currentProfile?.unsubscribed

    const { error } = await supabase
      .from("profiles")
      .update({ unsubscribed: newUnsubscribedStatus })
      .eq("id", session.user.id)

    if (error) {
      console.error("Error updating subscription status", error)
      return fail(500, { message: "Error al actualizar el estado de la suscripción" })
    }

    return {
      unsubscribed: newUnsubscribedStatus,
    }
  },
  updateEmail: async ({ request, locals: { supabase, safeGetSession } }) => {
    const { session } = await safeGetSession()
    if (!session) {
      redirect(303, "/login")
    }

    const formData = await request.formData()
    const email = formData.get("email") as string

    let validationError
    if (!email || email === "") {
      validationError = "Se requiere una dirección de correo electrónico"
    }
    // Dead simple check -- there's no standard here (which is followed),
    // and lots of errors will be missed until we actually email to verify, so
    // just do that
    else if (!email.includes("@")) {
      validationError = "Se requiere una dirección de correo electrónico válida"
    }
    if (validationError) {
      return fail(400, {
        errorMessage: validationError,
        errorFields: ["email"],
        email,
      })
    }

    // Supabase does not change the email until the user verifies both
    // if 'Secure email change' is enabled in the Supabase dashboard
    const { error } = await supabase.auth.updateUser({ email: email })

    if (error) {
      console.error("Error updating email", error)
      return fail(500, {
        errorMessage: "Error desconocido. Si el problema persiste, contáctanos.",
        email,
      })
    }

    return {
      email,
    }
  },
  updatePassword: async ({ request, locals: { supabase, safeGetSession } }) => {
    const { session, user, amr } = await safeGetSession()
    if (!session) {
      redirect(303, "/login")
    }

    const formData = await request.formData()
    const newPassword1 = formData.get("newPassword1") as string
    const newPassword2 = formData.get("newPassword2") as string
    const currentPassword = formData.get("currentPassword") as string

    // Can check if we're a "password recovery" session by checking session amr
    // let currentPassword take priority if provided (user can use either form)
    const recoveryAmr = amr?.find((x: { method: string }) => x.method === "recovery")
    const isRecoverySession = recoveryAmr && !currentPassword

    // if this is password recovery session, check timestamp of recovery session
    if (isRecoverySession) {
      const timeSinceLogin = Date.now() - recoveryAmr.timestamp * 1000
      if (timeSinceLogin > 1000 * 60 * 15) {
        // 15 mins in milliseconds
        return fail(400, {
          errorMessage:
            'El código de recuperación expiró. Por favor cierra sesión y usa "Olvidé mi Contraseña" en la página de inicio para restablecer tu contraseña. Los códigos son válidos por 15 minutos.',
          errorFields: [],
          newPassword1,
          newPassword2,
          currentPassword: "",
        })
      }
    }

    let validationError
    const errorFields = []
    if (!newPassword1) {
      validationError = "Debes escribir una nueva contraseña"
      errorFields.push("newPassword1")
    }
    if (!newPassword2) {
      validationError = "Debes escribir la nueva contraseña dos veces"
      errorFields.push("newPassword2")
    }
    if (newPassword1.length < 6) {
      validationError = "La nueva contraseña debe tener al menos 6 caracteres"
      errorFields.push("newPassword1")
    }
    if (newPassword1.length > 72) {
      validationError = "La nueva contraseña puede tener máximo 72 caracteres"
      errorFields.push("newPassword1")
    }
    if (newPassword1 != newPassword2) {
      validationError = "Las contraseñas no coinciden"
      errorFields.push("newPassword1")
      errorFields.push("newPassword2")
    }
    if (!currentPassword && !isRecoverySession) {
      validationError =
        "Debes incluir tu contraseña actual. Si la olvidaste, cierra sesión y usa 'olvidé mi contraseña' en la página de inicio."
      errorFields.push("currentPassword")
    }
    if (validationError) {
      return fail(400, {
        errorMessage: validationError,
        errorFields: [...new Set(errorFields)], // unique values
        newPassword1,
        newPassword2,
        currentPassword,
      })
    }

    // Check current password is correct before updating, but only if they didn't log in with "recover" link
    // Note: to make this truly enforced you need to contact supabase. See: https://www.reddit.com/r/Supabase/comments/12iw7o1/updating_password_in_supabase_seems_insecure/
    // However, having the UI accessible route still verify password is still helpful, and needed once you get the setting above enabled
    if (!isRecoverySession) {
      const { error } = await supabase.auth.signInWithPassword({
        email: user?.email || "",
        password: currentPassword,
      })
      if (error) {
        // The user was logged out because of bad password. Redirect to error page explaining.
        redirect(303, "/login/current_password_error")
      }
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword1,
    })
    if (error) {
      console.error("Error updating password", error)
      return fail(500, {
        errorMessage: "Error desconocido. Si el problema persiste, contáctanos.",
        newPassword1,
        newPassword2,
        currentPassword,
      })
    }

    return {
      newPassword1,
      newPassword2,
      currentPassword,
    }
  },
  deleteAccount: async ({
    request,
    locals: { supabase, supabaseServiceRole, safeGetSession },
  }) => {
    const { session, user } = await safeGetSession()
    if (!session || !user?.id) {
      redirect(303, "/login")
    }

    const formData = await request.formData()
    const currentPassword = formData.get("currentPassword") as string

    if (!currentPassword) {
      return fail(400, {
        errorMessage:
          "Debes proporcionar tu contraseña actual para eliminar tu cuenta. Si la olvidaste, cierra sesión y usa 'olvidé mi contraseña' en la página de inicio.",
        errorFields: ["currentPassword"],
        currentPassword,
      })
    }

    // Check current password is correct before deleting account
    const { error: pwError } = await supabase.auth.signInWithPassword({
      email: user?.email || "",
      password: currentPassword,
    })
    if (pwError) {
      // The user was logged out because of bad password. Redirect to error page explaining.
      redirect(303, "/login/current_password_error")
    }

    const { error } = await supabaseServiceRole.auth.admin.deleteUser(
      user.id,
      true,
    )
    if (error) {
      console.error("Error deleting user", error)
      return fail(500, {
        errorMessage: "Error desconocido. Si el problema persiste, contáctanos.",
        currentPassword,
      })
    }

    await supabase.auth.signOut()
    redirect(303, "/")
  },
  updateProfile: async ({ request, locals: { supabase, safeGetSession } }) => {
    const { session, user } = await safeGetSession()
    if (!session || !user?.id) {
      redirect(303, "/login")
    }

    const formData = await request.formData()
    const fullName = formData.get("fullName") as string
    const companyName = formData.get("companyName") as string
    const website = formData.get("website") as string

    let validationError
    const fieldMaxTextLength = 50
    const errorFields = []
    if (!fullName) {
      validationError = "El nombre es obligatorio"
      errorFields.push("fullName")
    } else if (fullName.length > fieldMaxTextLength) {
      validationError = `El nombre debe tener menos de ${fieldMaxTextLength} caracteres`
      errorFields.push("fullName")
    }
    if (!companyName) {
      validationError =
        "El nombre de la empresa es obligatorio. Si es un proyecto personal, por favor pon tu nombre."
      errorFields.push("companyName")
    } else if (companyName.length > fieldMaxTextLength) {
      validationError = `El nombre de la empresa debe tener menos de ${fieldMaxTextLength} caracteres`
      errorFields.push("companyName")
    }
    if (!website) {
      validationError =
        "El sitio web de la empresa es obligatorio. Una URL de tienda de aplicaciones es una buena alternativa si no tienes sitio web."
      errorFields.push("website")
    } else if (website.length > fieldMaxTextLength) {
      validationError = `El sitio web debe tener menos de ${fieldMaxTextLength} caracteres`
      errorFields.push("website")
    }
    if (validationError) {
      return fail(400, {
        errorMessage: validationError,
        errorFields,
        fullName,
        companyName,
        website,
      })
    }

    // To check if created or updated, check if priorProfile exists
    const { data: priorProfile, error: priorProfileError } = await supabase
      .from("profiles")
      .select(`*`)
      .eq("id", session?.user.id)
      .single()

    const { error } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        full_name: fullName,
        company_name: companyName,
        website: website,
        updated_at: new Date(),
        unsubscribed: priorProfile?.unsubscribed ?? false,
      })
      .select()

    if (error) {
      console.error("Error updating profile", error)
      return fail(500, {
        errorMessage: "Error desconocido. Si el problema persiste, contáctanos.",
        fullName,
        companyName,
        website,
      })
    }

    // If the profile was just created, send an email to the user and admin
    const newProfile =
      priorProfile?.updated_at === null && priorProfileError === null
    if (newProfile) {
      await sendAdminEmail({
        subject: "Perfil Creado",
        body: `Perfil creado por ${session.user.email}\nNombre completo: ${fullName}\nEmpresa: ${companyName}\nSitio web: ${website}`,
      })

      // Send welcome email
      await sendUserEmail({
        user: session.user,
        subject: "¡Bienvenido!",
        from_email: "no-reply@saasstarter.work",
        template_name: "welcome_email",
        template_properties: {
          companyName: "SaaS Starter",
          WebsiteBaseUrl: WebsiteBaseUrl,
        },
      })
    }

    return {
      fullName,
      companyName,
      website,
    }
  },
  signout: async ({ locals: { supabase, safeGetSession } }) => {
    const { session } = await safeGetSession()
    if (session) {
      await supabase.auth.signOut()
      redirect(303, "/")
    } else {
      redirect(303, "/")
    }
  },
}
