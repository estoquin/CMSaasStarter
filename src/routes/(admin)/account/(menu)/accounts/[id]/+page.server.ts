import type { Actions } from "./$types"
import { detailLoad, updateAction, deleteDetailAction } from "$lib/crud.server"

export const load = detailLoad("accounts")

export const actions: Actions = {
  update: updateAction("accounts", { fields: ["name", "email", "phone", "website", "industry", "status", "notes"], required: ["name"], nullables: ["email", "phone", "website", "industry", "notes"] }),
  delete: deleteDetailAction("accounts", "/account/accounts"),
}
