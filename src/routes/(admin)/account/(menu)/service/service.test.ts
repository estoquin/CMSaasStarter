import { describe, it, expect, vi, beforeEach } from "vitest"
import * as mainPage from "./+page.server"
import * as contractsPage from "./contracts/+page.server"
import * as detailPage from "./[id]/+page.server"
import * as teamPage from "./team/+page.server"
import * as newPage from "../service/new/+page.server"

vi.mock("@sveltejs/kit", async () => {
  const actual = await vi.importActual("@sveltejs/kit")
  return {
    ...actual,
    fail: vi.fn().mockReturnValue({ __isFail: true }),
    redirect: vi.fn().mockImplementation(() => { throw new Error("Redirect error") }),
    error: vi.fn().mockImplementation((code: number) => { throw new Error(`Error ${code}`) }),
  }
})

function makeMockSupabase() {
  const mock = {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
  }
  return mock
}

function makeEvent(overrides: Record<string, any> = {}) {
  const supabase = makeMockSupabase()
  const defaults = {
    locals: {
      supabaseServiceRole: supabase,
      safeGetSession: vi.fn().mockResolvedValue({ session: { user: { id: "user1" } }, organization_id: "org1", role: "standard" }),
    },
    params: { id: "ticket1" },
    request: { formData: vi.fn() },
  }
  return { ...defaults, ...overrides }
}

describe("Service main page (load)", () => {
  it("loads open_tickets and service_tickets", async () => {
    const supabase = makeMockSupabase()
    supabase.order = vi.fn()
      .mockResolvedValueOnce({ data: [{ id: "1", title: "Open Ticket" }], error: null })
      .mockResolvedValueOnce({ data: [{ id: "2", title: "All Tickets" }], error: null })
    const event = makeEvent({ locals: { supabaseServiceRole: supabase, safeGetSession: vi.fn().mockResolvedValue({ session: { user: { id: "user1" } }, organization_id: "org1", role: "standard" }) } })
    const result = await mainPage.load(event as any)
    expect(result.openTickets).toHaveLength(1)
    expect(result.tickets).toHaveLength(1)
  })

  it("redirects without session", async () => {
    const event = makeEvent({ locals: { supabaseServiceRole: makeMockSupabase(), safeGetSession: vi.fn().mockResolvedValue({ session: null, organization_id: null, role: null }) } })
    await expect(mainPage.load(event as any)).rejects.toThrow("Redirect error")
  })
})

describe("Service contracts", () => {
  it("loads contracts, accounts, and slas", async () => {
    const supabase = makeMockSupabase()
    supabase.order = vi.fn()
      .mockResolvedValueOnce({ data: [{ id: "c1", account_id: "a1" }], error: null })
      .mockResolvedValueOnce({ data: [{ id: "a1", name: "Acme" }], error: null })
      .mockResolvedValueOnce({ data: [{ id: "s1", name: "Standard" }], error: null })
    const event = makeEvent({ locals: { supabaseServiceRole: supabase, safeGetSession: vi.fn().mockResolvedValue({ session: { user: { id: "user1" } }, organization_id: "org1", role: "standard" }) } })
    const result = await contractsPage.load(event as any)
    expect(result.contracts).toHaveLength(1)
    expect(result.accounts).toHaveLength(1)
    expect(result.slas).toHaveLength(1)
  })

  it("creates a contract with valid data", async () => {
    const supabase = makeMockSupabase()
    supabase.insert = vi.fn().mockResolvedValue({ error: null })
    const fd = new FormData()
    fd.append("account_id", "a1"); fd.append("sla_id", "s1"); fd.append("start_date", "2024-01-01")
    const event = makeEvent({ locals: { supabaseServiceRole: supabase, safeGetSession: vi.fn().mockResolvedValue({ session: { user: { id: "user1" } }, organization_id: "org1", role: "standard" }) }, request: { formData: () => fd } })
    const result = await contractsPage.actions.create(event as any)
    expect(result).toEqual({ success: true })
    expect(supabase.insert).toHaveBeenCalledWith(expect.objectContaining({ account_id: "a1", sla_id: "s1" }))
  })

  it("fails creating contract without required fields", async () => {
    const supabase = makeMockSupabase()
    const fd = new FormData()
    const event = makeEvent({ locals: { supabaseServiceRole: supabase, safeGetSession: vi.fn().mockResolvedValue({ session: { user: { id: "user1" } }, organization_id: "org1", role: "standard" }) }, request: { formData: () => fd } })
    const result = await contractsPage.actions.create(event as any)
    expect(result.__isFail).toBe(true)
  })
})

