import { fail, redirect } from "@sveltejs/kit"
import type { PageServerLoad, Actions } from "./$types"
import { requireSession } from "$lib/crud.server"

export const load: PageServerLoad = async (event) => {
  const { session, organization_id, role } = await requireSession(event)
  const orgFilter = (q: any) => { if (organization_id) q = q.eq("organization_id", organization_id); if (role !== "admin") q = q.eq("user_id", session.user.id); return q }
  const [accountsRes, contactsRes] = await Promise.all([
    orgFilter(event.locals.supabaseServiceRole.from("accounts").select("id, name")).order("name"),
    orgFilter(event.locals.supabaseServiceRole.from("contacts").select("id, name")).order("name"),
  ])
  return {
    accounts: accountsRes.data ?? [],
    contacts: contactsRes.data ?? [],
  }
}

export const actions: Actions = {
  create: async (event) => {
    const { session, organization_id, role } = await requireSession(event)
    const fd = await event.request.formData()
    const title = String(fd.get("title") ?? "")
    const description = String(fd.get("description") ?? "")
    const account_id = String(fd.get("account_id") ?? "")
    const contact_id = String(fd.get("contact_id") ?? "")
    const priority = String(fd.get("priority") ?? "")
    const category = String(fd.get("category") ?? "")

    if (!title.trim()) return fail(400, { errorMessage: "El título es obligatorio", title, description, account_id, contact_id, priority, category })
    if (!account_id) return fail(400, { errorMessage: "La cuenta es obligatoria", title, description, account_id, contact_id, priority, category })

    const { data: ticket, error: ticketErr } = await event.locals.supabaseServiceRole
      .from("service_tickets")
      .insert({ title: title.trim(), description: description || null, account_id, contact_id: contact_id || null, priority: priority || "medium", category: category || null, organization_id, user_id: session.user.id })
      .select("id").single()

    if (ticketErr) {
      console.error("Error creating ticket:", ticketErr)
      return fail(500, { errorMessage: "Error al crear el ticket", title, description, account_id, contact_id, priority, category })
    }

    const { error: assignErr } = await event.locals.supabaseServiceRole
      .from("ticket_assignments")
      .insert({ ticket_id: ticket.id, agent_id: session.user.id, is_active: true })

    if (assignErr) console.error("Error assigning ticket:", assignErr)

    redirect(303, `/account/service/${ticket.id}`)
  },
}
