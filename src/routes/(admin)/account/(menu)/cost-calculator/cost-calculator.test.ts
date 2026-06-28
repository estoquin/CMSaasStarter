import { describe, it, expect, vi, beforeEach } from "vitest"
import * as dashboardPage from "./+page.server"
import * as ingredientsListPage from "./ingredients/+page.server"
import * as componentsListPage from "./components/+page.server"
import * as purchasesListPage from "./purchases/+page.server"

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
  return {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
  }
}

function makeSession() {
  return vi.fn().mockResolvedValue({ session: { user: { id: "user1" } }, organization_id: "org1", role: "standard" })
}

function makeEvent(overrides: Record<string, any> = {}) {
  const defaults = {
    locals: {
      supabaseServiceRole: makeMockSupabase(),
      safeGetSession: makeSession(),
    },
    params: { id: "test1" },
    request: { formData: vi.fn() },
  }
  return {
    ...defaults,
    ...overrides,
    locals: { ...defaults.locals, ...(overrides.locals || {}) },
  }
}

describe("Cost Calculator dashboard (load)", () => {
  it("loads all four datasets", async () => {
    const supabase = makeMockSupabase()
    supabase.order = vi.fn().mockReturnThis()
    supabase.limit = vi.fn().mockReturnThis()
    const results = [
      { data: [{ menu_item_name: "Burger", total_cost: 5.5 }], error: null },
      { data: [{ id: "i1", name: "Cheese" }], error: null },
      { data: [{ id: "c1", name: "Patty" }], error: null },
      { data: [{ id: "p1", ingredient_id: "i1" }], error: null },
    ]
    let callCount = 0
    supabase.then = vi.fn((resolve) => resolve(results[callCount++]))
    const event = makeEvent({ locals: { supabaseServiceRole: supabase } })
    const result = await dashboardPage.load(event as any)
    expect(result.costs).toHaveLength(1)
    expect(result.ingredients).toHaveLength(1)
    expect(result.components).toHaveLength(1)
    expect(result.purchases).toHaveLength(1)
  })

  it("returns empty arrays on error", async () => {
    const supabase = makeMockSupabase()
    supabase.order = vi.fn().mockReturnThis()
    supabase.limit = vi.fn().mockReturnThis()
    const err = new Error("DB err")
    const results = Array(4).fill({ data: null, error: err })
    let callCount = 0
    supabase.then = vi.fn((resolve) => resolve(results[callCount++]))
    const event = makeEvent({ locals: { supabaseServiceRole: supabase } })
    const result = await dashboardPage.load(event as any)
    expect(result.costs).toEqual([])
    expect(result.ingredients).toEqual([])
    expect(result.components).toEqual([])
    expect(result.purchases).toEqual([])
  })

  it("redirects without session", async () => {
    const event = makeEvent({ locals: { supabaseServiceRole: makeMockSupabase(), safeGetSession: vi.fn().mockResolvedValue({ session: null, organization_id: null, role: null }) } })
    await expect(dashboardPage.load(event as any)).rejects.toThrow("Redirect error")
  })
})

describe("Cost Calculator Ingredients", () => {
  it("loads ingredients ordered by name", async () => {
    const supabase = makeMockSupabase()
    supabase.order = vi.fn().mockResolvedValue({ data: [{ id: "i1", name: "Flour", unit: "kg" }], error: null })
    const event = makeEvent({ locals: { supabaseServiceRole: supabase } })
    const result = await ingredientsListPage.load(event as any)
    expect(result.items).toHaveLength(1)
  })
})