describe("Service ticket detail", () => {
  it("loads ticket summary with comments, time logs, invoices", async () => {
    const supabase = makeMockSupabase()
    supabase.single = vi.fn().mockResolvedValue({ data: { id: "ticket1", title: "Test Ticket" }, error: null })
    supabase.order = vi.fn()
      .mockResolvedValueOnce({ data: [{ id: "c1", body: "Comment" }], error: null })
      .mockResolvedValueOnce({ data: [{ id: "t1", minutes: 30 }], error: null })
    supabase.maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null })
    const event = makeEvent({ locals: { supabaseServiceRole: supabase, safeGetSession: vi.fn().mockResolvedValue({ session: { user: { id: "user1" } }, organization_id: "org1", role: "standard" }) } })
    const result = await detailPage.load(event as any)
    expect(result.ticket.title).toBe("Test Ticket")
    expect(result.comments).toHaveLength(1)
    expect(result.timeLogs).toHaveLength(1)
  })

  it("throws 404 when ticket not found", async () => {
    const supabase = makeMockSupabase()
    supabase.single = vi.fn().mockResolvedValue({ data: null, error: new Error("Not found") })
    const event = makeEvent({ locals: { supabaseServiceRole: supabase, safeGetSession: vi.fn().mockResolvedValue({ session: { user: { id: "user1" } }, organization_id: "org1", role: "standard" }) } })
    await expect(detailPage.load(event as any)).rejects.toThrow("Error 404")
  })

  it("updates ticket status", async () => {
    const supabase = makeMockSupabase()
    supabase.update = vi.fn().mockReturnThis()
    supabase.eq = vi.fn().mockReturnThis()
    supabase.then = vi.fn((resolve: any) => resolve({ error: null }))
    const fd = new FormData(); fd.append("status", "resolved")
    const event = makeEvent({ locals: { supabaseServiceRole: supabase, safeGetSession: vi.fn().mockResolvedValue({ session: { user: { id: "user1" } }, organization_id: "org1", role: "standard" }) }, request: { formData: () => fd } })
    const result = await detailPage.actions.updateStatus(event as any)
    expect(result).toEqual({ success: true })
    expect(supabase.update).toHaveBeenCalledWith(expect.objectContaining({ status: "resolved", closed_at: expect.any(String) }))
  })

  it("adds a comment", async () => {
    const supabase = makeMockSupabase()
    supabase.insert = vi.fn().mockResolvedValue({ error: null })
    const fd = new FormData(); fd.append("body", "Test comment"); fd.append("is_internal", "false")
    const event = makeEvent({ locals: { supabaseServiceRole: supabase, safeGetSession: vi.fn().mockResolvedValue({ session: { user: { id: "user1" } }, organization_id: "org1", role: "standard" }) }, request: { formData: () => fd } })
    const result = await detailPage.actions.addComment(event as any)
    expect(result.commentSuccess).toBe(true)
  })

  it("fails adding empty comment", async () => {
    const supabase = makeMockSupabase()
    const fd = new FormData(); fd.append("body", "")
    const event = makeEvent({ locals: { supabaseServiceRole: supabase, safeGetSession: vi.fn().mockResolvedValue({ session: { user: { id: "user1" } }, organization_id: "org1", role: "standard" }) }, request: { formData: () => fd } })
    const result = await detailPage.actions.addComment(event as any)
    expect(result.__isFail).toBe(true)
  })

  it("logs time", async () => {
    const supabase = makeMockSupabase()
    supabase.insert = vi.fn().mockResolvedValue({ error: null })
    const fd = new FormData(); fd.append("minutes", "45"); fd.append("note", "Work done")
    const event = makeEvent({ locals: { supabaseServiceRole: supabase, safeGetSession: vi.fn().mockResolvedValue({ session: { user: { id: "user1" } }, organization_id: "org1", role: "standard" }) }, request: { formData: () => fd } })
    const result = await detailPage.actions.logTime(event as any)
    expect(result.timeSuccess).toBe(true)
  })

  it("fails logging time with zero minutes", async () => {
    const supabase = makeMockSupabase()
    const fd = new FormData(); fd.append("minutes", "0")
    const event = makeEvent({ locals: { supabaseServiceRole: supabase, safeGetSession: vi.fn().mockResolvedValue({ session: { user: { id: "user1" } }, organization_id: "org1", role: "standard" }) }, request: { formData: () => fd } })
    const result = await detailPage.actions.logTime(event as any)
    expect(result.__isFail).toBe(true)
  })

  it("creates invoice", async () => {
    const supabase = makeMockSupabase()
    supabase.insert = vi.fn().mockResolvedValue({ error: null })
    const fd = new FormData(); fd.append("amount", "250")
    const event = makeEvent({ locals: { supabaseServiceRole: supabase, safeGetSession: vi.fn().mockResolvedValue({ session: { user: { id: "user1" } }, organization_id: "org1", role: "standard" }) }, request: { formData: () => fd } })
    const result = await detailPage.actions.createInvoice(event as any)
    expect(result.invoiceSuccess).toBe(true)
  })

  it("fails creating invoice with zero amount", async () => {
    const supabase = makeMockSupabase()
    const fd = new FormData(); fd.append("amount", "0")
    const event = makeEvent({ locals: { supabaseServiceRole: supabase, safeGetSession: vi.fn().mockResolvedValue({ session: { user: { id: "user1" } }, organization_id: "org1", role: "standard" }) }, request: { formData: () => fd } })
    const result = await detailPage.actions.createInvoice(event as any)
    expect(result.__isFail).toBe(true)
  })
})

