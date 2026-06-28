import { describe, it, expect, vi, beforeEach } from "vitest"
import { requireSession, listLoad, detailLoad, createAction, updateAction, deleteAction, deleteDetailAction } from "./crud.server"

vi.mock("@sveltejs/kit", async () => {
  const actual = await vi.importActual("@sveltejs/kit")
  return {
    ...actual,
    fail: vi.fn().mockReturnValue({ __isFail: true }),
    redirect: vi.fn().mockImplementation(() => { throw new Error("Redirect error") }),
    error: vi.fn().mockImplementation((code: number) => { throw new Error(`Error ${code}`) }),
  }
})

function mockFormData(values: Record<string, string>): FormData {
  const fd = new FormData()
  for (const [k, v] of Object.entries(values)) fd.append(k, v)
  return fd
}

function mockEvent(overrides: Record<string, any> = {}) {
  const mockSelect = vi.fn().mockReturnThis()
  const mockOrder = vi.fn().mockResolvedValue({ data: [], error: null })
  const mockSingle = vi.fn().mockResolvedValue({ data: { id: "1", name: "test" }, error: null })
  const mockInsert = vi.fn().mockResolvedValue({ error: null })
  const mockUpdate = vi.fn().mockReturnThis()
  const mockDelete = vi.fn().mockReturnThis()
  const mockEq = vi.fn().mockReturnThis()

  return {
    locals: {
      supabaseServiceRole: {
        from: vi.fn().mockReturnThis(),
        select: mockSelect,
        order: mockOrder,
        single: mockSingle,
        insert: mockInsert,
        update: mockUpdate,
        delete: mockDelete,
        eq: mockEq,
      },
      safeGetSession: vi.fn().mockResolvedValue({ session: { user: { id: "user1" } }, organization_id: "org1", role: "standard" }),
    },
    params: { id: "abc123" },
    request: { formData: vi.fn() },
    ...overrides,
  }
}

describe("requireSession", () => {
  it("returns session when valid", async () => {
    const event = mockEvent()
    const result = await requireSession(event as any)
    expect(result.session.user.id).toBe("user1")
    expect(result.organization_id).toBe("org1")
    expect(result.role).toBe("standard")
  })

  it("redirects when no session", async () => {
    const event = mockEvent()
    event.locals.safeGetSession = vi.fn().mockResolvedValue({ session: null })
    await expect(requireSession(event as any)).rejects.toThrow("Redirect error")
  })
})

describe("listLoad", () => {
  it("returns items on success", async () => {
    const event = mockEvent()
    const load = listLoad("contacts")
    const result = await load(event as any)
    expect(event.locals.supabaseServiceRole.from).toHaveBeenCalledWith("contacts")
    expect(result.items).toEqual([])
  })

  it("returns empty array on error", async () => {
    const event = mockEvent()
    event.locals.supabaseServiceRole.order = vi.fn().mockResolvedValue({ data: null, error: new Error("DB down") })
    const load = listLoad("contacts")
    const result = await load(event as any)
    expect(result.items).toEqual([])
  })

  it("redirects if no session", async () => {
    const event = mockEvent()
    event.locals.safeGetSession = vi.fn().mockResolvedValue({ session: null })
    const load = listLoad("contacts")
    await expect(load(event as any)).rejects.toThrow("Redirect error")
  })
})

describe("detailLoad", () => {
  it("returns item on success", async () => {
    const event = mockEvent()
    const load = detailLoad("contacts")
    const result = await load(event as any)
    expect(event.locals.supabaseServiceRole.from).toHaveBeenCalledWith("contacts")
    expect(result.item).toBeDefined()
  })

  it("throws 404 when not found", async () => {
    const event = mockEvent()
    event.locals.supabaseServiceRole.single = vi.fn().mockResolvedValue({ data: null, error: new Error("Not found") })
    const load = detailLoad("contacts")
    await expect(load(event as any)).rejects.toThrow("Error 404")
  })

  it("redirects if no session", async () => {
    const event = mockEvent()
    event.locals.safeGetSession = vi.fn().mockResolvedValue({ session: null })
    const load = detailLoad("contacts")
    await expect(load(event as any)).rejects.toThrow("Redirect error")
  })
})