describe("Cost Calculator Components", () => {
  it("loads components with ingredient joins", async () => {
    const supabase = makeMockSupabase()
    supabase.order = vi.fn()
      .mockResolvedValueOnce({ data: [{ id: "c1", name: "Patty", ingredients: { name: "Beef", unit: "kg" } }], error: null })
      .mockResolvedValueOnce({ data: [{ id: "i1", name: "Beef", unit: "kg" }], error: null })
    const event = makeEvent({ locals: { supabaseServiceRole: supabase } })
    const result = await componentsListPage.load(event as any)
    expect(result.items).toHaveLength(1)
    expect(result.ingredients).toHaveLength(1)
  })

  it("creates a component with valid data", async () => {
    const supabase = makeMockSupabase()
    supabase.insert = vi.fn().mockResolvedValue({ error: null })
    const fd = new FormData()
    fd.append("name", "Patty"); fd.append("unit", "pcs"); fd.append("ingredient_id", "i1")
    fd.append("ingredient_qty_used", "0.5"); fd.append("yield_per_batch", "10")
    const event = makeEvent({ locals: { supabaseServiceRole: supabase }, request: { formData: () => fd } })
    const result = await componentsListPage.actions.create(event as any)
    expect(result).toEqual({ success: true })
    expect(supabase.insert).toHaveBeenCalledWith(expect.objectContaining({ name: "Patty", ingredient_qty_used: 0.5, yield_per_batch: 10 }))
  })

  it("fails creating component without name", async () => {
    const supabase = makeMockSupabase()
    const fd = new FormData(); fd.append("unit", "pcs"); fd.append("ingredient_id", "i1")
    fd.append("ingredient_qty_used", "0.5"); fd.append("yield_per_batch", "10")
    const event = makeEvent({ locals: { supabaseServiceRole: supabase }, request: { formData: () => fd } })
    const result = await componentsListPage.actions.create(event as any)
    expect(result.__isFail).toBe(true)
  })

  it("fails creating component with zero yield", async () => {
    const supabase = makeMockSupabase()
    const fd = new FormData(); fd.append("name", "Patty"); fd.append("unit", "pcs"); fd.append("ingredient_id", "i1")
    fd.append("ingredient_qty_used", "0.5"); fd.append("yield_per_batch", "0")
    const event = makeEvent({ locals: { supabaseServiceRole: supabase }, request: { formData: () => fd } })
    const result = await componentsListPage.actions.create(event as any)
    expect(result.__isFail).toBe(true)
  })

  it("deletes a component", async () => {
    const supabase = makeMockSupabase()
    supabase.delete = vi.fn().mockReturnThis()
    supabase.eq = vi.fn()
    supabase.eq.mockReturnValueOnce(supabase).mockReturnValueOnce(supabase).mockReturnValueOnce({ error: null })
    const fd = new FormData(); fd.append("id", "c1")
    const event = makeEvent({ locals: { supabaseServiceRole: supabase }, request: { formData: () => fd } })
    const result = await componentsListPage.actions.delete(event as any)
    expect(result).toEqual({ success: true })
  })
})

describe("Cost Calculator Purchases", () => {
  it("loads purchases with ingredient joins", async () => {
    const supabase = makeMockSupabase()
    supabase.order = vi.fn()
      .mockResolvedValueOnce({ data: [{ id: "p1", ingredient_id: "i1", ingredients: { name: "Flour", unit: "kg" } }], error: null })
      .mockResolvedValueOnce({ data: [{ id: "i1", name: "Flour", unit: "kg" }], error: null })
    const event = makeEvent({ locals: { supabaseServiceRole: supabase } })
    const result = await purchasesListPage.load(event as any)
    expect(result.items).toHaveLength(1)
    expect(result.ingredients).toHaveLength(1)
  })

  it("creates a purchase with valid data", async () => {
    const supabase = makeMockSupabase()
    supabase.insert = vi.fn().mockResolvedValue({ error: null })
    const fd = new FormData()
    fd.append("ingredient_id", "i1"); fd.append("date", "2024-01-15"); fd.append("quantity_bought", "10"); fd.append("total_paid", "25.50")
    const event = makeEvent({ locals: { supabaseServiceRole: supabase }, request: { formData: () => fd } })
    const result = await purchasesListPage.actions.create(event as any)
    expect(result).toEqual({ success: true })
    expect(supabase.insert).toHaveBeenCalledWith(expect.objectContaining({ quantity_bought: 10, total_paid: 25.5 }))
  })

  it("fails creating purchase without ingredient", async () => {
    const supabase = makeMockSupabase()
    const fd = new FormData(); fd.append("quantity_bought", "10"); fd.append("total_paid", "25")
    const event = makeEvent({ locals: { supabaseServiceRole: supabase }, request: { formData: () => fd } })
    const result = await purchasesListPage.actions.create(event as any)
    expect(result.__isFail).toBe(true)
  })

  it("fails creating purchase with zero quantity", async () => {
    const supabase = makeMockSupabase()
    const fd = new FormData(); fd.append("ingredient_id", "i1"); fd.append("quantity_bought", "0"); fd.append("total_paid", "25")
    const event = makeEvent({ locals: { supabaseServiceRole: supabase }, request: { formData: () => fd } })
    const result = await purchasesListPage.actions.create(event as any)
    expect(result.__isFail).toBe(true)
  })

  it("fails creating purchase with negative total", async () => {
    const supabase = makeMockSupabase()
    const fd = new FormData(); fd.append("ingredient_id", "i1"); fd.append("quantity_bought", "5"); fd.append("total_paid", "-1")
    const event = makeEvent({ locals: { supabaseServiceRole: supabase }, request: { formData: () => fd } })
    const result = await purchasesListPage.actions.create(event as any)
    expect(result.__isFail).toBe(true)
  })
})