describe("Service team page (load)", () => {
  it("loads agent workload", async () => {
    const supabase = makeMockSupabase()
    supabase.order = vi.fn().mockResolvedValue({ data: [{ agent_name: "Alice", open_tickets: 3 }], error: null })
    const event = makeEvent({ locals: { supabaseServiceRole: supabase, safeGetSession: vi.fn().mockResolvedValue({ session: { user: { id: "user1" } }, organization_id: "org1", role: "standard" }) } })
    const result = await teamPage.load(event as any)
    expect(result.workload).toHaveLength(1)
  })

  it("returns empty on error", async () => {
    const supabase = makeMockSupabase()
    supabase.order = vi.fn().mockResolvedValue({ data: null, error: new Error("DB error") })
    const event = makeEvent({ locals: { supabaseServiceRole: supabase, safeGetSession: vi.fn().mockResolvedValue({ session: { user: { id: "user1" } }, organization_id: "org1", role: "standard" }) } })
    const result = await teamPage.load(event as any)
    expect(result.workload).toEqual([])
  })
})

describe("Service new ticket page (actions)", () => {
  it("creates a ticket and assigns to user", async () => {
    const supabase = makeMockSupabase()
    supabase.select = vi.fn().mockReturnThis()
    supabase.order = vi.fn().mockResolvedValue({ data: [], error: null })
    supabase.single = vi.fn().mockResolvedValue({ data: { id: "new-ticket-1" }, error: null })
    supabase.insert = vi.fn()
    supabase.insert.mockReturnValueOnce({ select: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: { id: "new-ticket-1" }, error: null }) }) })
    supabase.insert.mockReturnValueOnce({ error: null })
    const fd = new FormData()
    fd.append("title", "Test Ticket"); fd.append("account_id", "a1"); fd.append("description", "Desc"); fd.append("contact_id", "c1"); fd.append("priority", "high"); fd.append("category", "bug")
    const event = makeEvent({
      locals: { supabaseServiceRole: supabase, safeGetSession: vi.fn().mockResolvedValue({ session: { user: { id: "user1" } }, organization_id: "org1", role: "standard" }) },
      params: {},
      request: { formData: () => fd },
    })
    await expect(newPage.actions.create(event as any)).rejects.toThrow("Redirect error")
    expect(supabase.insert).toHaveBeenCalledWith(expect.objectContaining({ title: "Test Ticket" }))
  })

  it("fails creating ticket without title", async () => {
    const supabase = makeMockSupabase()
    const fd = new FormData(); fd.append("account_id", "a1")
    const event = makeEvent({
      locals: { supabaseServiceRole: supabase, safeGetSession: vi.fn().mockResolvedValue({ session: { user: { id: "user1" } }, organization_id: "org1", role: "standard" }) },
      params: {},
      request: { formData: () => fd },
    })
    const result = await newPage.actions.create(event as any)
    expect(result.__isFail).toBe(true)
  })
})
