import type { Actions } from "./$types"
import { listLoad, createAction, deleteAction } from "$lib/crud.server"

export const load = listLoad("accounts")

export const actions: Actions = {
  create: createAction("accounts", { fields: ["name", "email", "phone", "website", "industry", "notes"], required: ["name"], nullables: ["email", "phone", "website", "industry", "notes"] }),
  delete: deleteAction("accounts"),
}