describe("createAction", () => {
  it("creates record on valid input", async () => {
    const event = mockEvent({ request: { formData: () => mockFormData({ name: "Test", email: "a@b.com" }) } })
    const action = createAction("contacts", { fields: ["name", "email"], required: ["name"] })
    const result = await action(event as any)
    expect(result).toEqual({ success: true })
  })

  it("fails on missing required field", async () => {
    const event = mockEvent({ request: { formData: () => mockFormData({ name: "", email: "a@b.com" }) } })
    const action = createAction("contacts", { fields: ["name", "email"], required: ["name"] })
    const result = await action(event as any)
    expect(result.__isFail).toBe(true)
  })

  it("fails on db error", async () => {
    const event = mockEvent({ request: { formData: () => mockFormData({ name: "Test" }) } })
    event.locals.supabaseServiceRole.insert = vi.fn().mockResolvedValue({ error: new Error("DB error") })
    const action = createAction("contacts", { fields: ["name"], required: ["name"] })
    const result = await action(event as any)
    expect(result.__isFail).toBe(true)
  })

  it("redirects if no session", async () => {
    const event = mockEvent({ request: { formData: () => mockFormData({ name: "Test" }) } })
    event.locals.safeGetSession = vi.fn().mockResolvedValue({ session: null })
    const action = createAction("contacts", { fields: ["name"], required: ["name"] })
    await expect(action(event as any)).rejects.toThrow("Redirect error")
  })

  it("parses float and int fields", async () => {
    const event = mockEvent({ request: { formData: () => mockFormData({ name: "Test", value: "10.5", probability: "75" }) } })
    const action = createAction("opportunities", { fields: ["name", "value", "probability"], required: ["name"], parse: { value: "float", probability: "int" } })
    await action(event as any)
    expect(event.locals.supabaseServiceRole.insert).toHaveBeenCalledWith(expect.objectContaining({
      value: 10.5,
      probability: 75,
    }))
  })

  it("sets nullable fields to null when empty", async () => {
    const event = mockEvent({ request: { formData: () => mockFormData({ name: "Test", email: "", notes: "" }) } })
    const action = createAction("contacts", { fields: ["name", "email", "notes"], required: ["name"], nullables: ["email", "notes"] })
    await action(event as any)
    expect(event.locals.supabaseServiceRole.insert).toHaveBeenCalledWith(expect.objectContaining({
      email: null,
      notes: null,
    }))
  })
})

describe("updateAction", () => {
  it("updates record on valid input", async () => {
    const event = mockEvent({ request: { formData: () => mockFormData({ name: "Updated" }) } })
    const action = updateAction("contacts", { fields: ["name"], required: ["name"] })
    const result = await action(event as any)
    expect(result.success).toBe(true)
    expect(result.name).toBe("Updated")
  })

  it("fails on missing required field", async () => {
    const event = mockEvent({ request: { formData: () => mockFormData({ name: "" }) } })
    const action = updateAction("contacts", { fields: ["name"], required: ["name"] })
    const result = await action(event as any)
    expect(result.__isFail).toBe(true)
  })

  it("chains update with id and user_id", async () => {
    const event = mockEvent({ request: { formData: () => mockFormData({ name: "Updated" }) } })
    const action = updateAction("contacts", { fields: ["name"], required: ["name"] })
    await action(event as any)
    expect(event.locals.supabaseServiceRole.update).toHaveBeenCalled()
    expect(event.locals.supabaseServiceRole.eq).toHaveBeenCalledWith("id", "abc123")
    expect(event.locals.supabaseServiceRole.eq).toHaveBeenCalledWith("user_id", "user1")
  })

  it("redirects if no session", async () => {
    const event = mockEvent({ request: { formData: () => mockFormData({ name: "Test" }) } })
    event.locals.safeGetSession = vi.fn().mockResolvedValue({ session: null })
    const action = updateAction("contacts", { fields: ["name"], required: ["name"] })
    await expect(action(event as any)).rejects.toThrow("Redirect error")
  })

  it("parses float fields", async () => {
    const event = mockEvent({ request: { formData: () => mockFormData({ name: "Test", total: "99.99" }) } })
    const action = updateAction("quotes", { fields: ["name", "total"], required: ["name"], parse: { total: "float" } })
    await action(event as any)
    expect(event.locals.supabaseServiceRole.update).toHaveBeenCalledWith(expect.objectContaining({ total: 99.99 }))
  })
})

describe("deleteAction", () => {
  it("deletes record with valid id", async () => {
    const event = mockEvent({ request: { formData: () => mockFormData({ id: "rec1" }) } })
    const action = deleteAction("contacts")
    const result = await action(event as any)
    expect(result).toEqual({ success: true })
  })

  it("fails without id", async () => {
    const event = mockEvent({ request: { formData: () => mockFormData({}) } })
    const action = deleteAction("contacts")
    const result = await action(event as any)
    expect(result.__isFail).toBe(true)
  })

  it("redirects if no session", async () => {
    const event = mockEvent({ request: { formData: () => mockFormData({ id: "rec1" }) } })
    event.locals.safeGetSession = vi.fn().mockResolvedValue({ session: null })
    const action = deleteAction("contacts")
    await expect(action(event as any)).rejects.toThrow("Redirect error")
  })
})

describe("deleteDetailAction", () => {
  it("deletes and redirects", async () => {
    const event = mockEvent()
    const action = deleteDetailAction("contacts", "/account/crm")
    await expect(action(event as any)).rejects.toThrow("Redirect error")
    expect(event.locals.supabaseServiceRole.delete).toHaveBeenCalled()
  })

  it("fails on db error", async () => {
    const event = mockEvent()
    const supabase = event.locals.supabaseServiceRole
    supabase.delete = vi.fn().mockReturnThis()
    supabase.eq = vi.fn()
    supabase.eq.mockReturnValueOnce(supabase).mockReturnValueOnce(supabase).mockReturnValueOnce(Promise.resolve({ error: new Error("DB error") }))
    const action = deleteDetailAction("contacts", "/account/crm")
    const result = await action(event as any)
    expect(result.__isFail).toBe(true)
  })
})
