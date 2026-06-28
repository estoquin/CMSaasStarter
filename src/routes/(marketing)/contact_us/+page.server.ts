import { fail } from "@sveltejs/kit"
import { sendAdminEmail } from "$lib/mailer.js"
import type { Actions } from "./$types"

export const actions: Actions = {
  submitContactUs: async ({ request, locals: { supabaseServiceRole } }) => {
    const formData = await request.formData()
    const errors: { [fieldName: string]: string } = {}

    const firstName = formData.get("first_name")?.toString() ?? ""
    if (firstName.length < 2) {
      errors["first_name"] = "El nombre es obligatorio"
    }
    if (firstName.length > 500) {
      errors["first_name"] = "El nombre es demasiado largo"
    }

    const lastName = formData.get("last_name")?.toString() ?? ""
    if (lastName.length < 2) {
      errors["last_name"] = "El apellido es obligatorio"
    }
    if (lastName.length > 500) {
      errors["last_name"] = "El apellido es demasiado largo"
    }

    const email = formData.get("email")?.toString() ?? ""
    if (email.length < 6) {
      errors["email"] = "El correo electrónico es obligatorio"
    } else if (email.length > 500) {
      errors["email"] = "El correo es demasiado largo"
    } else if (!email.includes("@") || !email.includes(".")) {
      errors["email"] = "Correo electrónico inválido"
    }

    const company = formData.get("company")?.toString() ?? ""
    if (company.length > 500) {
      errors["company"] = "La empresa es demasiado larga"
    }

    const phone = formData.get("phone")?.toString() ?? ""
    if (phone.length > 100) {
      errors["phone"] = "El teléfono es demasiado largo"
    }

    const message = formData.get("message")?.toString() ?? ""
    if (message.length > 2000) {
      errors["message"] = "Mensaje demasiado largo (" + message.length + " de 2000)"
    }

    if (Object.keys(errors).length > 0) {
      return fail(400, { errors })
    }

    // Save to database
    const { error: insertError } = await supabaseServiceRole
      .from("contact_requests")
      .insert({
        first_name: firstName,
        last_name: lastName,
        email,
        company_name: company,
        phone,
        message_body: message,
        updated_at: new Date(),
      })

    if (insertError) {
      console.error("Error saving contact request", insertError)
      return fail(500, { errors: { _: "Error al guardar" } })
    }

    // Send email to admin
    await sendAdminEmail({
      subject: "Nueva solicitud de contacto",
      body: `Nueva solicitud de contacto de ${firstName} ${lastName}.\n\nCorreo: ${email}\n\nTeléfono: ${phone}\n\nEmpresa: ${company}\n\nMensaje: ${message}`,
    })
  },
}
