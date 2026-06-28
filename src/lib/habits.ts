import { redirect } from "@sveltejs/kit"

export const habitsRoute = {
  root: "/account/habits",
  checkin: (bundle: string, date?: string) =>
    date ? `/account/habits?bundle=${bundle}&date=${date}` : `/account/habits?bundle=${bundle}`,
  bundles: "/account/habits/bundles",
  bundle: (id: string) => `/account/habits/bundles/${id}`,
  catalog: "/account/habits/catalog",
  habit: (id: string) => `/account/habits/catalog/${id}`,
} as const

export const loginRoute = "/login"

export async function requireOrg(
  safeGetSession: () => Promise<{ session: any; organization_id: string | null }>
) {
  const { session, organization_id } = await safeGetSession()
  if (!session) throw redirect(303, loginRoute)
  if (!organization_id) throw redirect(303, loginRoute)
  return { session, organization_id: organization_id! }
}
