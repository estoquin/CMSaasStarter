import { _hasFullProfile } from "../+layout.js"
import { redirect } from "@sveltejs/kit"
import type { PageLoad } from "./$types"

export const load: PageLoad = async ({ parent }) => {
  const data = await parent()

  // They completed their profile! Redirect to "Select a Plan" screen.
  if (_hasFullProfile(data?.profile)) {
    redirect(303, "/account/select_plan")
  }

  return data
}
