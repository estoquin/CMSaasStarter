import { error, fail } from "@sveltejs/kit"
import type { PageServerLoad, Actions } from "./$types"
import { requireSession } from "$lib/crud.server"

export const load: PageServerLoad = async (event) => {
  const { session, organization_id, role } = await requireSession(event)
  const { supabaseServiceRole } = event.locals
  const orgFilter = (q: any) => { if (organization_id) q = q.eq("organization_id", organization_id); if (role !== "admin") q = q.eq("user_id", session.user.id); return q }

  const [summaryRes, commentsRes, timeLogsRes, invoicesRes] = await Promise.all([
    orgFilter(supabaseServiceRole.from("ticket_summary").select("*")).eq("id", event.params.id).single(),
    supabaseServiceRole.from("ticket_comments").select("*, author:author_id(full_name)").eq("ticket_id", event.params.id).order("created_at", { ascending: true }),
    supabaseServiceRole.from("ticket_time_logs").select("*, agent:agent_id(full_name)").eq("ticket_id", event.params.id).order("logged_at", { ascending: false }),
    supabaseServiceRole.from("service_invoices").select("*").eq("ticket_id", event.params.id).maybeSingle(),
  ])

  if (summaryRes.error || !summaryRes.data) error(404, "Ticket no encontrado")

  return {
    ticket: summaryRes.data,
    comments: commentsRes.data ?? [],
    timeLogs: timeLogsRes.data ?? [],
    invoice: invoicesRes.data ?? null,
  }
}

export const actions: Actions = {
  updateStatus: async (event) => {
    const { session, organization_id, role } = await requireSession(event)
    const fd = await event.request.formData()
    const status = String(fd.get("status") ?? "")
    const updateData: Record<string, any> = { status }
    if (status === "resolved" || status === "closed") updateData.closed_at = new Date().toISOString()
    let q = event.locals.supabaseServiceRole.from("service_tickets").update(updateData).eq("id", event.params.id)
    if (organization_id) q = q.eq("organization_id", organization_id)
    if (role !== "admin") q = q.eq("user_id", session.user.id)
    const { error: err } = await q
    if (err) return fail(500, { errorMessage: "Error al actualizar el estado" })
    return { success: true }
  },
  addComment: async (event) => {
    const { session } = await requireSession(event)
    const fd = await event.request.formData()
    const body = String(fd.get("body") ?? "")
    const is_internal = fd.get("is_internal") === "true"
    if (!body.trim()) return fail(400, { commentError: "El comentario no puede estar vacío" })
    const { error: err } = await event.locals.supabaseServiceRole.from("ticket_comments").insert({ ticket_id: event.params.id, author_id: session.user.id, body: body.trim(), is_internal })
    if (err) return fail(500, { commentError: "Error al añadir comentario" })
    return { commentSuccess: true }
  },
  logTime: async (event) => {
    const { session } = await requireSession(event)
    const fd = await event.request.formData()
    const minutes = parseInt(String(fd.get("minutes") ?? "0"))
    const note = String(fd.get("note") ?? "")
    if (!minutes || minutes < 1) return fail(400, { timeError: "Los minutos deben ser mayores a 0" })
    const { error: err } = await event.locals.supabaseServiceRole.from("ticket_time_logs").insert({ ticket_id: event.params.id, agent_id: session.user.id, minutes, note: note || null })
    if (err) return fail(500, { timeError: "Error al registrar tiempo" })
    return { timeSuccess: true }
  },
  createInvoice: async (event) => {
    const { session } = await requireSession(event)
    const fd = await event.request.formData()
    const amount = parseFloat(String(fd.get("amount") ?? "0"))
    if (!amount || amount < 0) return fail(400, { invoiceError: "El monto debe ser mayor a 0" })
    const { error: err } = await event.locals.supabaseServiceRole.from("service_invoices").insert({ ticket_id: event.params.id, amount })
    if (err) return fail(500, { invoiceError: "Error al crear factura" })
    return { invoiceSuccess: true }
  },
}
