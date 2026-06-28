import { error, redirect } from "@sveltejs/kit"
import {
  fetchSubscription,
  getOrCreateCustomerId,
} from "../../subscription_helpers.server"
import type { PageServerLoad } from "./$types"

export const load: PageServerLoad = async ({
  locals: { safeGetSession, supabaseServiceRole },
}) => {
  const { session, user } = await safeGetSession()
  if (!session || !user?.id) {
    redirect(303, "/login")
  }

  const { error: idError, customerId } = await getOrCreateCustomerId({
    supabaseServiceRole,
    user,
  })
  if (idError || !customerId) {
    console.error("Error creating customer id", idError)
    error(500, {
      message: "Error desconocido. Si el problema persiste, contáctanos.",
    })
  }

  const {
    primarySubscription,
    hasEverHadSubscription,
    error: fetchErr,
  } = await fetchSubscription({
    customerId,
  })
  if (fetchErr) {
    console.error("Error fetching subscription", fetchErr)
    error(500, {
      message: "Error desconocido. Si el problema persiste, contáctanos.",
    })
  }

  return {
    isActiveCustomer: !!primarySubscription,
    hasEverHadSubscription,
    currentPlanId: primarySubscription?.appSubscription?.id,
  }
}
