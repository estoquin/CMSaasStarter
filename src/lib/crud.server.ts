/* eslint-disable @typescript-eslint/no-explicit-any */
import { redirect, error, fail } from "@sveltejs/kit"

export async function requireSession(event: { locals: { safeGetSession: () => Promise<{ session: any; organization_id: string | null; role: string | null }> } }) {
  const { session, organization_id, role } = await event.locals.safeGetSession()
  if (!session) redirect(303, "/login")
  return { session, organization_id: organization_id ?? "", role: role ?? "standard" }
}

// Returns the appropriate user_id filter based on role.
// Admins see all records in the org; standard users see only their own.
export function userFilter(organization_id: string, role: string, user_id: string): Record<string, string> {
  const filter: Record<string, string> = {}
  if (organization_id) filter.organization_id = organization_id
  if (role !== "admin") filter.user_id = user_id
  return filter
}

// Applies the org filter to a query builder.
export function applyOrgFilter(query: any, organization_id: string, role: string, user_id: string): any {
  const filter = userFilter(organization_id, role, user_id)
  for (const [k, v] of Object.entries(filter)) query = query.eq(k, v)
  return query
}

interface ListOptions {
  select?: string
  orderBy?: string
  orderDir?: "asc" | "desc"
}

interface CreateOptions {
  fields: string[]
  required?: string[]
  parse?: Record<string, "float" | "int">
  defaults?: Record<string, any>
  trim?: string[]
  nullables?: string[]
}

interface UpdateOptions {
  fields: string[]
  required?: string[]
  parse?: Record<string, "float" | "int">
  trim?: string[]
  nullables?: string[]
}

export function listLoad(table: string, opts: ListOptions = {}) {
  return async (event: any) => {
    const { session, organization_id } = await requireSession(event)
    const filter = userFilter(organization_id, "admin", session.user.id)
    let query = event.locals.supabaseServiceRole.from(table).select(opts.select || "*")
    for (const [k, v] of Object.entries(filter)) query = query.eq(k, v)
    query = query.order(opts.orderBy || "created_at", { ascending: opts.orderDir !== "asc" })
    const { data, error: err } = await query
    if (err) { console.error(`Error loading ${table}:`, err); return { items: [] } }
    return { items: data ?? [] }
  }
}

export function detailLoad(table: string) {
  return async (event: any) => {
    const { session, organization_id } = await requireSession(event)
    const filter = userFilter(organization_id, "admin", session.user.id)
    let query = event.locals.supabaseServiceRole.from(table).select("*").eq("id", event.params.id)
    for (const [k, v] of Object.entries(filter)) query = query.eq(k, v)
    const { data: item, error: err } = await query.single()
    if (err || !item) error(404, "No encontrado")
    return { item }
  }
}

function extractFields(fd: FormData, opts: CreateOptions) {
  const values: Record<string, any> = {}
  for (const key of opts.fields) {
    let val: any = fd.get(key)
    if (opts.parse?.[key] === "float") val = parseFloat(val as string) || 0
    else if (opts.parse?.[key] === "int") val = parseInt(val as string) || 0
    else if (typeof val === "string" && (opts.trim?.includes(key) ?? true)) val = val.trim()
    if (opts.nullables?.includes(key) && !val) val = null
    values[key] = val
  }
  return values
}

export function createAction(table: string, opts: CreateOptions) {
  return async (event: any) => {
    const { session, organization_id } = await requireSession(event)
    const fd = await event.request.formData()
    const values = extractFields(fd, { ...opts, trim: opts.trim ?? opts.fields })
    for (const key of opts.required ?? []) {
      if (!values[key]?.toString().trim()) return fail(400, { success: false, errorMessage: "Campo obligatorio", ...values })
    }
    const insertData: Record<string, any> = { user_id: session.user.id, ...values }
    if (organization_id) insertData.organization_id = organization_id
    const { error: err } = await event.locals.supabaseServiceRole
      .from(table).insert(insertData)
    if (err) return fail(500, { success: false, errorMessage: "Error al crear", ...values })
    return { success: true, errorMessage: undefined, ...values }
  }
}

export function updateAction(table: string, opts: UpdateOptions) {
  return async (event: any) => {
    const { session, organization_id } = await requireSession(event)
    const filter = userFilter(organization_id, "admin", session.user.id)
    const fd = await event.request.formData()
    const values = extractFields(fd, { ...opts, trim: opts.trim ?? opts.fields })
    for (const key of opts.required ?? []) {
      if (!values[key]?.toString().trim()) return fail(400, { success: false, errorMessage: "Campo obligatorio", ...values })
    }
    values.updated_at = new Date().toISOString()
    let query = event.locals.supabaseServiceRole.from(table).update(values)
    for (const [k, v] of Object.entries(filter)) query = query.eq(k, v)
    const { error: err } = await query.eq("id", event.params.id)
    if (err) return fail(500, { success: false, errorMessage: "Error al actualizar", ...values })
    return { success: true, errorMessage: undefined, ...values }
  }
}

export function deleteAction(table: string) {
  return async (event: any) => {
    const { session, organization_id } = await requireSession(event)
    const filter = userFilter(organization_id, "admin", session.user.id)
    const id = (await event.request.formData()).get("id") as string
    if (!id) return fail(400, { success: false, errorMessage: "ID obligatorio" })
    let query = event.locals.supabaseServiceRole.from(table).delete()
    for (const [k, v] of Object.entries(filter)) query = query.eq(k, v)
    const { error: err } = await query.eq("id", id)
    if (err) return fail(500, { success: false, errorMessage: "Error al eliminar" })
    return { success: true }
  }
}

export function deleteDetailAction(table: string, redirectTo: string) {
  return async (event: any) => {
    const { session, organization_id } = await requireSession(event)
    const filter = userFilter(organization_id, "admin", session.user.id)
    let query = event.locals.supabaseServiceRole.from(table).delete()
    for (const [k, v] of Object.entries(filter)) query = query.eq(k, v)
    const { error: err } = await query.eq("id", event.params.id)
    if (err) return fail(500, { success: false, errorMessage: "Error al eliminar" })
    redirect(303, redirectTo)
  }
}
