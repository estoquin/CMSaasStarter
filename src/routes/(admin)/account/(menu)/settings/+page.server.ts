import { error, redirect } from "@sveltejs/kit"
import { fetchSubscription, getOrCreateCustomerId } from "../../subscription_helpers.server"
import type { PageServerLoad } from "./$types"

export const load: PageServerLoad = async ({ locals: { safeGetSession, supabaseServiceRole } }) => {
  const { session, user } = await safeGetSession()
  if (!session || !user?.id) redirect(303, "/login")

  let isActiveCustomer = false
  let hasEverHadSubscription = false
  let currentPlanId: string | undefined

  const { error: idError, customerId } = await getOrCreateCustomerId({ supabaseServiceRole, user })
  if (!idError && customerId) {
    const sub = await fetchSubscription({ customerId })
    isActiveCustomer = !!sub.primarySubscription
    hasEverHadSubscription = sub.hasEverHadSubscription ?? false
    currentPlanId = sub.primarySubscription?.appSubscription?.id
    if (sub.error) console.error("Error fetching subscription", sub.error)
  }

  const { data: profile } = await supabaseServiceRole.from("profiles").select("*").eq("id", user.id).single()

  return {
    profile,
    user,
    isActiveCustomer,
    hasEverHadSubscription,
    currentPlanId,
  }
}
